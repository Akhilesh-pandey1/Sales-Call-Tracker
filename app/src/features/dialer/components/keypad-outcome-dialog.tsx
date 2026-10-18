import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Text } from '@/components/ui/text';
import type { CallOutcome } from '@/features/tracking';
import { useState } from 'react';
import { View } from 'react-native';
import { OutcomeOption } from './outcome-option';

type KeypadOutcomeDialogProps = {
  isOpen: boolean;
  phoneNumber: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (outcome: CallOutcome) => void;
};

function KeypadOutcomeDialog({
  isOpen,
  phoneNumber,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}: KeypadOutcomeDialogProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<CallOutcome>('connected');

  const handleOpenChange = (nextIsOpen: boolean) => {
    if (!nextIsOpen) {
      onClose();
    }
  };
  const handleOutcomeSelect = (outcome: CallOutcome) => setSelectedOutcome(outcome);
  const handleSavePress = () => onSubmit(selectedOutcome);

  const saveButtonLabel = isSubmitting ? 'Saving…' : 'Save';

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-sm rounded-3xl p-6"
        backdropClassName="bg-black/60 p-4"
      >
        <View className="flex-row items-start justify-between border-b border-border pb-3">
          <View className="flex-1 gap-1">
            <DialogTitle className="text-base font-bold tracking-tight">
              Call Outcome
            </DialogTitle>
            <DialogDescription className="text-xs tabular-nums">
              {phoneNumber}
            </DialogDescription>
          </View>
          <View className="ml-2 rounded-full bg-muted px-2.5 py-0.5">
            <Text className="text-[11px] font-semibold text-muted-foreground">Ended</Text>
          </View>
        </View>

        <View className="gap-2.5">
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Select Call Result
          </Text>
          <OutcomeOption
            outcome="connected"
            title="Connected"
            description="Spoke with client / Lead completed"
            isSelected={selectedOutcome === 'connected'}
            onSelect={handleOutcomeSelect}
          />
          <OutcomeOption
            outcome="not_connected"
            title="Did not connect"
            description="No answer, busy, or unreachable"
            isSelected={selectedOutcome === 'not_connected'}
            onSelect={handleOutcomeSelect}
          />
        </View>

        {errorMessage ? (
          <Text role="alert" className="text-xs font-semibold text-destructive">
            {errorMessage}
          </Text>
        ) : null}

        <Button onPress={handleSavePress} disabled={isSubmitting} className="h-12 rounded-xl">
          <Text className="text-xs font-bold">{saveButtonLabel}</Text>
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export { KeypadOutcomeDialog };
