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
import { Check, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { cn } from '@/lib/utils';

type ScheduleSelection = {
  dayOffset: number;
  minutesOfDay: number;
};

function getStartOfToday(): Date {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return startOfToday;
}

function addDays(date: Date, dayCount: number): Date {
  const shiftedDate = new Date(date);
  shiftedDate.setDate(shiftedDate.getDate() + dayCount);
  return shiftedDate;
}

function setTimeOfDay(date: Date, hour: number, minute: number): Date {
  const timedDate = new Date(date);
  timedDate.setHours(hour, minute, 0, 0);
  return timedDate;
}

function createDefaultScheduleSelection(): ScheduleSelection {
  const nineOclockMinutes = 9 * 60;
  const defaultSelection = { dayOffset: 1, minutesOfDay: nineOclockMinutes };
  return defaultSelection;
}

function stepScheduleDay(
  selection: ScheduleSelection,
  stepDirection: number,
): ScheduleSelection {
  const firstPickableOffset = 0;
  const lastPickableOffset = maxScheduleAheadDays;
  const steppedOffset = selection.dayOffset + stepDirection;
  const clampedOffset = Math.min(
    Math.max(steppedOffset, firstPickableOffset),
    lastPickableOffset,
  );
  const nextSelection = { ...selection, dayOffset: clampedOffset };
  return nextSelection;
}

function stepScheduleMinutes(
  selection: ScheduleSelection,
  stepDirection: number,
): ScheduleSelection {
  const minuteStepSize = 15;
  const minutesPerDay = 24 * 60;
  const firstPickableMinute = 0;
  const lastPickableMinute = minutesPerDay - minuteStepSize;
  const steppedMinutes = selection.minutesOfDay + stepDirection * minuteStepSize;
  const clampedMinutes = Math.min(
    Math.max(steppedMinutes, firstPickableMinute),
    lastPickableMinute,
  );
  const nextSelection = { ...selection, minutesOfDay: clampedMinutes };
  return nextSelection;
}

function toScheduleDate(selection: ScheduleSelection): Date {
  const hour = Math.floor(selection.minutesOfDay / 60);
  const minute = selection.minutesOfDay % 60;
  const scheduleDate = setTimeOfDay(
    addDays(getStartOfToday(), selection.dayOffset),
    hour,
    minute,
  );
  return scheduleDate;
}

function formatScheduleDateLabel(selection: ScheduleSelection): string {
  const [weekdayName, monthName, dayOfMonth] = toScheduleDate(selection)
    .toDateString()
    .split(' ');
  const dateLabel = `${weekdayName}, ${monthName} ${dayOfMonth}`;
  return dateLabel;
}

function formatScheduleTimeLabel(selection: ScheduleSelection): string {
  const hour = String(Math.floor(selection.minutesOfDay / 60)).padStart(2, '0');
  const minute = String(selection.minutesOfDay % 60).padStart(2, '0');
  const timeLabel = `${hour}:${minute}`;
  return timeLabel;
}

type ScheduleStepperRowProps = {
  label: string;
  valueLabel: string;
  onStepDown: () => void;
  onStepUp: () => void;
};

function ScheduleStepperRow({
  label,
  valueLabel,
  onStepDown,
  onStepUp,
}: ScheduleStepperRowProps) {
  const handleStepDownPress = () => onStepDown();
  const handleStepUpPress = () => onStepUp();

  return (
    <View className="flex-row items-center gap-2">
      <Text className="w-20 text-xs font-semibold text-muted-foreground">{label}</Text>
      <Pressable
        accessibilityLabel={`Earlier ${label}`}
        accessibilityRole="button"
        onPress={handleStepDownPress}
        className="h-9 w-9 items-center justify-center rounded-xl border border-border bg-card active:bg-muted"
      >
        <Icon as={ChevronLeft} size={18} className="text-foreground" />
      </Pressable>
      <Text className="flex-1 text-center text-sm font-bold tabular-nums">
        {valueLabel}
      </Text>
      <Pressable
        accessibilityLabel={`Later ${label}`}
        accessibilityRole="button"
        onPress={handleStepUpPress}
        className="h-9 w-9 items-center justify-center rounded-xl border border-border bg-card active:bg-muted"
      >
        <Icon as={ChevronRight} size={18} className="text-foreground" />
      </Pressable>
    </View>
  );
}

type SchedulePickerProps = {
  selection: ScheduleSelection;
  onSelectionChange: (nextSelection: ScheduleSelection) => void;
};

function SchedulePicker({ selection, onSelectionChange }: SchedulePickerProps) {
  const handleDayStepDown = () =>
    onSelectionChange(stepScheduleDay(selection, -1));
  const handleDayStepUp = () => onSelectionChange(stepScheduleDay(selection, 1));
  const handleMinuteStepDown = () =>
    onSelectionChange(stepScheduleMinutes(selection, -1));
  const handleMinuteStepUp = () =>
    onSelectionChange(stepScheduleMinutes(selection, 1));

  return (
    <View className="gap-2.5 rounded-2xl border border-border bg-muted/40 p-3">
      <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Follow-up time (IST)
      </Text>
      <ScheduleStepperRow
        label="Date"
        valueLabel={formatScheduleDateLabel(selection)}
        onStepDown={handleDayStepDown}
        onStepUp={handleDayStepUp}
      />
      <ScheduleStepperRow
        label="Time"
        valueLabel={formatScheduleTimeLabel(selection)}
        onStepDown={handleMinuteStepDown}
        onStepUp={handleMinuteStepUp}
      />
    </View>
  );
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
  const [scheduleSelection, setScheduleSelection] = useState<ScheduleSelection>(
    createDefaultScheduleSelection,
  );
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
    const scheduledAt = isScheduleChosen
      ? toScheduleDate(scheduleSelection).toISOString()
      : null;
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
            <SchedulePicker
              selection={scheduleSelection}
              onSelectionChange={setScheduleSelection}
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
