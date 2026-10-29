import { CircleCheck } from 'lucide-react-native';
import { View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

type MyListNumbersEmptyStateProps = {
  emptyHint: string;
};

export function MyListNumbersEmptyState({
  emptyHint,
}: MyListNumbersEmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-3">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Icon as={CircleCheck} size={32} className="text-muted-foreground" />
      </View>
      <Text className="mt-4 text-sm font-semibold">No numbers here yet.</Text>
      <Text className="mt-1 px-6 text-center text-xs text-muted-foreground">
        {emptyHint}
      </Text>
    </View>
  );
}
