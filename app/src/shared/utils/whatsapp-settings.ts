import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  whatsappDefaultFirstMessageOn,
  whatsappDefaultFirstMessageText,
} from '@/config/app-config';
import type { ChosenWhatsAppApp } from '@/shared/api/whatsapp-module';

const whatsappAppStorageKey = 'whatsapp_chosen_app';
const whatsappMessageOnStorageKey = 'whatsapp_first_message_on';
const whatsappMessageTextStorageKey = 'whatsapp_first_message_text';

const defaultWhatsAppApp: ChosenWhatsAppApp = 'whatsapp';
const businessWhatsAppApp: ChosenWhatsAppApp = 'business';
const storedOnValue = 'true';
const storedOffValue = 'false';

export type WhatsAppSettings = {
  chosenApp: ChosenWhatsAppApp;
  isFirstMessageOn: boolean;
  firstMessageText: string;
};

export async function readWhatsAppSettings(): Promise<WhatsAppSettings> {
  const [storedApp, storedMessageOn, storedMessageText] = await Promise.all([
    AsyncStorage.getItem(whatsappAppStorageKey),
    AsyncStorage.getItem(whatsappMessageOnStorageKey),
    AsyncStorage.getItem(whatsappMessageTextStorageKey),
  ]);
  const chosenApp: ChosenWhatsAppApp =
    storedApp === businessWhatsAppApp ? businessWhatsAppApp : defaultWhatsAppApp;
  const isFirstMessageOn: boolean =
    storedMessageOn === null
      ? whatsappDefaultFirstMessageOn
      : storedMessageOn === storedOnValue;
  const firstMessageText: string = storedMessageText ?? whatsappDefaultFirstMessageText;
  const whatsappSettings: WhatsAppSettings = {
    chosenApp,
    isFirstMessageOn,
    firstMessageText,
  };
  return whatsappSettings;
}

export async function saveChosenWhatsAppApp(chosenApp: ChosenWhatsAppApp): Promise<void> {
  await AsyncStorage.setItem(whatsappAppStorageKey, chosenApp);
}

export async function saveIsFirstMessageOn(isFirstMessageOn: boolean): Promise<void> {
  const storedMessageOn: string = isFirstMessageOn ? storedOnValue : storedOffValue;
  await AsyncStorage.setItem(whatsappMessageOnStorageKey, storedMessageOn);
}

export async function saveFirstMessageText(firstMessageText: string): Promise<void> {
  await AsyncStorage.setItem(whatsappMessageTextStorageKey, firstMessageText);
}
