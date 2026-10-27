import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { formatInternationalPhoneNumber } from '@/shared/utils/phone-formatter';

type RemoveNumberDialogProps = {
  targetNumber: string | null;
  isRemoving: boolean;
  errorMessage: string | null;
  onRemove: (typedPassword: string) => void;
  onCancel: () => void;
};

function RemoveNumberDialog({
  targetNumber,
  isRemoving,
  errorMessage,
  onRemove,
  onCancel,
}: RemoveNumberDialogProps) {
  const [typedPassword, setTypedPassword] = useState('');

  useEffect(() => {
    if (targetNumber !== null) {
      setTypedPassword('');
    }
  }, [targetNumber]);

  const handlePasswordChange = (nextTypedPassword: string): void => {
    setTypedPassword(nextTypedPassword);
  };

  const handleRemovePress = (): void => {
    onRemove(typedPassword);
  };

  const displayNumber =
    targetNumber === null ? '' : formatInternationalPhoneNumber(targetNumber);

  return (
    <Dialog
      open={targetNumber !== null}
      onOpenChange={nextOpen => (!nextOpen ? onCancel() : undefined)}
    >
      <DialogContent className="max-w-sm rounded-2xl p-5">
        <View className="gap-1">
          <DialogTitle className="text-base font-bold tracking-tight">
            Remove number{' '}
            <Text className="tabular-nums">({displayNumber})</Text>
          </DialogTitle>
          <DialogDescription className="text-xs">
            This number will be tracked again from now on.
          </DialogDescription>
        </View>
        <View className="gap-1.5">
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Manager password
          </Text>
          <Input
            value={typedPassword}
            onChangeText={handlePasswordChange}
            placeholder="Enter manager password"
            secureTextEntry
            autoComplete="off"
            autoFocus
            className="rounded-xl py-2.5 text-sm"
          />
          {errorMessage ? (
            <Text role="alert" className="text-xs font-medium text-destructive">
              {errorMessage}
            </Text>
          ) : null}
        </View>
        <View className="flex-row justify-end gap-2">
          <Button
            variant="outline"
            className="rounded-xl px-4"
            onPress={onCancel}
            disabled={isRemoving}
          >
            <Text className="text-sm font-semibold text-muted-foreground">
              Cancel
            </Text>
          </Button>
          <Button
            variant="destructive"
            className="rounded-xl px-4"
            onPress={handleRemovePress}
            disabled={isRemoving}
          >
            <Text className="text-sm font-semibold">
              {isRemoving ? 'Removing…' : 'Remove'}
            </Text>
          </Button>
        </View>
      </DialogContent>
    </Dialog>
  );
}

export { RemoveNumberDialog };
