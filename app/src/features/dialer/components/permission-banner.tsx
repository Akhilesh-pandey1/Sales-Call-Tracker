import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { TriangleAlert } from 'lucide-react-native';
import { Linking, View, type Permission } from 'react-native';

type PermissionBannerProps = {
  missingPermissions: Permission[];
};

export function PermissionBanner({ missingPermissions }: PermissionBannerProps) {
  if (missingPermissions.length === 0) {
    return null;
  }

  const handleFixPress = () => {
    Linking.openSettings();
  };

  return (
    <View
      accessibilityRole="alert"
      className="flex-row items-center gap-3 rounded-2xl bg-destructive px-4 py-3.5 shadow-sm"
    >
      <Icon as={TriangleAlert} size={24} className="shrink-0 text-white" />
      <View className="flex-1">
        <Text className="text-sm font-bold leading-tight text-white">
          Calls are not being logged
        </Text>
        <Text className="text-xs text-white/80">
          Missing phone state or call log permission
        </Text>
      </View>
      <Button
        onPress={handleFixPress}
        className="h-8 rounded-xl bg-white/20 px-3.5 shadow-none active:bg-white/30"
      >
        <Text className="text-xs font-bold text-white">Fix</Text>
      </Button>
    </View>
  );
}
