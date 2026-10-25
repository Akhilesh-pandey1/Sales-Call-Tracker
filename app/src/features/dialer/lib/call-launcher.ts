import {
  PermissionsAndroid,
  Platform,
  ToastAndroid,
} from 'react-native';
import intentLauncher, { IntentConstant } from 'react-native-intent-launcher';
import { directCallStartTimeoutMs } from '@/config/app-config';
import { insertPendingCall } from '@/features/tracking';
import { placeCallOnSim } from '@/shared/api/sim-module';
import { createCallId } from '@/shared/utils/call-id';
import { readChosenSimSlot } from '@/shared/utils/calling-sim';

const callFailedMessage = 'Could not start the call. Please try again.';
const directCallTimeoutMessage = 'Starting the call took too long.';
const simNotAvailableMessage = 'Could not place the call on this SIM.';
const simSlotUnavailableErrorCode = 'SIM_SLOT_NOT_FOUND';

type LaunchedCall = {
  callId: string;
  phoneNumber: string;
};

type NativeCallError = Error & { code?: string };

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
  const launchedCall = await recordPendingCall(phoneNumber);
  const directCallParams = {
    action: IntentConstant.ACTION_CALL,
    data: `tel:${phoneNumber}`,
  };
  const startActivityPromise = intentLauncher.startActivity(directCallParams);
  await raceWithTimeout(startActivityPromise, directCallTimeoutMessage);
  return launchedCall;
}

async function startCallOnChosenSim(
  phoneNumber: string,
  chosenSimSlot: number,
): Promise<LaunchedCall> {
  const placementPromise = placeCallOnSim(phoneNumber, chosenSimSlot);
  const wasCallPlaced = await raceWithTimeout(
    placementPromise,
    directCallTimeoutMessage,
  );
  if (!wasCallPlaced) {
    throw new Error(callFailedMessage);
  }
  const launchedCall = await recordPendingCall(phoneNumber);
  return launchedCall;
}

function isSimSlotUnavailable(caughtError: unknown): boolean {
  if (!(caughtError instanceof Error)) {
    return false;
  }
  const nativeCallError = caughtError as NativeCallError;
  const matchesNativeSlotNotFoundCode =
    nativeCallError.code === simSlotUnavailableErrorCode;
  return matchesNativeSlotNotFoundCode;
}

function readCallLaunchErrorMessage(caughtError: unknown): string {
  if (isSimSlotUnavailable(caughtError)) {
    return simNotAvailableMessage;
  }
  return callFailedMessage;
}

function showCallLaunchErrorToast(caughtError: unknown): void {
  const launchErrorMessage = readCallLaunchErrorMessage(caughtError);
  ToastAndroid.show(launchErrorMessage, ToastAndroid.SHORT);
}

async function launchTrackedCall(phoneNumber: string): Promise<LaunchedCall | null> {
  const e164PhonePattern = /^\+[1-9]\d{6,14}$/;
  if (!e164PhonePattern.test(phoneNumber)) {
    throw new Error('Phone number is not a valid E.164 number.');
  }
  const [isCallPermissionGranted, chosenSimSlot] = await Promise.all([
    PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CALL_PHONE),
    readChosenSimSlot(),
  ]);
  if (!isCallPermissionGranted) {
    const dialIntentParams = {
      action: IntentConstant.ACTION_DIAL,
      data: `tel:${phoneNumber}`,
    };
    await intentLauncher.startActivity(dialIntentParams);
    const noLaunchedCall = null;
    return noLaunchedCall;
  }
  const minimumAndroidApiLevelForSimChoice = 26;
  const isSimChoiceSupportedByDevice =
    Platform.OS === 'android' &&
    Platform.Version >= minimumAndroidApiLevelForSimChoice;
  if (chosenSimSlot === null || !isSimChoiceSupportedByDevice) {
    const defaultSimCall = await startDefaultSimCall(phoneNumber);
    return defaultSimCall;
  }
  const chosenSimCall = await startCallOnChosenSim(phoneNumber, chosenSimSlot);
  return chosenSimCall;
}

export { launchTrackedCall, showCallLaunchErrorToast };
export type { LaunchedCall };
