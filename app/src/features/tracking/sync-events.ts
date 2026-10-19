type SyncListener = () => void;

type SyncEvent = {
  subscribe: (listener: SyncListener) => () => void;
  emit: () => void;
};

function createSyncEvent(): SyncEvent {
  const listeners = new Set<SyncListener>();
  const syncEvent: SyncEvent = {
    subscribe(listener: SyncListener): () => void {
      listeners.add(listener);
      const unsubscribe = () => {
        listeners.delete(listener);
      };
      return unsubscribe;
    },
    emit(): void {
      for (const listener of listeners) {
        listener();
      }
    },
  };
  return syncEvent;
}

const callEndedEvent = createSyncEvent();

export const subscribeToCallEnded: (listener: SyncListener) => () => void =
  callEndedEvent.subscribe;
export const emitCallEnded: () => void = callEndedEvent.emit;
