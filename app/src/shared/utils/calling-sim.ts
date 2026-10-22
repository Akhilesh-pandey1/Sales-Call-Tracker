import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizePhoneNumber } from './phone-formatter';

const callingSimStorageKey = 'calling_sim_number';

export async function saveChosenCallingNumber(
  phoneNumber: string,
  countryCode: string,
): Promise<void> {
  const internationalNumber = normalizePhoneNumber(phoneNumber, countryCode);
  await AsyncStorage.setItem(callingSimStorageKey, internationalNumber);
}

export async function readChosenCallingNumber(): Promise<string | null> {
  const storedNumber: string | null = await AsyncStorage.getItem(callingSimStorageKey);
  return storedNumber;
}

export async function clearChosenCallingNumber(): Promise<void> {
  await AsyncStorage.removeItem(callingSimStorageKey);
}

export function findMatchingSimNumber(
  simNumbers: string[],
  chosenNumber: string,
  countryCode: string,
): string | null {
  const normalizedChosenNumber = normalizePhoneNumber(chosenNumber, countryCode);
  const matchingSimNumber =
    simNumbers.find(
      simNumber =>
        normalizePhoneNumber(simNumber, countryCode) === normalizedChosenNumber,
    ) ?? null;
  return matchingSimNumber;
}
