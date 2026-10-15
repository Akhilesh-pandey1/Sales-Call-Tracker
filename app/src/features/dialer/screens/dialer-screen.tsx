import { usePermissions } from '@/features/tracking';
import { Text, View } from 'react-native';
import { PermissionBanner } from '../components/permission-banner';

export function DialerScreen() {
  const missingPermissions = usePermissions();

  return (
    <View className="flex-1 bg-background px-5 pt-3">
      <PermissionBanner missingPermissions={missingPermissions} />
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-semibold text-foreground">Dialer</Text>
      </View>
    </View>
  );
}
