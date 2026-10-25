import type { ReactNode } from 'react';
import { Pressable } from 'react-native';
import { copyPhoneNumberToClipboard } from '../lib/copy-number';

type CopyNumberButtonProps = {
  phoneNumber: string;
  className: string;
  children: ReactNode;
};

function CopyNumberButton({ phoneNumber, className, children }: CopyNumberButtonProps) {
  const handleCopyPress = () => copyPhoneNumberToClipboard(phoneNumber);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Copy number"
      onPress={handleCopyPress}
      className={className}
    >
      {children}
    </Pressable>
  );
}

export { CopyNumberButton };
