import { MessageCircle, Phone } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { RowActionButton } from '@/shared/components/row-action-button';
import { NoteInfoButton } from '@/shared/components/note-info-button';
import { formatCalledAtLabel } from '@/shared/utils/format-called-at';
import { formatInternationalPhoneNumber } from '@/shared/utils/phone-formatter';
import type { MyListNumberWithNote } from '../hooks/use-my-list-numbers';

type MyListNumberRowProps = {
  listNumber: MyListNumberWithNote;
  onCallNumber: (phoneNumber: string) => void;
  onOpenWhatsAppChat: (phoneNumber: string) => void;
  onOpenNumberNote: (phoneNumber: string, note: string) => void;
};

export function MyListNumberRow({
  listNumber,
  onCallNumber,
  onOpenWhatsAppChat,
  onOpenNumberNote,
}: MyListNumberRowProps) {
  const displayedPhoneNumber = formatInternationalPhoneNumber(
    listNumber.phoneNumber,
  );
  const calledAtLabel = listNumber.calledAt === null
    ? null
    : formatCalledAtLabel(listNumber.calledAt);
  const listNumberNote = listNumber.note;
  const noteInfoButton = listNumberNote === null ? null : (
    <NoteInfoButton
      displayedPhoneNumber={displayedPhoneNumber}
      onPress={() => onOpenNumberNote(listNumber.phoneNumber, listNumberNote)}
    />
  );
  const calledAtLine = calledAtLabel === null ? null : (
    <Text className="text-[11px] text-muted-foreground">
      {`Called ${calledAtLabel}`}
    </Text>
  );

  const handleRowPress = () => onCallNumber(listNumber.phoneNumber);
  const handleWhatsAppPress = () => onOpenWhatsAppChat(listNumber.phoneNumber);

  return (
    <Pressable
      accessibilityLabel={`Call ${displayedPhoneNumber}`}
      accessibilityRole="button"
      onPress={handleRowPress}
      className="mt-2 flex-row items-center gap-3 rounded-xl border border-border bg-card px-4 py-2 shadow-sm active:bg-muted"
    >
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-bold tabular-nums">
          {displayedPhoneNumber}
        </Text>
        {calledAtLine === null && noteInfoButton === null ? null : (
          <View className="mt-0.5 flex-row items-center gap-1.5">
            {calledAtLine}
            {noteInfoButton}
          </View>
        )}
      </View>
      <View className="shrink-0 flex-row items-center gap-1">
        <RowActionButton
          accessibilityLabel={`Call ${displayedPhoneNumber}`}
          icon={Phone}
          iconClassName="text-primary"
          onPress={handleRowPress}
        />
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
