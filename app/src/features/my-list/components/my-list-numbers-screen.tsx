import { ChevronLeft, Download } from 'lucide-react-native';
import { FlatList, Pressable, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { PostCallDialog, useDirectCall } from '@/features/dialer';
import type { MyListFlag, MyListNumber } from '@/features/tracking';
import { formatInternationalPhoneNumber } from '@/shared/utils/phone-formatter';
import { openChosenWhatsAppChat } from '@/shared/utils/whatsapp-chat';
import { useMyListDownload } from '../hooks/use-my-list-download';
import { useMyListNumbers } from '../hooks/use-my-list-numbers';
import { getMyListFlagLabel } from '../lib/my-list-flag-labels';
import { MyListNumberRow } from './my-list-number-row';
import { MyListNumbersEmptyState } from './my-list-numbers-empty-state';

type MyListNumbersScreenHeaderProps = {
  title: string;
  onBackPress: () => void;
  onDownloadPress: () => void;
};

function MyListNumbersScreenHeader({
  title,
  onBackPress,
  onDownloadPress,
}: MyListNumbersScreenHeaderProps) {
  const handleBackPress = () => onBackPress();
  const handleDownloadPress = () => onDownloadPress();

  return (
    <View className="border-b border-border bg-card px-5 py-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Pressable
            accessibilityLabel="Back to My List"
            accessibilityRole="button"
            onPress={handleBackPress}
            className="h-9 w-9 items-center justify-center rounded-lg active:bg-muted"
          >
            <Icon
              as={ChevronLeft}
              size={20}
              className="text-muted-foreground"
            />
          </Pressable>
          <Text className="text-lg font-bold tracking-tight">{title}</Text>
        </View>
        <Pressable
          accessibilityLabel="Download this list"
          accessibilityRole="button"
          onPress={handleDownloadPress}
          className="h-9 w-9 items-center justify-center rounded-lg active:bg-muted"
        >
          <Icon as={Download} size={20} className="text-muted-foreground" />
        </Pressable>
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

type MyListNumbersListProps = {
  listNumbers: MyListNumber[];
  onCallNumber: (phoneNumber: string) => void;
  onOpenWhatsAppChat: (phoneNumber: string) => void;
};

function MyListNumbersList({
  listNumbers,
  onCallNumber,
  onOpenWhatsAppChat,
}: MyListNumbersListProps) {
  return (
    <FlatList
      data={listNumbers}
      keyExtractor={(listNumber) => listNumber.phoneNumber}
      contentContainerClassName="px-5 pb-6 pt-4"
      ListHeaderComponent={
        <Text className="text-xs text-muted-foreground">
          Newest called first · lives only on this phone
        </Text>
      }
      renderItem={({ item }) => (
        <MyListNumberRow
          listNumber={item}
          onCallNumber={onCallNumber}
          onOpenWhatsAppChat={onOpenWhatsAppChat}
        />
      )}
    />
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
  const directCall = useDirectCall();
  const download = useMyListDownload(listFlag);
  const flagLabel = getMyListFlagLabel(listFlag);

  const trackedCall = directCall.trackedCall;
  const idlePostCallDialogKey = 'idle-my-list-numbers-post-call';
  const postCallDialogKey = trackedCall?.callId ?? idlePostCallDialogKey;
  const postCallDialogPhoneNumber = trackedCall === null
    ? ''
    : formatInternationalPhoneNumber(trackedCall.phoneNumber);
  const postCallDialogWhatsAppNumber = trackedCall === null
    ? null
    : trackedCall.phoneNumber;

  const handleBackPress = () => onBackPress();
  const handleTryAgainPress = () => reloadListNumbers();
  const handleDownloadPress = () => download.downloadListToCsv();

  const screenContent = errorMessage !== null ? (
    <MyListNumbersErrorView
      errorMessage={errorMessage}
      onTryAgain={handleTryAgainPress}
    />
  ) : listNumbers.length === 0 ? (
    <MyListNumbersEmptyState emptyHint={flagLabel.emptyHint} />
  ) : (
    <MyListNumbersList
      listNumbers={listNumbers}
      onCallNumber={directCall.startDirectCall}
      onOpenWhatsAppChat={openChosenWhatsAppChat}
    />
  );

  return (
    <View className="flex-1 bg-background">
      <MyListNumbersScreenHeader
        title={flagLabel.title}
        onBackPress={handleBackPress}
        onDownloadPress={handleDownloadPress}
      />
      {screenContent}
      <PostCallDialog
        key={postCallDialogKey}
        variant="keypad"
        isOpen={directCall.isPostCallDialogOpen}
        phoneNumber={postCallDialogPhoneNumber}
        phoneNumberForWhatsApp={postCallDialogWhatsAppNumber}
        isSubmitting={directCall.isSubmittingPostCall}
        errorMessage={directCall.postCallErrorMessage}
        onSubmit={directCall.submitDirectCall}
      />
    </View>
  );
}
