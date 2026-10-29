import { Clock, Copy, MessageCircle, Phone, RotateCw } from 'lucide-react-native';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  CopyNumberButton,
  PostCallDialog,
  PreCallNotesDialog,
  useDirectCall,
  usePreCallNotes,
  type PostCallSubmitData,
} from '@/features/dialer';
import { cn } from '@/lib/utils';
import { RowActionButton } from '@/shared/components/row-action-button';
import { formatCalledAtLabel } from '@/shared/utils/format-called-at';
import { formatInternationalPhoneNumber } from '@/shared/utils/phone-formatter';
import { openChosenWhatsAppChat } from '@/shared/utils/whatsapp-chat';
import {
  useCallHistory,
  type CallHistoryItem,
} from '../hooks/use-call-history';

function formatDirectionMark(direction: CallHistoryItem['direction']): string {
  const incomingDirectionMark = 'In';
  const outgoingDirectionMark = 'Out';
  const isIncomingCall = direction === 'incoming';
  if (isIncomingCall) {
    return incomingDirectionMark;
  }
  return outgoingDirectionMark;
}

function formatTalkTimeLabel(durationSeconds: number): string {
  const secondsPerMinute = 60;
  const talkMinutes = Math.floor(durationSeconds / secondsPerMinute);
  const talkSeconds = durationSeconds % secondsPerMinute;
  const talkSecondsLabel = `${talkSeconds}s`;
  if (talkMinutes === 0) {
    return talkSecondsLabel;
  }
  const talkTimeLabel = `${talkMinutes}m ${talkSecondsLabel}`;
  return talkTimeLabel;
}

function formatCallResultLabel(durationSeconds: number): string {
  const notConnectedLabel = 'Not connected';
  const isCallConnected = durationSeconds > 0;
  if (!isCallConnected) {
    return notConnectedLabel;
  }
  const talkTimeLabel = formatTalkTimeLabel(durationSeconds);
  const connectedLabel = `Connected · ${talkTimeLabel}`;
  return connectedLabel;
}

function ScheduledBadge() {
  return (
    <View className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5">
      <Text className="text-[10px] font-semibold text-primary">Scheduled</Text>
    </View>
  );
}

type CallRowProps = {
  callItem: CallHistoryItem;
  onCallNumber: (phoneNumber: string) => void;
  onOpenWhatsAppChat: (phoneNumber: string) => void;
};

function CallRow({
  callItem,
  onCallNumber,
  onOpenWhatsAppChat,
}: CallRowProps) {
  const displayedPhoneNumber = formatInternationalPhoneNumber(
    callItem.phoneNumber,
  );
  const directionMark = formatDirectionMark(callItem.direction);
  const calledAtLabel = formatCalledAtLabel(callItem.callAt);
  const directionAndCalledAtLabel = `${directionMark} · ${calledAtLabel}`;
  const callResultLabel = formatCallResultLabel(callItem.durationSeconds);
  const isCallConnected = callItem.durationSeconds > 0;
  const callResultTextClasses = isCallConnected
    ? 'text-accent'
    : 'text-muted-foreground';

  const handleRowPress = () => onCallNumber(callItem.phoneNumber);
  const handleWhatsAppPress = () => onOpenWhatsAppChat(callItem.phoneNumber);

  return (
    <Pressable
      accessibilityLabel={`Call ${displayedPhoneNumber}`}
      accessibilityRole="button"
      onPress={handleRowPress}
      className="mt-2 flex-row items-center gap-3 rounded-xl border border-border bg-card px-4 py-2 shadow-sm active:bg-muted"
    >
      <View className="min-w-0 flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-sm font-bold tabular-nums">
            {displayedPhoneNumber}
          </Text>
          {callItem.hasActiveBooking ? <ScheduledBadge /> : null}
        </View>
        <Text className="mt-0.5 text-[11px] text-muted-foreground">
          {directionAndCalledAtLabel}
        </Text>
        <Text
          className={cn(
            'mt-0.5 text-[10px] font-semibold',
            callResultTextClasses,
          )}
        >
          {callResultLabel}
        </Text>
      </View>
      <View className="shrink-0 flex-row items-center gap-1">
        <RowActionButton
          accessibilityLabel={`Call ${displayedPhoneNumber}`}
          icon={Phone}
          iconClassName="text-primary"
          onPress={handleRowPress}
        />
        <CopyNumberButton
          phoneNumber={callItem.phoneNumber}
          className="h-8 w-8 items-center justify-center rounded-lg border border-border bg-card active:bg-muted"
        >
          <Icon as={Copy} size={16} className="text-muted-foreground" />
        </CopyNumberButton>
        <RowActionButton
          accessibilityLabel={`WhatsApp ${displayedPhoneNumber}`}
          icon={MessageCircle}
          iconClassName="text-accent"
          onPress={handleWhatsAppPress}
        />
      </View>
    </Pressable>
  );
}

function HistoryHeader({ onReloadPress }: { onReloadPress: () => void }) {
  return (
    <View className="border-b border-border bg-card px-5 py-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-bold tracking-tight">History</Text>
        <Pressable
          accessibilityLabel="Reload"
          accessibilityRole="button"
          onPress={onReloadPress}
          className="h-9 w-9 items-center justify-center rounded-lg active:bg-muted"
        >
          <Icon as={RotateCw} size={20} className="text-muted-foreground" />
        </Pressable>
      </View>
    </View>
  );
}

function CallsLoadingView() {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" className="text-primary" />
    </View>
  );
}

function CallsErrorView({
  errorMessage,
  onTryAgain,
}: {
  errorMessage: string;
  onTryAgain: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center px-3">
      <Text role="alert" className="text-center text-xs font-semibold text-destructive">
        {errorMessage}
      </Text>
      <Button
        variant="outline"
        onPress={onTryAgain}
        className="mt-4 h-12 w-full rounded-2xl"
      >
        <Text className="text-xs font-bold">Try again</Text>
      </Button>
    </View>
  );
}

function CallsEmptyView() {
  return (
    <View className="flex-1 items-center justify-center px-3">
      <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary">
        <Icon as={Clock} size={32} className="text-primary-foreground" />
      </View>
      <Text className="mt-4 text-sm font-bold">No calls yet.</Text>
    </View>
  );
}

type LoadMoreFooterProps = {
  onLoadMorePress: () => void;
};

function LoadMoreFooter({ onLoadMorePress }: LoadMoreFooterProps) {
  return (
    <Pressable
      accessibilityLabel="Load more calls"
      accessibilityRole="button"
      onPress={onLoadMorePress}
      className="mt-3 w-full items-center rounded-xl border border-border bg-card py-2.5 active:bg-muted"
    >
      <Text className="text-xs font-bold text-primary">Load more</Text>
    </Pressable>
  );
}

type CallsListProps = {
  callItems: CallHistoryItem[];
  canLoadMore: boolean;
  onLoadMorePress: () => void;
  onCallNumber: (phoneNumber: string) => void;
  onOpenWhatsAppChat: (phoneNumber: string) => void;
};

function CallsList({
  callItems,
  canLoadMore,
  onLoadMorePress,
  onCallNumber,
  onOpenWhatsAppChat,
}: CallsListProps) {
  const loadMoreFooter = canLoadMore ? (
    <LoadMoreFooter onLoadMorePress={onLoadMorePress} />
  ) : undefined;
  return (
    <FlatList
      data={callItems}
      keyExtractor={callItem => `${callItem.phoneNumber} ${callItem.callAt}`}
      contentContainerClassName="px-3 pb-4"
      ListFooterComponent={loadMoreFooter}
      renderItem={({ item }) => (
        <CallRow
          callItem={item}
          onCallNumber={onCallNumber}
          onOpenWhatsAppChat={onOpenWhatsAppChat}
        />
      )}
    />
  );
}

export function HistoryScreen() {
  const {
    historyItems,
    isLoading,
    errorMessage,
    canLoadMore,
    reloadHistory,
    loadMoreHistory,
  } = useCallHistory();
  const directCall = useDirectCall();
  const preCallNotes = usePreCallNotes(directCall.startDirectCall);
  const { top: topInset } = useSafeAreaInsets();

  const idlePostCallDialogKey = 'idle-history-post-call';
  const historyTrackedCall = directCall.trackedCall;
  const postCallDialogKey =
    historyTrackedCall?.callId ?? idlePostCallDialogKey;
  const postCallDialogPhoneNumber = historyTrackedCall === null
    ? ''
    : formatInternationalPhoneNumber(historyTrackedCall.phoneNumber);
  const postCallDialogWhatsAppNumber = historyTrackedCall === null
    ? null
    : historyTrackedCall.phoneNumber;
  const pendingNotesCall = preCallNotes.pendingNotesCall;

  const handleReloadHistory = () => reloadHistory();
  const handleCallHistoryNumber = async (
    phoneNumber: string,
  ): Promise<void> => {
    await preCallNotes.requestCallWithNotes(phoneNumber);
  };
  const handleOpenWhatsAppChat = async (phoneNumber: string): Promise<void> => {
    await openChosenWhatsAppChat(phoneNumber);
  };
  const handleSubmitHistoryPostCall = async (
    submitData: PostCallSubmitData,
  ): Promise<void> => {
    await directCall.submitDirectCall(submitData);
  };

  const screenContent = isLoading ? (
    <CallsLoadingView />
  ) : historyItems.length === 0 ? (
    errorMessage ? (
      <CallsErrorView
        errorMessage={errorMessage}
        onTryAgain={handleReloadHistory}
      />
    ) : (
      <CallsEmptyView />
    )
  ) : (
    <CallsList
      callItems={historyItems}
      canLoadMore={canLoadMore}
      onLoadMorePress={loadMoreHistory}
      onCallNumber={handleCallHistoryNumber}
      onOpenWhatsAppChat={handleOpenWhatsAppChat}
    />
  );

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: topInset }}>
      <HistoryHeader onReloadPress={handleReloadHistory} />
      {screenContent}
      <PostCallDialog
        key={postCallDialogKey}
        variant="keypad"
        isOpen={directCall.isPostCallDialogOpen}
        phoneNumber={postCallDialogPhoneNumber}
        phoneNumberForWhatsApp={postCallDialogWhatsAppNumber}
        isSubmitting={directCall.isSubmittingPostCall}
        errorMessage={directCall.postCallErrorMessage}
        onSubmit={handleSubmitHistoryPostCall}
        onCallAgain={directCall.callAgainDirectCall}
      />
      <PreCallNotesDialog
        pendingNotesCall={pendingNotesCall}
        onCall={preCallNotes.confirmNotesCall}
        onCancel={preCallNotes.cancelNotesCall}
      />
    </View>
  );
}
