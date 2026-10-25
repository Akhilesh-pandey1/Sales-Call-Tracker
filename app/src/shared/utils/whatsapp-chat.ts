import { NativeModules, Platform } from 'react-native';
import { openWhatsAppChat } from '@/shared/api/whatsapp-module';
import { readWhatsAppSettings } from '@/shared/utils/whatsapp-settings';

export async function openChosenWhatsAppChat(internationalNumber: string): Promise<boolean> {
  let didChatOpen = false;
  if (Platform.OS !== 'android') {
    return didChatOpen;
  }
  const isNativeModulePresent: boolean = NativeModules.WhatsApp !== undefined;
  if (!isNativeModulePresent) {
    return didChatOpen;
  }
  const whatsappSettings = await readWhatsAppSettings();
  const firstMessage: string = whatsappSettings.isFirstMessageOn
    ? whatsappSettings.firstMessageText
    : '';
  didChatOpen = await openWhatsAppChat(
    whatsappSettings.chosenApp,
    internationalNumber,
    firstMessage,
  );
  return didChatOpen;
}
