import { useCallback, useEffect, useState } from 'react';
import {
  AppState,
  PermissionsAndroid,
  type AppStateStatus,
  type Permission,
} from 'react-native';

export const findMissingPermissions = async (): Promise<Permission[]> => {
  const requiredCallPermissions: Permission[] = [
    PermissionsAndroid.PERMISSIONS.CALL_PHONE,
    PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
    PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
  ];
  const checkResults = await Promise.all(
    requiredCallPermissions.map(async permission => ({
      permission,
      isGranted: await PermissionsAndroid.check(permission),
    })),
  );
  const missingPermissions = checkResults
    .filter(checkResult => !checkResult.isGranted)
    .map(checkResult => checkResult.permission);
  return missingPermissions;
};

export function usePermissions(): Permission[] {
  const [missingPermissions, setMissingPermissions] = useState<Permission[]>([]);

  const checkMissingPermissions = useCallback(async (): Promise<void> => {
    const missing = await findMissingPermissions();
    setMissingPermissions(missing);
  }, []);

  const requestMissingPermissions = useCallback(async (): Promise<void> => {
    const missing = await findMissingPermissions();
    setMissingPermissions(missing);
    if (missing.length === 0) {
      return;
    }
    const requestResults = await PermissionsAndroid.requestMultiple(missing);
    const stillMissingPermissions = missing.filter(
      permission => requestResults[permission] !== 'granted',
    );
    setMissingPermissions(stillMissingPermissions);
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
