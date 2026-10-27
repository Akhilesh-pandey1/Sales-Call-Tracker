import type { ReactNode } from 'react';
import { Pressable } from 'react-native';
import { openChosenWhatsAppChat } from '@/shared/utils/whatsapp-chat';

type WhatsAppNumberButtonProps = {
  phoneNumber: string;
  className: string;
  children: ReactNode;
};

function WhatsAppNumberButton({
  phoneNumber,
  className,
  children,
}: WhatsAppNumberButtonProps) {
  const handleWhatsAppPress = async (): Promise<void> => {
    await openChosenWhatsAppChat(phoneNumber);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`WhatsApp ${phoneNumber}`}
      onPress={handleWhatsAppPress}
      className={className}
    >
      {children}
    </Pressable>
  );
}

export { WhatsAppNumberButton };
