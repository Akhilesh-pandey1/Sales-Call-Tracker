import { useState, type ComponentProps } from 'react';
import { Eye, EyeOff } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type PasswordInputProps = Omit<ComponentProps<typeof Input>, 'secureTextEntry'>;

function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const handleTogglePasswordVisibility = (): void => {
    setIsPasswordVisible((currentValue) => !currentValue);
  };

  const inputClassName = cn(className, 'pr-12');
  const toggleAriaLabel = isPasswordVisible ? 'Hide password' : 'Show password';

  return (
    <View className="relative">
      <Input
        className={inputClassName}
        secureTextEntry={!isPasswordVisible}
        {...props}
      />
      <Pressable
        accessibilityLabel={toggleAriaLabel}
        onPress={handleTogglePasswordVisibility}
        className="absolute bottom-0 right-0 top-0 w-10 items-center justify-center"
      >
        <Icon
          as={isPasswordVisible ? EyeOff : Eye}
          className="text-muted-foreground"
          size={20}
        />
      </Pressable>
    </View>
  );
}

export { PasswordInput };
