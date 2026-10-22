import {
  Linking,
  PermissionsAndroid,
  Platform,
  ToastAndroid,
} from 'react-native';
import intentLauncher, { IntentConstant } from 'react-native-intent-launcher';
import { directCallStartTimeoutMs } from '@/config/app-config';
import { readStoredCountry } from '@/features/auth';
import { insertPendingCall } from '@/features/tracking';
import { placeCallOnMatchingSim, readSimCards } from '@/shared/api/sim-module';
import { createCallId } from '@/shared/utils/call-id';
import {
  findMatchingSimNumber,
  readChosenCallingNumber,
} from '@/shared/utils/calling-sim';

const callFailedMessage = 'Could not start the call. Please try again.';
const directCallTimeoutMessage = 'Starting the call took too long.';
const simNotInPhoneMessage = 'This SIM number is not in the phone.';
const simNotFoundErrorCode = 'SIM_NUMBER_NOT_FOUND';

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
  chosenNumber: string,
): Promise<LaunchedCall> {
  const [countryCode, simCards] = await Promise.all([
    readStoredCountry(),
    readSimCards(),
  ]);
  const simNumberList = simCards.map(simCard => simCard.number);
  const matchingSimNumber =
    countryCode === null
      ? null
      : findMatchingSimNumber(simNumberList, chosenNumber, countryCode);
  if (matchingSimNumber === null) {
    throw new Error(simNotInPhoneMessage);
  }
  const placementPromise = placeCallOnMatchingSim(
    phoneNumber,
    matchingSimNumber,
  );
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

function isSimNumberNotInPhone(caughtError: unknown): boolean {
  if (!(caughtError instanceof Error)) {
    return false;
  }
  const nativeCallError = caughtError as NativeCallError;
  const matchesNativeNotFoundCode =
    nativeCallError.code === simNotFoundErrorCode;
  const matchesMandatedMessage = caughtError.message === simNotInPhoneMessage;
  return matchesNativeNotFoundCode || matchesMandatedMessage;
}

function readCallLaunchErrorMessage(caughtError: unknown): string {
  if (isSimNumberNotInPhone(caughtError)) {
    return simNotInPhoneMessage;
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
  const [isCallPermissionGranted, chosenNumber] = await Promise.all([
    PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CALL_PHONE),
    readChosenCallingNumber(),
  ]);
  if (!isCallPermissionGranted) {
    await Linking.openURL(`tel:${phoneNumber}`);
    const noLaunchedCall = null;
    return noLaunchedCall;
  }
  const minimumAndroidApiLevelForSimChoice = 26;
  const isSimChoiceSupportedByDevice =
    Platform.OS === 'android' &&
    Platform.Version >= minimumAndroidApiLevelForSimChoice;
  if (chosenNumber === null || !isSimChoiceSupportedByDevice) {
    const defaultSimCall = await startDefaultSimCall(phoneNumber);
    return defaultSimCall;
  }
  const chosenSimCall = await startCallOnChosenSim(phoneNumber, chosenNumber);
  return chosenSimCall;
}

export { launchTrackedCall, showCallLaunchErrorToast };
export type { LaunchedCall };
