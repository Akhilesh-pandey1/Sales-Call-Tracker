import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Phone } from 'lucide-react-native';
import { View } from 'react-native';
import { formatInternationalPhoneNumber } from '@/shared/utils/phone-formatter';
import type { PendingNotesCall } from '../hooks/use-pre-call-notes';

type PreCallNotesDialogProps = {
  pendingNotesCall: PendingNotesCall | null;
  onCall: () => void;
  onCancel: () => void;
};

function PreCallNotesDialog({
  pendingNotesCall,
  onCall,
  onCancel,
}: PreCallNotesDialogProps) {
  const isNotesDialogOpen = pendingNotesCall !== null;
  const dialogPhoneNumber = pendingNotesCall === null
    ? ''
    : formatInternationalPhoneNumber(pendingNotesCall.phoneNumber);
  const dialogNote = pendingNotesCall === null ? '' : pendingNotesCall.note;
  const handleOpenChange = (openState: boolean) => {
    if (!openState) {
      onCancel();
    }
  };

  return (
    <Dialog open={isNotesDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-sm rounded-3xl p-6"
        backdropClassName="bg-black/60 p-4"
      >
        <View className="border-b border-border pb-3">
          <DialogTitle className="text-base font-bold tracking-tight">
            Notes
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs tabular-nums">
            {dialogPhoneNumber}
          </DialogDescription>
        </View>

        <View className="rounded-xl bg-muted p-3">
          <Text className="text-sm">{dialogNote}</Text>
        </View>

        <View className="flex-row gap-2">
          <Button
            variant="outline"
            onPress={onCancel}
            className="h-12 flex-1 rounded-xl border-border bg-card"
          >
            <Text className="text-sm font-bold">Cancel</Text>
          </Button>
          <Button
            onPress={onCall}
            className="h-12 flex-1 rounded-xl bg-accent active:bg-accent/90"
          >
            <Icon as={Phone} size={16} className="text-accent-foreground" />
            <Text className="text-sm font-bold text-accent-foreground">Call</Text>
          </Button>
        </View>
      </DialogContent>
    </Dialog>
  );
}

export { PreCallNotesDialog };
