import { ChevronLeft } from 'lucide-react-native';
import { FlatList, Pressable, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { MyListFlag } from '@/features/tracking';
import { useMyListNumbers } from '../hooks/use-my-list-numbers';
import { getMyListFlagLabel } from '../lib/my-list-flag-labels';
import { MyListNumberRow } from './my-list-number-row';
import { MyListNumbersEmptyState } from './my-list-numbers-empty-state';

type MyListNumbersScreenHeaderProps = {
  title: string;
  onBackPress: () => void;
};

function MyListNumbersScreenHeader({
  title,
  onBackPress,
}: MyListNumbersScreenHeaderProps) {
  const handleBackPress = () => onBackPress();

  return (
    <View className="border-b border-border bg-card px-5 py-3">
      <View className="flex-row items-center gap-2">
        <Pressable
          accessibilityLabel="Back to My List"
          accessibilityRole="button"
          onPress={handleBackPress}
          className="h-9 w-9 items-center justify-center rounded-lg active:bg-muted"
        >
          <Icon as={ChevronLeft} size={20} className="text-muted-foreground" />
        </Pressable>
        <Text className="text-lg font-bold tracking-tight">{title}</Text>
      </View>
    </View>
  );
}

type MyListNumbersErrorViewProps = {
  errorMessage: string;
  onTryAgain: () => void;
};

function MyListNumbersErrorView({
  errorMessage,
  onTryAgain,
}: MyListNumbersErrorViewProps) {
  const handleTryAgainPress = () => onTryAgain();

  return (
    <View className="flex-1 items-center justify-center px-3">
      <Text
        role="alert"
        className="text-center text-xs font-semibold text-destructive"
      >
        {errorMessage}
      </Text>
      <Button
        variant="outline"
        onPress={handleTryAgainPress}
        className="mt-4 h-12 w-full rounded-2xl"
      >
        <Text className="text-xs font-bold">Try again</Text>
      </Button>
    </View>
  );
}

type MyListNumbersScreenProps = {
  listFlag: MyListFlag;
  onBackPress: () => void;
};

export function MyListNumbersScreen({
  listFlag,
  onBackPress,
}: MyListNumbersScreenProps) {
  const { listNumbers, errorMessage, reloadListNumbers } =
    useMyListNumbers(listFlag);
  const flagLabel = getMyListFlagLabel(listFlag);

  const handleBackPress = () => onBackPress();
  const handleTryAgainPress = () => reloadListNumbers();

  const screenContent = errorMessage !== null ? (
    <MyListNumbersErrorView
      errorMessage={errorMessage}
      onTryAgain={handleTryAgainPress}
    />
  ) : listNumbers.length === 0 ? (
    <MyListNumbersEmptyState emptyHint={flagLabel.emptyHint} />
  ) : (
    <FlatList
      data={listNumbers}
      keyExtractor={(listNumber) => listNumber.phoneNumber}
      contentContainerClassName="px-5 pb-6 pt-4"
      ListHeaderComponent={
        <Text className="text-xs text-muted-foreground">
          Newest called first · lives only on this phone
        </Text>
      }
      renderItem={({ item }) => <MyListNumberRow listNumber={item} />}
    />
  );

  return (
    <View className="flex-1 bg-background">
      <MyListNumbersScreenHeader
        title={flagLabel.title}
        onBackPress={handleBackPress}
      />
      {screenContent}
    </View>
  );
}
