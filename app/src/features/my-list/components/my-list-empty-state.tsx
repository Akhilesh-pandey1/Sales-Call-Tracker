import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Upload } from 'lucide-react-native';
import { View } from 'react-native';

type MyListEmptyStateProps = {
  onPressUpload: () => void;
};

export function MyListEmptyState({ onPressUpload }: MyListEmptyStateProps) {
  const handleUploadPress = () => onPressUpload();

  return (
    <View className="items-center py-10">
      <View className="h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <Icon as={Upload} size={32} className="text-muted-foreground" />
      </View>
      <Text className="mt-4 text-xl font-bold tracking-tight">No numbers yet.</Text>
      <Text className="mt-1.5 px-6 text-center text-sm text-muted-foreground">
        Upload your calling list — paste text, or pick a CSV or Excel file.
      </Text>
      <Button
        onPress={handleUploadPress}
        className="mt-6 h-12 w-auto gap-2 rounded-2xl px-6"
      >
        <Icon as={Upload} size={20} className="text-primary-foreground" />
        <Text className="text-base font-bold text-primary-foreground">Upload</Text>
      </Button>
    </View>
  );
}
