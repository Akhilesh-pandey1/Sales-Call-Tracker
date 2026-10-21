export function createCallId(): string {
  const callId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return callId;
}
