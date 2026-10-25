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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatInternationalPhoneNumber } from '@/shared/utils/phone-formatter';
import { SettingsSubScreenHeader } from '../components/settings-sub-screen-header';
import { useDoNotTrack } from '../hooks/use-do-not-track';

type DoNotTrackScreenProps = {
  onBack: () => void;
};

function DoNotTrackTableHeader() {
  return (
    <View className="flex-row items-center gap-x-2 border-b border-border bg-muted px-4 py-2.5">
      <Text className="w-10 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        #
      </Text>
      <Text className="flex-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Phone number
      </Text>
      <Text className="w-20 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Action
      </Text>
    </View>
  );
}

type DoNotTrackRowProps = {
  rowNumber: number;
  phoneNumber: string;
  onRemove: (phoneNumber: string) => void;
};

function DoNotTrackRow({
  rowNumber,
  phoneNumber,
  onRemove,
}: DoNotTrackRowProps) {
  const displayNumber = formatInternationalPhoneNumber(phoneNumber);
  const handleRemovePress = (): void => {
    onRemove(phoneNumber);
  };
  return (
    <View className="flex-row items-center gap-x-2 border-b border-border px-4 py-3">
      <Text className="w-10 text-sm tabular-nums text-muted-foreground">
        {rowNumber}
      </Text>
      <Text className="flex-1 text-sm font-semibold tabular-nums">
        {displayNumber}
      </Text>
      <View className="w-20 items-end">
        <Button
          variant="ghost"
          size="none"
          className="rounded-lg px-2 py-1.5 active:bg-destructive/10"
          onPress={handleRemovePress}
        >
          <Text className="text-xs font-semibold text-destructive">Remove</Text>
        </Button>
      </View>
    </View>
  );
}

function DoNotTrackEmptyNote() {
  return (
    <Text className="px-4 py-6 text-center text-sm text-muted-foreground">
      No numbers yet. Use Add number to keep a personal number private.
    </Text>
  );
}

type DoNotTrackAddDialogProps = {
  isOpen: boolean;
  isSaving: boolean;
  errorMessage: string | null;
  onAdd: (typedNumber: string) => Promise<void>;
  onCancel: () => void;
};

function DoNotTrackAddDialog({
  isOpen,
  isSaving,
  errorMessage,
  onAdd,
  onCancel,
}: DoNotTrackAddDialogProps) {
  const [typedNumber, setTypedNumber] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTypedNumber('');
    }
  }, [isOpen]);

  const handleNumberChange = (nextTypedNumber: string): void => {
    setTypedNumber(nextTypedNumber);
  };

  const handleFormSubmit = (): void => {
    onAdd(typedNumber);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={nextOpen => (!nextOpen ? onCancel() : undefined)}
    >
      <DialogContent className="max-w-sm rounded-2xl p-5">
        <View className="gap-1">
          <DialogTitle className="text-base font-bold tracking-tight">
            Add number
          </DialogTitle>
          <DialogDescription className="text-xs">
            This number will never be recorded - incoming or outgoing.
          </DialogDescription>
        </View>
        <View className="gap-1.5">
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Phone number
          </Text>
          <Input
            value={typedNumber}
            onChangeText={handleNumberChange}
            placeholder="10-digit number"
            keyboardType="phone-pad"
            autoFocus
            className="rounded-xl py-2.5 text-sm tabular-nums"
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
            disabled={isSaving}
          >
            <Text className="text-sm font-semibold text-muted-foreground">
              Cancel
            </Text>
          </Button>
          <Button
            className="rounded-xl px-4"
            onPress={handleFormSubmit}
            disabled={isSaving}
          >
            <Text className="text-sm font-semibold">
              {isSaving ? 'Adding…' : 'Add'}
            </Text>
          </Button>
        </View>
      </DialogContent>
    </Dialog>
  );
}

export function DoNotTrackScreen({ onBack }: DoNotTrackScreenProps) {
  const { top: topInset } = useSafeAreaInsets();
  const {
    doNotTrackNumbers,
    isAddDialogOpen,
    isSavingNumber,
    saveErrorMessage,
    listErrorMessage,
    openAddDialog,
    closeAddDialog,
    addDoNotTrackNumber,
    removeDoNotTrackNumber,
  } = useDoNotTrack();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: topInset }}>
      <SettingsSubScreenHeader
        title="Do not track numbers"
        onBack={onBack}
        action={
          <Button className="rounded-xl px-3.5" onPress={openAddDialog}>
            <Text className="text-sm font-semibold">Add number</Text>
          </Button>
        }
      />
      <View className="flex-1 px-5 pb-6 pt-4">
        <Text className="px-1 text-xs text-muted-foreground">
          Calls to or from these numbers are never recorded. This list stays on
          your phone only.
        </Text>
        <View className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
          <DoNotTrackTableHeader />
          {doNotTrackNumbers.length === 0 ? (
            <DoNotTrackEmptyNote />
          ) : (
            doNotTrackNumbers.map((phoneNumber, index) => (
              <DoNotTrackRow
                key={phoneNumber}
                rowNumber={index + 1}
                phoneNumber={phoneNumber}
                onRemove={removeDoNotTrackNumber}
              />
            ))
          )}
        </View>
        {listErrorMessage ? (
          <Text
            role="alert"
            className="px-1 pt-3 text-xs font-semibold text-destructive"
          >
            {listErrorMessage}
          </Text>
        ) : null}
      </View>
      <DoNotTrackAddDialog
        isOpen={isAddDialogOpen}
        isSaving={isSavingNumber}
        errorMessage={saveErrorMessage}
        onAdd={addDoNotTrackNumber}
        onCancel={closeAddDialog}
      />
    </View>
  );
}
