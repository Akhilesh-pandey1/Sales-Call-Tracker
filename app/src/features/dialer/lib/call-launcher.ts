import { Linking, PermissionsAndroid } from 'react-native';
import intentLauncher, { IntentConstant } from 'react-native-intent-launcher';
import { directCallStartTimeoutMs } from '@/config/app-config';
import { insertPendingCall } from '@/features/tracking';

const callFailedMessage = 'Could not start the call. Please try again.';

type LaunchedCall = {
  callId: string;
  phoneNumber: string;
};

function createCallId(): string {
  const callId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return callId;
}

function rejectAfterTimeout(
  timeoutMs: number,
  timeoutMessage: string,
): Promise<never> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });
  return timeoutPromise;
}

async function launchTrackedCall(phoneNumber: string): Promise<LaunchedCall | null> {
  const e164PhonePattern = /^\+[1-9]\d{6,14}$/;
  if (!e164PhonePattern.test(phoneNumber)) {
    throw new Error('Phone number is not a valid E.164 number.');
  }
  const telUrl = `tel:${phoneNumber}`;
  const isCallPermissionGranted = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.CALL_PHONE,
  );
  if (!isCallPermissionGranted) {
    await Linking.openURL(telUrl);
    return null;
  }
  const intentAt = new Date().toISOString();
  const callId = createCallId();
  await insertPendingCall(callId, phoneNumber, intentAt);
  const directCallParams = {
    action: IntentConstant.ACTION_CALL,
    data: telUrl,
  };
  const directCallTimeoutMessage = 'Starting the call took too long.';
  const startActivityPromise = intentLauncher.startActivity(directCallParams);
  const startActivityTimeoutPromise = rejectAfterTimeout(
    directCallStartTimeoutMs,
    directCallTimeoutMessage,
  );
  await Promise.race([startActivityPromise, startActivityTimeoutPromise]);
  const launchedCall: LaunchedCall = { callId, phoneNumber };
  return launchedCall;
}

export { callFailedMessage, launchTrackedCall };
export type { LaunchedCall };
