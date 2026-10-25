import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';

type SettingsSubScreenHeaderProps = {
  title: string;
  onBack: () => void;
  action?: ReactNode;
};

function SettingsSubScreenHeader({
  title,
  onBack,
  action,
}: SettingsSubScreenHeaderProps) {
  return (
    <View className="border-b border-border bg-card px-3 py-3">
      <View className="flex-row items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl"
          onPress={onBack}
          accessibilityLabel="Back to Settings"
        >
          <Icon as={ChevronLeft} size={24} className="text-muted-foreground" />
        </Button>
        <Text className="flex-1 text-lg font-bold leading-tight tracking-tight">
          {title}
        </Text>
        {action}
      </View>
    </View>
  );
}

export { SettingsSubScreenHeader };
