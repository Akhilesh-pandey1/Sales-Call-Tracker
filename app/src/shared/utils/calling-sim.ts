import AsyncStorage from '@react-native-async-storage/async-storage';

const callingSimSlotStorageKey = 'calling_sim_slot';

export async function saveChosenSimSlot(simSlotIndex: number): Promise<void> {
  await AsyncStorage.setItem(callingSimSlotStorageKey, simSlotIndex.toString());
}

export async function readChosenSimSlot(): Promise<number | null> {
  const storedSimSlot: string | null = await AsyncStorage.getItem(callingSimSlotStorageKey);
  if (storedSimSlot === null || Number.isNaN(Number(storedSimSlot))) {
    const noReadableSimSlot = null;
    return noReadableSimSlot;
  }
  const chosenSimSlot = Number(storedSimSlot);
  return chosenSimSlot;
}

export async function clearChosenSimSlot(): Promise<void> {
  await AsyncStorage.removeItem(callingSimSlotStorageKey);
}
