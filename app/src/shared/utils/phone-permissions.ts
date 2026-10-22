import { PermissionsAndroid, type Permission } from 'react-native';

export async function requestPermissionIfMissing(
  permission: Permission,
): Promise<boolean> {
  const isPermissionAlreadyGranted = await PermissionsAndroid.check(permission);
  if (isPermissionAlreadyGranted) {
    return true;
  }
  const requestResult = await PermissionsAndroid.request(permission);
  const isPermissionGranted = requestResult === PermissionsAndroid.RESULTS.GRANTED;
  return isPermissionGranted;
}
