import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import { Calendar, Copy, MessageCircle, Phone, RotateCw } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, FlatList, Pressable, ToastAndroid, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MainTabsParamList } from '@/app/navigation/main-tabs-param-list';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { PostCallDialog, useDirectCall } from '@/features/dialer';
import { cn } from '@/lib/utils';
import { formatInternationalPhoneNumber } from '@/shared/utils/phone-formatter';
import { openChosenWhatsAppChat } from '@/shared/utils/whatsapp-chat';
import {
  useScheduledReminders,
  type ScheduledBooking,
} from '../hooks/use-scheduled-reminders';
import { type ScheduledBookingState } from '../lib/booking-state';

const bookedDayMonthFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
});
const bookedTimeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

function formatDateLabel(bookedDate: Date): string {
  const dayMonthLabel: string = bookedDayMonthFormatter.format(bookedDate);
  return dayMonthLabel;
}

function formatTimeLabel(bookedDate: Date): string {
  const timeLabel: string = bookedTimeFormatter.format(bookedDate);
  return timeLabel;
}

function formatBookedAtLabel(scheduledAt: string): string {
  const bookedDate = new Date(scheduledAt);
  if (Number.isNaN(bookedDate.getTime())) {
    return scheduledAt;
  }
  const dayMonthLabel = formatDateLabel(bookedDate);
  const timeLabel = formatTimeLabel(bookedDate);
  const bookedAtLabel = `${dayMonthLabel} · ${timeLabel}`;
  return bookedAtLabel;
}

type BookingTagProps = {
  label: string;
  tagClassName: string;
  labelClassName: string;
};

function BookingTag({ label, tagClassName, labelClassName }: BookingTagProps) {
  return (
    <View className={cn('shrink-0 rounded-full px-2 py-0.5', tagClassName)}>
      <Text className={cn('text-[10px] font-semibold', labelClassName)}>
        {label}
      </Text>
    </View>
  );
}

function BookingStateBadge({ state }: { state: ScheduledBookingState }) {
  const isDue = state === 'Due';
  const badgeClasses = isDue ? 'bg-red-50' : 'bg-indigo-50';
  const badgeTextClasses = isDue ? 'text-destructive' : 'text-primary';
  return (
    <BookingTag
      label={state}
      tagClassName={badgeClasses}
      labelClassName={badgeTextClasses}
    />
  );
}

function BookingInterestedTag() {
  const interestedTagClasses = 'bg-emerald-50';
  const interestedLabelClasses = 'text-accent';
  return (
    <BookingTag
      label="Interested"
      tagClassName={interestedTagClasses}
      labelClassName={interestedLabelClasses}
    />
  );
}

type BookingActionButtonProps = {
  accessibilityLabel: string;
  icon: LucideIcon;
  iconClassName: string;
  onPress: () => void;
};

function BookingActionButton({
  accessibilityLabel,
  icon,
  iconClassName,
  onPress,
}: BookingActionButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      className="h-8 w-8 items-center justify-center rounded-lg border border-border bg-card active:bg-muted"
    >
      <Icon as={icon} size={16} className={iconClassName} />
    </Pressable>
  );
}

type BookingRowProps = {
  booking: ScheduledBooking;
  onOpenBooking: () => void;
  onCallPhoneNumber: (phoneNumber: string) => void;
  onCopyPhoneNumber: (phoneNumber: string) => void;
  onOpenWhatsAppChat: (phoneNumber: string) => void;
};

function BookingRow({
  booking,
  onOpenBooking,
  onCallPhoneNumber,
  onCopyPhoneNumber,
  onOpenWhatsAppChat,
}: BookingRowProps) {
  const isDue = booking.state === 'Due';
  const rowBorderClasses = isDue ? 'border-destructive' : 'border-border';
  const displayedPhoneNumber = formatInternationalPhoneNumber(
    booking.phoneNumber,
  );
  const bookedAtLabel = formatBookedAtLabel(booking.scheduledAt);

  return (
    <Pressable
      accessibilityLabel={`Open booking for ${displayedPhoneNumber}`}
      accessibilityRole="button"
      onPress={onOpenBooking}
      className={cn(
        'mt-2 flex-row items-center gap-3 rounded-xl border bg-card px-4 py-2 shadow-sm active:bg-muted',
        rowBorderClasses,
      )}
    >
      <View className="min-w-0 flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-sm font-bold tabular-nums">
            {displayedPhoneNumber}
          </Text>
          <BookingStateBadge state={booking.state} />
          {booking.isInterested && <BookingInterestedTag />}
        </View>
        <Text className="mt-0.5 text-[11px] text-muted-foreground">
          {bookedAtLabel}
        </Text>
      </View>
      <View className="shrink-0 flex-row items-center gap-1">
        <BookingActionButton
          accessibilityLabel={`Call ${displayedPhoneNumber}`}
          icon={Phone}
          iconClassName="text-primary"
          onPress={() => onCallPhoneNumber(booking.phoneNumber)}
        />
        <BookingActionButton
          accessibilityLabel={`Copy ${displayedPhoneNumber}`}
          icon={Copy}
          iconClassName="text-muted-foreground"
          onPress={() => onCopyPhoneNumber(booking.phoneNumber)}
        />
        <BookingActionButton
          accessibilityLabel={`WhatsApp ${displayedPhoneNumber}`}
          icon={MessageCircle}
          iconClassName="text-accent"
          onPress={() => onOpenWhatsAppChat(booking.phoneNumber)}
        />
      </View>
    </Pressable>
  );
}

function ScheduledHeader({ onReloadPress }: { onReloadPress: () => void }) {
  return (
    <View className="border-b border-border bg-card px-5 py-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-bold tracking-tight">Scheduled</Text>
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

function BookingsLoadingView() {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" className="text-primary" />
    </View>
  );
}

function BookingsErrorView({
  errorMessage,
  onTryAgain,
}: {
  errorMessage: string;
  onTryAgain: () => void;
}) {
  const handleTryAgainPress = () => onTryAgain();
  return (
    <View className="flex-1 items-center justify-center px-3">
      <Text role="alert" className="text-center text-xs font-semibold text-destructive">
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

function BookingsEmptyView() {
  return (
    <View className="flex-1 items-center justify-center px-3">
      <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary">
        <Icon as={Calendar} size={32} className="text-primary-foreground" />
      </View>
      <Text className="mt-4 text-sm font-bold">Nothing scheduled.</Text>
    </View>
  );
}

function DueCountLine({ dueCount }: { dueCount: number }) {
  const minimumDueCountForLine = 1;
  if (dueCount < minimumDueCountForLine) {
    return null;
  }
  const notCalledLine = `You have ${dueCount} leads you have not called.`;
  return (
    <Text className="mt-3 px-1 text-xs font-semibold text-muted-foreground">
      {notCalledLine}
    </Text>
  );
}

type BookingsListProps = {
  bookings: ScheduledBooking[];
  dueBookingCount: number;
  onOpenBooking: () => void;
  onCallPhoneNumber: (phoneNumber: string) => void;
  onCopyPhoneNumber: (phoneNumber: string) => void;
  onOpenWhatsAppChat: (phoneNumber: string) => void;
};

function BookingsList({
  bookings,
  dueBookingCount,
  onOpenBooking,
  onCallPhoneNumber,
  onCopyPhoneNumber,
  onOpenWhatsAppChat,
}: BookingsListProps) {
  return (
    <FlatList
      data={bookings}
      keyExtractor={booking => String(booking.leadId)}
      contentContainerClassName="px-3 pb-4"
      ListHeaderComponent={<DueCountLine dueCount={dueBookingCount} />}
      renderItem={({ item }) => (
        <BookingRow
          booking={item}
          onOpenBooking={onOpenBooking}
          onCallPhoneNumber={onCallPhoneNumber}
          onCopyPhoneNumber={onCopyPhoneNumber}
          onOpenWhatsAppChat={onOpenWhatsAppChat}
        />
      )}
    />
  );
}

export function ScheduledScreen() {
  const {
    bookings,
    dueBookingCount,
    isLoading,
    errorMessage,
    reloadBookings,
    removeBooking,
  } = useScheduledReminders();
  const directCall = useDirectCall();
  const navigation =
    useNavigation<BottomTabNavigationProp<MainTabsParamList>>();
  const { top: topInset } = useSafeAreaInsets();

  const trackedCall = directCall.trackedCall;
  const postCallDialogKey = trackedCall?.callId ?? 'idle-scheduled-post-call';
  const postCallDialogPhoneNumber = trackedCall === null
    ? ''
    : formatInternationalPhoneNumber(trackedCall.phoneNumber);
  const postCallDialogWhatsAppNumber = trackedCall === null
    ? null
    : trackedCall.phoneNumber;

  const handleReloadPress = () => reloadBookings();
  const handleOpenBooking = () => navigation.navigate('Dialer');
  const handleCopyPhoneNumber = async (phoneNumber: string): Promise<void> => {
    const numberCopiedMessage = 'Number copied.';
    await Clipboard.setString(phoneNumber);
    ToastAndroid.show(numberCopiedMessage, ToastAndroid.SHORT);
  };
  const handleOpenWhatsAppChat = async (phoneNumber: string): Promise<void> => {
    const didChatOpen = await openChosenWhatsAppChat(phoneNumber);
    if (!didChatOpen) {
      return;
    }
    await removeBooking(phoneNumber);
  };

  const screenContent = isLoading ? (
    <BookingsLoadingView />
  ) : bookings.length === 0 ? (
    errorMessage ? (
      <BookingsErrorView
        errorMessage={errorMessage}
        onTryAgain={handleReloadPress}
      />
    ) : (
      <BookingsEmptyView />
    )
  ) : (
    <BookingsList
      bookings={bookings}
      dueBookingCount={dueBookingCount}
      onOpenBooking={handleOpenBooking}
      onCallPhoneNumber={directCall.startDirectCall}
      onCopyPhoneNumber={handleCopyPhoneNumber}
      onOpenWhatsAppChat={handleOpenWhatsAppChat}
    />
  );

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: topInset }}>
      <ScheduledHeader onReloadPress={handleReloadPress} />
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
        onCallAgain={directCall.callAgainDirectCall}
      />
    </View>
  );
}
