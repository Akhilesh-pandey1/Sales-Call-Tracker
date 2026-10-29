import AsyncStorage from '@react-native-async-storage/async-storage';
import { notesPopupDefaultOn } from '@/config/app-config';

const notesPopupStorageKey = 'notes_popup_on';
const storedOnValue = 'true';

export async function readIsNotesPopupOn(): Promise<boolean> {
  const storedIsNotesPopupOn: string | null = await AsyncStorage.getItem(
    notesPopupStorageKey,
  );
  const isNotesPopupOn: boolean =
    storedIsNotesPopupOn === null
      ? notesPopupDefaultOn
      : storedIsNotesPopupOn === storedOnValue;
  return isNotesPopupOn;
}

export async function saveIsNotesPopupOn(
  isNotesPopupOn: boolean,
): Promise<void> {
  const storedOffValue = 'false';
  const storedIsNotesPopupOn: string = isNotesPopupOn
    ? storedOnValue
    : storedOffValue;
  await AsyncStorage.setItem(notesPopupStorageKey, storedIsNotesPopupOn);
}
