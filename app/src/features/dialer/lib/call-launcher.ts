import { PermissionsAndroid, ToastAndroid } from 'react-native';
import intentLauncher, { IntentConstant } from 'react-native-intent-launcher';
import { directCallStartTimeoutMs } from '@/config/app-config';
import { insertPendingCall } from '@/features/tracking';
import { createCallId } from '@/shared/utils/call-id';

type LaunchedCall = {
  callId: string;
  phoneNumber: string;
};

async function raceWithTimeout<T>(
  operation: Promise<T>,
  timeoutMessage: string,
): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(
      () => reject(new Error(timeoutMessage)),
      directCallStartTimeoutMs,
    );
  });
  try {
    const racedResult = await Promise.race([operation, timeoutPromise]);
    return racedResult;
  } finally {
    if (timeoutHandle !== undefined) {
      clearTimeout(timeoutHandle);
    }
  }
}

async function recordPendingCall(phoneNumber: string): Promise<LaunchedCall> {
  const intentAt = new Date().toISOString();
  const callId = createCallId();
  await insertPendingCall(callId, phoneNumber, intentAt);
  const launchedCall: LaunchedCall = { callId, phoneNumber };
  return launchedCall;
}

async function startDefaultSimCall(phoneNumber: string): Promise<LaunchedCall> {
  const callStartTimeoutMessage = 'Starting the call took too long.';
  const launchedCall = await recordPendingCall(phoneNumber);
  const directCallParams = {
    action: IntentConstant.ACTION_CALL,
    data: `tel:${phoneNumber}`,
  };
  const startActivityPromise = intentLauncher.startActivity(directCallParams);
  await raceWithTimeout(startActivityPromise, callStartTimeoutMessage);
  return launchedCall;
}

function showCallLaunchErrorToast(): void {
  const callFailedMessage = 'Could not start the call. Please try again.';
  ToastAndroid.show(callFailedMessage, ToastAndroid.SHORT);
}

async function launchTrackedCall(
  phoneNumber: string,
): Promise<LaunchedCall | null> {
  const e164PhonePattern = /^\+[1-9]\d{6,14}$/;
  if (!e164PhonePattern.test(phoneNumber)) {
    throw new Error('Phone number is not a valid E.164 number.');
  }
  const isCallPermissionGranted = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.CALL_PHONE,
  );
  if (!isCallPermissionGranted) {
    const dialIntentParams = {
      action: IntentConstant.ACTION_DIAL,
      data: `tel:${phoneNumber}`,
    };
    await intentLauncher.startActivity(dialIntentParams);
    const noLaunchedCall = null;
    return noLaunchedCall;
  }
  const defaultSimCall = await startDefaultSimCall(phoneNumber);
  return defaultSimCall;
}

export { launchTrackedCall, showCallLaunchErrorToast };
export type { LaunchedCall };
