type EventListener<Payload> = (payload: Payload) => void;

interface AppEvent<Payload> {
  subscribe: (listener: EventListener<Payload>) => () => void;
  emit: (payload: Payload) => void;
}

function createAppEvent<Payload>(): AppEvent<Payload> {
  const listeners = new Set<EventListener<Payload>>();
  const appEvent: AppEvent<Payload> = {
    subscribe(listener: EventListener<Payload>): () => void {
      listeners.add(listener);
      const unsubscribe = () => {
        listeners.delete(listener);
      };
      return unsubscribe;
    },
    emit(payload: Payload): void {
      for (const listener of listeners) {
        listener(payload);
      }
    },
  };
  return appEvent;
}

export { createAppEvent };
