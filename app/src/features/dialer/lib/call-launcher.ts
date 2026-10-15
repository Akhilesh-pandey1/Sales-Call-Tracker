import { Linking, PermissionsAndroid } from 'react-native';
import { insertPendingCall } from '@/features/tracking/db';

const callFailedMessage = 'Could not start the call. Please try again.';

function createCallId(): string {
  const callId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return callId;
}

async function launchTrackedCall(phoneNumber: string): Promise<void> {
  const e164PhonePattern = /^\+[1-9]\d{6,14}$/;
  if (!e164PhonePattern.test(phoneNumber)) {
    throw new Error('Phone number is not a valid E.164 number.');
  }
  const telUrl = `tel:${phoneNumber}`;
  const isCallPermissionGranted = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.CALL_PHONE,
  );
  if (isCallPermissionGranted) {
    const intentAt = new Date().toISOString();
    const callId = createCallId();
    await insertPendingCall(callId, phoneNumber, intentAt);
  }
  await Linking.openURL(telUrl);
}

export { callFailedMessage, launchTrackedCall };
