export function buildCallKey(phoneNumber: string, callAt: string): string {
  const callKeySeparator = '|';
  const callKey = `${phoneNumber}${callKeySeparator}${callAt}`;
  return callKey;
}
