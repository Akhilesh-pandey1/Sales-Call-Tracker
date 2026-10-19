import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { cn } from '@/lib/utils';

function createDefaultScheduleDate(): Date {
  const dayStepToTomorrow = 1;
  const defaultStartHour = 9;
  const defaultScheduleDate = new Date();
  defaultScheduleDate.setDate(defaultScheduleDate.getDate() + dayStepToTomorrow);
  defaultScheduleDate.setHours(defaultStartHour, 0, 0, 0);
  return defaultScheduleDate;
}

function toDateTimeLocalInput(date: Date): string {
  const twoDigitLength = 2;
  const padToTwoDigits = (value: number): string =>
    String(value).padStart(twoDigitLength, '0');
  const monthNumber = date.getMonth() + 1;
  const yearLabel = String(date.getFullYear());
  const monthLabel = padToTwoDigits(monthNumber);
  const dayLabel = padToTwoDigits(date.getDate());
  const hourLabel = padToTwoDigits(date.getHours());
  const minuteLabel = padToTwoDigits(date.getMinutes());
  const dateTimeLocalInput = `${yearLabel}-${monthLabel}-${dayLabel}T${hourLabel}:${minuteLabel}`;
  return dateTimeLocalInput;
}

function createDefaultScheduleInput(): string {
  const defaultScheduleInput = toDateTimeLocalInput(createDefaultScheduleDate());
  return defaultScheduleInput;
}

function readScheduleDateFromInput(scheduleInput: string): Date | null {
  const minutePrecisionEnding = /T\d{2}:\d{2}$/;
  const inputWithSeconds = minutePrecisionEnding.test(scheduleInput)
    ? `${scheduleInput}:00`
    : scheduleInput;
  const parsedDate = new Date(inputWithSeconds);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }
  return parsedDate;
}

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

type ScheduleInputBoxProps = {
  inputValue: string;
  onInputChange: (nextInput: string) => void;
};

function ScheduleInputBox({ inputValue, onInputChange }: ScheduleInputBoxProps) {
  const handleScheduleInputChange = (nextInput: string) => onInputChange(nextInput);

  return (
    <View className="mt-2 rounded-xl border border-border bg-muted/40 p-3">
      <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Follow-up time (IST)
      </Text>
      <Input
        value={inputValue}
        onChangeText={handleScheduleInputChange}
        accessibilityLabel="Follow-up time"
        className="mt-1 w-full rounded-lg border-border bg-white px-2.5 py-1.5 text-xs font-medium"
      />
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
  const [isScheduleChosen, setIsScheduleChosen] = useState(false);
  const [scheduleInput, setScheduleInput] = useState<string>(createDefaultScheduleInput);
  const [scheduleDate, setScheduleDate] = useState<Date>(createDefaultScheduleDate);
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
  const handleScheduleInputChange = (nextInput: string) => {
    setScheduleInput(nextInput);
    const parsedDate = readScheduleDateFromInput(nextInput);
    if (parsedDate === null) {
      return;
    }
    setScheduleDate(parsedDate);
  };
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
            <ScheduleInputBox
              inputValue={scheduleInput}
              onInputChange={handleScheduleInputChange}
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
