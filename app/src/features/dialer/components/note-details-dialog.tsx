import { X } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { ViewedNumberNote } from '@/shared/hooks/use-viewed-number-note';
import { formatInternationalPhoneNumber } from '@/shared/utils/phone-formatter';

type NoteDetailsDialogProps = {
  viewedNumberNote: ViewedNumberNote | null;
  onClose: () => void;
};

function NoteDetailsDialog({
  viewedNumberNote,
  onClose,
}: NoteDetailsDialogProps) {
  const isNoteDialogOpen = viewedNumberNote !== null;
  const dialogPhoneNumber = viewedNumberNote === null
    ? ''
    : formatInternationalPhoneNumber(viewedNumberNote.phoneNumber);
  const dialogNote = viewedNumberNote === null ? '' : viewedNumberNote.note;
  const handleOpenChange = (openState: boolean) => {
    if (!openState) {
      onClose();
    }
  };

  return (
    <Dialog open={isNoteDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-sm rounded-3xl p-6"
        backdropClassName="bg-black/60 p-4"
      >
        <View className="flex-row items-center justify-between border-b border-border pb-3">
          <View>
            <DialogTitle className="text-base font-bold tracking-tight">
              Notes
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs tabular-nums">
              {dialogPhoneNumber}
            </DialogDescription>
          </View>
          <Pressable
            accessibilityLabel="Close notes"
            accessibilityRole="button"
            onPress={onClose}
            className="h-8 w-8 items-center justify-center rounded-lg active:bg-muted"
          >
            <Icon as={X} size={16} className="text-muted-foreground" />
          </Pressable>
        </View>

        <View className="rounded-xl bg-muted p-3">
          <Text className="text-sm">{dialogNote}</Text>
        </View>
      </DialogContent>
    </Dialog>
  );
}

export { NoteDetailsDialog };
