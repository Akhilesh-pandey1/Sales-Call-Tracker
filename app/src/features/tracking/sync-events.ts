export type CallFilledListener = () => void;

const callFilledListeners = new Set<CallFilledListener>();

export function subscribeToCallFilled(listener: CallFilledListener): () => void {
  callFilledListeners.add(listener);
  const unsubscribe = () => {
    callFilledListeners.delete(listener);
  };
  return unsubscribe;
}

export function emitCallFilled(): void {
  for (const listener of callFilledListeners) {
    listener();
  }
}
