import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';

type ClearListCountRowProps = {
  label: string;
  count: number;
};

function ClearListCountRow({ label, count }: ClearListCountRowProps) {
  return (
    <View className="flex-row items-center justify-between rounded-xl border border-border bg-muted p-3">
      <Text className="text-sm font-semibold">{label}</Text>
      <Text className="text-sm font-bold tabular-nums">{count}</Text>
    </View>
  );
}

type ClearListDialogProps = {
  isOpen: boolean;
  leftCount: number;
  calledCount: number;
  isClearing: boolean;
  errorMessage: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ClearListDialog({
  isOpen,
  leftCount,
  calledCount,
  isClearing,
  errorMessage,
  onCancel,
  onConfirm,
}: ClearListDialogProps) {
  const handleDismiss = (nextOpen: boolean) => {
    if (nextOpen) {
      return;
    }
    onCancel();
  };

  const dialogTitleMessage = 'Clear My List?';
  const cannotUndoMessage = 'Cannot be undone';
  const introMessage = 'This wipes your whole list:';
  const introClassName = 'mt-4 text-sm text-foreground';
  const countRowsClassName = 'mt-2.5 gap-2';
  const serverNoteClassName = 'mt-3 text-xs text-muted-foreground';
  const serverNoteMessage =
    'Nothing on the server is touched — your list lives only on this phone.';
  const confirmButtonLabel = isClearing ? 'Clearing…' : 'Clear list';

  return (
    <Dialog open={isOpen} onOpenChange={handleDismiss}>
      <DialogContent
        className="max-w-sm gap-0 rounded-3xl p-6"
        backdropClassName="bg-black/60 p-4"
      >
        <View className="flex-row items-center justify-between border-b border-border pb-3">
          <DialogTitle className="text-base font-bold tracking-tight">
            {dialogTitleMessage}
          </DialogTitle>
          <View className="rounded-full bg-destructive/10 px-2.5 py-0.5">
            <Text className="text-[11px] font-semibold text-destructive">
              {cannotUndoMessage}
            </Text>
          </View>
        </View>

        <Text className={introClassName}>{introMessage}</Text>

        <View className={countRowsClassName}>
          <ClearListCountRow label="Left" count={leftCount} />
          <ClearListCountRow label="Called" count={calledCount} />
        </View>

        <Text className={serverNoteClassName}>{serverNoteMessage}</Text>

        {errorMessage ? (
          <Text role="alert" className="mt-1 text-xs font-semibold text-destructive">
            {errorMessage}
          </Text>
        ) : null}

        <View className="mt-5 flex-row justify-end gap-3">
          <Button
            variant="outline"
            size="none"
            onPress={onCancel}
            disabled={isClearing}
            className="h-auto rounded-xl px-4 py-2"
          >
            <Text className="text-sm font-semibold">Cancel</Text>
          </Button>
          <Button
            variant="destructive"
            size="none"
            onPress={onConfirm}
            disabled={isClearing}
            className="h-auto rounded-xl px-4 py-2"
          >
            <Text className="text-sm font-semibold">{confirmButtonLabel}</Text>
          </Button>
        </View>
      </DialogContent>
    </Dialog>
  );
}
