import { NativeModules } from 'react-native';

export type ChosenWhatsAppApp = 'whatsapp' | 'business';

type WhatsAppNativeModule = {
  openChat(
    chosenApp: ChosenWhatsAppApp,
    internationalNumber: string,
    firstMessage: string,
  ): Promise<boolean>;
};

const missingModuleMessage = 'WhatsApp is not available on this phone.';

function readWhatsAppNativeModule(): WhatsAppNativeModule {
  const nativeModule = NativeModules.WhatsApp as WhatsAppNativeModule | undefined;
  if (!nativeModule) {
    throw new Error(missingModuleMessage);
  }
  return nativeModule;
}

export async function openWhatsAppChat(
  chosenApp: ChosenWhatsAppApp,
  internationalNumber: string,
  firstMessage: string,
): Promise<boolean> {
  const didChatOpen = await readWhatsAppNativeModule().openChat(
    chosenApp,
    internationalNumber,
    firstMessage,
  );
  return didChatOpen;
}
