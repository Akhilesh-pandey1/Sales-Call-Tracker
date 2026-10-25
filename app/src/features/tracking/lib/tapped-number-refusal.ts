import AsyncStorage from '@react-native-async-storage/async-storage';

const tappedNumberRefusalStorageKey = 'tapped_number_refusal';

export async function saveTappedNumberRefusal(): Promise<void> {
  await AsyncStorage.setItem(tappedNumberRefusalStorageKey, 'true');
}

export async function readWasTappedNumberRefused(): Promise<boolean> {
  const storedRefusal: string | null = await AsyncStorage.getItem(
    tappedNumberRefusalStorageKey,
  );
  const wasRefused = storedRefusal !== null;
  return wasRefused;
}
