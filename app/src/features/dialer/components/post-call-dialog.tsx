import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { maxScheduleAheadDays } from '@/config/app-config';
import { Calendar, Check } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { cn } from '@/lib/utils';
import { usePostCallSchedule } from '../hooks/use-post-call-schedule';

type ScheduleChoiceRowProps = {
  label: string;
  isSelected: boolean;
  onSelect: () => void;
};

function ScheduleChoiceRow({ label, isSelected, onSelect }: ScheduleChoiceRowProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      onPress={onSelect}
      className={cn(
        'flex-row items-center justify-between rounded-xl border p-3',
        isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card',
      )}
    >
      <Text className="flex-1 text-sm font-bold">{label}</Text>
      <View
        className={cn(
          'h-4 w-4 items-center justify-center rounded-full border-2',
          isSelected ? 'border-primary' : 'border-border',
        )}
      >
        {isSelected ? <View className="h-2 w-2 rounded-full bg-primary" /> : null}
      </View>
    </Pressable>
  );
}

type SchedulePickerFieldProps = {
  scheduleLabel: string;
  onOpenPicker: () => void;
};

function SchedulePickerField({ scheduleLabel, onOpenPicker }: SchedulePickerFieldProps) {
  return (
    <View className="mt-2 rounded-xl border border-border bg-muted/40 p-3">
      <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Follow-up time (IST)
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Follow-up time"
        onPress={onOpenPicker}
        className="mt-1.5 flex-row items-center justify-between rounded-lg border border-border bg-white px-2.5 py-2"
      >
        <Text className="text-xs font-medium text-foreground">{scheduleLabel}</Text>
        <Icon as={Calendar} size={16} className="text-muted-foreground" />
      </Pressable>
      <Text className="mt-1 text-[10px] text-muted-foreground">
        Tap to pick — opens the date picker, then the time picker. Up to {maxScheduleAheadDays} days ahead.
      </Text>
    </View>
  );
}

export type PostCallDialogVariant = 'keypad' | 'lead';

type PostCallDialogProps = {
  variant: PostCallDialogVariant;
  isOpen: boolean;
  phoneNumber: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (scheduledAt: string | null, shouldContinueToNextLead: boolean) => void;
};

function PostCallDialog({
  variant,
  isOpen,
  phoneNumber,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}: PostCallDialogProps) {
  const { scheduleDate, scheduleLabel, openSchedulePicker } = usePostCallSchedule();
  const [isScheduleChosen, setIsScheduleChosen] = useState(false);
  const [shouldContinueToNextLead, setShouldContinueToNextLead] = useState(true);

  const handleOpenChange = (nextIsOpen: boolean) => {
    if (!nextIsOpen) {
      onClose();
    }
  };
  const handleChooseSchedule = () => setIsScheduleChosen(true);
  const handleChooseNoSchedule = () => setIsScheduleChosen(false);
  const handleContinueToNextLeadToggle = () =>
    setShouldContinueToNextLead(!shouldContinueToNextLead);
  const handleSubmitPress = () => {
    const scheduledAt = isScheduleChosen ? scheduleDate.toISOString() : null;
    onSubmit(scheduledAt, shouldContinueToNextLead);
  };

  const showGoToNextCall = variant === 'lead';
  const submitButtonLabel = isSubmitting ? 'Submitting…' : 'Submit';

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-sm rounded-3xl p-6"
        backdropClassName="bg-black/60 p-4"
      >
        <View className="flex-row items-start justify-between border-b border-border pb-3">
          <View className="flex-1 gap-1">
            <DialogTitle className="text-base font-bold tracking-tight">
              Call ended
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
          <Text className="text-sm font-bold">
            Schedule this number for the next call?
          </Text>
          <ScheduleChoiceRow
            label="Do not schedule"
            isSelected={!isScheduleChosen}
            onSelect={handleChooseNoSchedule}
          />
          <ScheduleChoiceRow
            label="Schedule"
            isSelected={isScheduleChosen}
            onSelect={handleChooseSchedule}
          />
          {isScheduleChosen ? (
            <SchedulePickerField
              scheduleLabel={scheduleLabel}
              onOpenPicker={openSchedulePicker}
            />
          ) : null}
        </View>

        {showGoToNextCall ? (
          <View className="gap-1 rounded-2xl border border-border bg-muted/40 p-3">
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: shouldContinueToNextLead }}
              onPress={handleContinueToNextLeadToggle}
              className="flex-row items-center gap-3"
            >
              <View
                className={cn(
                  'h-5 w-5 items-center justify-center rounded-md border-2',
                  shouldContinueToNextLead
                    ? 'border-primary bg-primary'
                    : 'border-border bg-card',
                )}
              >
                {shouldContinueToNextLead ? (
                  <Icon as={Check} size={14} className="text-primary-foreground" />
                ) : null}
              </View>
              <Text className="flex-1 text-xs font-bold text-foreground">
                Go to next call
              </Text>
            </Pressable>
            <Text className="pl-8 text-[10px] text-muted-foreground">
              Uncheck to stop automated calling after Submit.
            </Text>
          </View>
        ) : null}

        {errorMessage ? (
          <Text role="alert" className="text-xs font-semibold text-destructive">
            {errorMessage}
          </Text>
        ) : null}

        <Button onPress={handleSubmitPress} disabled={isSubmitting} className="h-12 rounded-xl">
          <Text className="text-xs font-bold">{submitButtonLabel}</Text>
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export { PostCallDialog };
