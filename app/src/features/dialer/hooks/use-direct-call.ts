import { useCallback, useRef, useState } from 'react';
import { ToastAndroid } from 'react-native';
import { readStoredCountry } from '@/features/auth';
import {
  isValidPhoneNumber,
  normalizePhoneNumber,
} from '@/shared/utils/phone-formatter';
import { bookNumberWhenScheduled } from '../lib/book-number-when-scheduled';
import {
  launchTrackedCall,
  showCallLaunchErrorToast,
  type LaunchedCall,
} from '../lib/call-launcher';
import {
  useTrackedCall,
  type UseTrackedCallResult,
} from './use-tracked-call';
import type { PostCallSubmitData } from '../types';

export type UseDirectCallResult = UseTrackedCallResult & {
  isDialing: boolean;
  startDirectCall: (phoneNumber: string) => Promise<void>;
  submitDirectCall: (submitData: PostCallSubmitData) => Promise<void>;
};

export function useDirectCall(): UseDirectCallResult {
  const [isDialing, setIsDialing] = useState(false);
  const isDialInFlightRef = useRef(false);
  const trackedCallFlow = useTrackedCall();
  const {
    trackLaunchedCall,
    closePostCallDialog,
    submitTrackedCall,
  } = trackedCallFlow;

  const startDirectCall = useCallback(
    async (phoneNumber: string): Promise<void> => {
      if (isDialInFlightRef.current) {
        return;
      }
      isDialInFlightRef.current = true;
      setIsDialing(true);
      try {
        const countryCode = await readStoredCountry();
        if (
          countryCode === null ||
          !isValidPhoneNumber(phoneNumber, countryCode)
        ) {
          const numberNotDialableMessage = "This number can't be dialed.";
          ToastAndroid.show(numberNotDialableMessage, ToastAndroid.SHORT);
          return;
        }
        const normalizedPhoneNumber = normalizePhoneNumber(
          phoneNumber,
          countryCode,
        );
        const launchedCall = await launchTrackedCall(normalizedPhoneNumber);
        trackLaunchedCall(launchedCall);
      } catch {
        showCallLaunchErrorToast();
      } finally {
        isDialInFlightRef.current = false;
        setIsDialing(false);
      }
    },
    [trackLaunchedCall],
  );

  const submitDirectCall = useCallback(
    async (submitData: PostCallSubmitData): Promise<void> => {
      const scheduledAt = submitData.scheduledAt;
      const finishDirectCall = async (
        launchedCall: LaunchedCall | null,
        scheduleWasRefused: boolean,
      ): Promise<void> => {
        await bookNumberWhenScheduled(launchedCall, scheduledAt, scheduleWasRefused);
        closePostCallDialog();
      };
      await submitTrackedCall(submitData, finishDirectCall);
    },
    [closePostCallDialog, submitTrackedCall],
  );

  const directCall: UseDirectCallResult = {
    ...trackedCallFlow,
    isDialing,
    startDirectCall,
    submitDirectCall,
  };
  return directCall;
}
