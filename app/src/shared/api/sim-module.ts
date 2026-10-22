import { NativeModules } from 'react-native';

export type SimCard = {
  number: string;
  carrierName: string;
};

type SimCallNativeModule = {
  readSimNumbers(): Promise<SimCard[]>;
  placeCallOnMatchingSim(phoneNumber: string): Promise<boolean>;
};

const missingModuleMessage = 'This phone cannot choose a calling SIM.';

function readSimCallNativeModule(): SimCallNativeModule {
  const nativeModule = NativeModules.SimCall as SimCallNativeModule | undefined;
  if (!nativeModule) {
    throw new Error(missingModuleMessage);
  }
  return nativeModule;
}

export async function readSimCards(): Promise<SimCard[]> {
  const simCards: SimCard[] = await readSimCallNativeModule().readSimNumbers();
  return simCards;
}

export async function placeCallOnMatchingSim(phoneNumber: string): Promise<boolean> {
  const wasCallPlaced: boolean =
    await readSimCallNativeModule().placeCallOnMatchingSim(phoneNumber);
  return wasCallPlaced;
}
