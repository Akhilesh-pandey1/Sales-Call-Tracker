import { useCallback, useRef, useState } from 'react';
import { findPreCallNote } from '../lib/find-pre-call-note';

export type PendingNotesCall = {
  phoneNumber: string;
  note: string;
};

export type UsePreCallNotesResult = {
  pendingNotesCall: PendingNotesCall | null;
  requestCallWithNotes: (phoneNumber: string) => Promise<void>;
  confirmNotesCall: () => Promise<void>;
  cancelNotesCall: () => void;
};

export function usePreCallNotes(
  dialPhoneNumber: (phoneNumber: string) => Promise<void>,
): UsePreCallNotesResult {
  const [pendingNotesCall, setPendingNotesCall] =
    useState<PendingNotesCall | null>(null);
  const pendingNotesCallRef = useRef<PendingNotesCall | null>(null);

  const holdCallForNotes = useCallback(
    (notesCall: PendingNotesCall): void => {
      pendingNotesCallRef.current = notesCall;
      setPendingNotesCall(notesCall);
    },
    [],
  );

  const requestCallWithNotes = useCallback(
    async (phoneNumber: string): Promise<void> => {
      const preCallNote = await findPreCallNote(phoneNumber);
      if (preCallNote === null) {
        await dialPhoneNumber(phoneNumber);
        return;
      }
      const notesCall: PendingNotesCall = { phoneNumber, note: preCallNote };
      holdCallForNotes(notesCall);
    },
    [dialPhoneNumber, holdCallForNotes],
  );

  const clearPendingNotesCall = useCallback((): void => {
    pendingNotesCallRef.current = null;
    setPendingNotesCall(null);
  }, []);

  const confirmNotesCall = useCallback(async (): Promise<void> => {
    const notesCallToDial = pendingNotesCallRef.current;
    if (notesCallToDial === null) {
      return;
    }
    clearPendingNotesCall();
    await dialPhoneNumber(notesCallToDial.phoneNumber);
  }, [clearPendingNotesCall, dialPhoneNumber]);

  const cancelNotesCall = useCallback((): void => {
    clearPendingNotesCall();
  }, [clearPendingNotesCall]);

  const preCallNotes: UsePreCallNotesResult = {
    pendingNotesCall,
    requestCallWithNotes,
    confirmNotesCall,
    cancelNotesCall,
  };
  return preCallNotes;
}
