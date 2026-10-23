import { NativeModules } from 'react-native';

type BatteryNativeModule = {
  isBatteryOptimizationEnabled(): Promise<boolean>;
  requestIgnoreBatteryOptimization(): Promise<boolean>;
};

const missingModuleMessage =
  'Battery settings are not available on this phone.';

function readBatteryNativeModule(): BatteryNativeModule {
  const nativeModule = NativeModules.Battery as BatteryNativeModule | undefined;
  if (!nativeModule) {
    throw new Error(missingModuleMessage);
  }
  return nativeModule;
}

export async function isBatteryOptimizationEnabled(): Promise<boolean> {
  const isEnabled: boolean =
    await readBatteryNativeModule().isBatteryOptimizationEnabled();
  return isEnabled;
}

export async function requestIgnoreBatteryOptimization(): Promise<boolean> {
  const wasRequestOpened: boolean =
    await readBatteryNativeModule().requestIgnoreBatteryOptimization();
  return wasRequestOpened;
}
