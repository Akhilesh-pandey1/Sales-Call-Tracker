import { NativeModules, Platform } from 'react-native';
import { openWhatsAppChat } from '@/shared/api/whatsapp-module';
import { readWhatsAppSettings } from '@/shared/utils/whatsapp-settings';

export async function openChosenWhatsAppChat(internationalNumber: string): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  const isNativeModulePresent: boolean = NativeModules.WhatsApp !== undefined;
  if (!isNativeModulePresent) {
    return;
  }
  const whatsappSettings = await readWhatsAppSettings();
  const firstMessage: string = whatsappSettings.isFirstMessageOn
    ? whatsappSettings.firstMessageText
    : '';
  await openWhatsAppChat(whatsappSettings.chosenApp, internationalNumber, firstMessage);
}
