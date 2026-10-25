import { Alert, NativeModules, Platform } from 'react-native';
import intentLauncher, { IntentConstant } from 'react-native-intent-launcher';
import {
  readWasTappedNumberRefused,
  saveTappedNumberRefusal,
} from './tapped-number-refusal';

type TappedNumberNativeModule = {
  isTappedNumberHandler(): Promise<boolean>;
};

function readTappedNumberNativeModule(): TappedNumberNativeModule {
  const nativeModule = NativeModules.TappedNumber as
    | TappedNumberNativeModule
    | undefined;
  const missingModuleMessage =
    'Tapped number setup is not available on this phone.';
  if (!nativeModule) {
    throw new Error(missingModuleMessage);
  }
  return nativeModule;
}

async function readIsTappedNumberHandler(): Promise<boolean> {
  const isHandler: boolean =
    await readTappedNumberNativeModule().isTappedNumberHandler();
  return isHandler;
}

async function fireTappedNumberChooser(): Promise<void> {
  const chooserProbeNumber = '1';
  const chooserIntentParams = {
    action: IntentConstant.ACTION_VIEW,
    data: `tel:${chooserProbeNumber}`,
  };
  await intentLauncher.startActivity(chooserIntentParams);
}

function showTappedNumberInstruction(): void {
  const instructionTitle = 'Catch tapped numbers';
  const instructionMessage =
    'Pick Apex Sales Call, then Always, so numbers you tap in other apps open here.';
  const laterButtonLabel = 'Later';
  const dontShowAgainButtonLabel = "Don't show again";
  const pickNowButtonLabel = 'Pick now';
  Alert.alert(instructionTitle, instructionMessage, [
    { text: laterButtonLabel, style: 'cancel' },
    { text: dontShowAgainButtonLabel, onPress: saveTappedNumberRefusal },
    { text: pickNowButtonLabel, onPress: fireTappedNumberChooser },
  ]);
}

export async function askToCatchTappedNumbers(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  const wasRefused = await readWasTappedNumberRefused();
  if (wasRefused) {
    return;
  }
  const isHandlerAlready = await readIsTappedNumberHandler();
  if (isHandlerAlready) {
    return;
  }
  showTappedNumberInstruction();
}
