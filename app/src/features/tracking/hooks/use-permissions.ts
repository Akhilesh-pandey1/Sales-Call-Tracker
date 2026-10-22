import { useCallback, useEffect, useState } from 'react';
import {
  AppState,
  PermissionsAndroid,
  type AppStateStatus,
  type Permission,
} from 'react-native';
import { requestPermissionIfMissing } from '@/shared/utils/phone-permissions';
import { ensureRemindersAreReady } from '../lib/reminder-settings';

export async function findMissingPermissions(): Promise<Permission[]> {
  const requiredCallPermissions: Permission[] = [
    PermissionsAndroid.PERMISSIONS.CALL_PHONE,
    PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
    PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
  ];
  const missingPermissions: Permission[] = [];
  for (const permission of requiredCallPermissions) {
    const isPermissionGranted = await PermissionsAndroid.check(permission);
    if (!isPermissionGranted) {
      missingPermissions.push(permission);
    }
  }
  return missingPermissions;
}

export async function requestCallPermissionsStepwise(
  permissions: Permission[],
): Promise<Permission[]> {
  const stillMissingPermissions: Permission[] = [];
  for (const permission of permissions) {
    const isPermissionGranted = await requestPermissionIfMissing(permission);
    if (!isPermissionGranted) {
      stillMissingPermissions.push(permission);
    }
  }
  return stillMissingPermissions;
}

export function usePermissions(): Permission[] {
  const [missingPermissions, setMissingPermissions] = useState<Permission[]>([]);

  const checkMissingPermissions = useCallback(async (): Promise<void> => {
    const foundMissingPermissions = await findMissingPermissions();
    setMissingPermissions(foundMissingPermissions);
  }, []);

  const requestMissingPermissions = useCallback(async (): Promise<void> => {
    const missingPermissionsBeforeRequest = await findMissingPermissions();
    setMissingPermissions(missingPermissionsBeforeRequest);
    const missingPermissionsAfterRequest = await requestCallPermissionsStepwise(
      missingPermissionsBeforeRequest,
    );
    setMissingPermissions(missingPermissionsAfterRequest);
    await ensureRemindersAreReady();
  }, []);

  useEffect(() => {
    requestMissingPermissions();
  }, [requestMissingPermissions]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkMissingPermissions();
      }
    };
    const stateSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => stateSubscription.remove();
  }, [checkMissingPermissions]);

  return missingPermissions;
}
