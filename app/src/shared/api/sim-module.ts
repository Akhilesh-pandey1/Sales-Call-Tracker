import { NativeModules } from 'react-native';

export type SimCard = {
  simSlotIndex: number;
  carrierName: string;
  number: string;
};

type SimCallNativeModule = {
  readSimNumbers(): Promise<SimCard[]>;
  placeCallOnSim(dialedPhoneNumber: string, simSlotIndex: number): Promise<boolean>;
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

export async function placeCallOnSim(
  dialedPhoneNumber: string,
  simSlotIndex: number,
): Promise<boolean> {
  const wasCallPlaced: boolean = await readSimCallNativeModule().placeCallOnSim(
    dialedPhoneNumber,
    simSlotIndex,
  );
  return wasCallPlaced;
}
