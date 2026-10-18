import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { maxLeadAttempts, maxScheduleAheadDays } from '@/config/app-config';
import { formatInternationalPhoneNumber } from '@/shared/utils/phone-formatter';
import { ArrowRight, Check, ChevronLeft, ChevronRight, Phone } from 'lucide-react-native';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import type { CallOutcome } from '@/features/tracking';
import { OutcomeOption } from './outcome-option';

export type LeadCallCardVariant = 'ready' | 'dialing' | 'outcome';

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

function buildAttemptLabel(attemptCount: number): string {
  const currentAttemptNumber = attemptCount + 1;
  const attemptLabel = `Attempt ${currentAttemptNumber} of ${maxLeadAttempts}`;
  return attemptLabel;
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

type OutcomeDialogProps = {
  isOpen: boolean;
  phoneNumber: string;
  attemptLabel: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  autoDialNextEnabled: boolean;
  onToggleAutoDialNext: (isEnabled: boolean) => void;
  onClose: () => void;
  onSubmit: (outcome: CallOutcome, scheduledAt: string | null) => void;
};

function OutcomeDialog({
  isOpen,
  phoneNumber,
  attemptLabel,
  isSubmitting,
  errorMessage,
  autoDialNextEnabled,
  onToggleAutoDialNext,
  onClose,
  onSubmit,
}: OutcomeDialogProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<CallOutcome>('connected');
  const [scheduleSelection, setScheduleSelection] = useState<ScheduleSelection>(
    createDefaultScheduleSelection,
  );

  const handleOpenChange = (nextIsOpen: boolean) => {
    if (!nextIsOpen) {
      onClose();
    }
  };
  const handleOutcomeSelect = (outcome: CallOutcome) => setSelectedOutcome(outcome);
  const handleAutoDialToggle = () => onToggleAutoDialNext(!autoDialNextEnabled);
  const handleSavePress = () => {
    if (selectedOutcome !== 'schedule') {
      onSubmit(selectedOutcome, null);
      return;
    }
    const scheduledAt = toScheduleDate(scheduleSelection).toISOString();
    onSubmit(selectedOutcome, scheduledAt);
  };

  const saveButtonLabel = isSubmitting ? 'Saving…' : 'Save & Continue';

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
              {phoneNumber} ({attemptLabel})
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
          <OutcomeOption
            outcome="schedule"
            title="Schedule"
            description="Reserve callback date & time"
            isSelected={selectedOutcome === 'schedule'}
            onSelect={handleOutcomeSelect}
          />
          {selectedOutcome === 'schedule' ? (
            <SchedulePicker
              selection={scheduleSelection}
              onSelectionChange={setScheduleSelection}
            />
          ) : null}
        </View>

        <View className="gap-1 rounded-2xl border border-border bg-muted/40 p-3">
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: autoDialNextEnabled }}
            onPress={handleAutoDialToggle}
            className="flex-row items-center gap-3"
          >
            <View
              className={cn(
                'h-5 w-5 items-center justify-center rounded-md border-2',
                autoDialNextEnabled
                  ? 'border-primary bg-primary'
                  : 'border-border bg-card',
              )}
            >
              {autoDialNextEnabled ? (
                <Icon as={Check} size={14} className="text-primary-foreground" />
              ) : null}
            </View>
            <Text className="flex-1 text-xs font-bold text-foreground">
              Auto-dial next lead immediately
            </Text>
          </Pressable>
          <Text className="pl-8 text-[10px] text-muted-foreground">
            Uncheck to pause and review before placing next call.
          </Text>
        </View>

        {errorMessage ? (
          <Text role="alert" className="text-xs font-semibold text-destructive">
            {errorMessage}
          </Text>
        ) : null}

        <Button
          onPress={handleSavePress}
          disabled={isSubmitting}
          className="h-12 rounded-xl"
        >
          <Text className="text-xs font-bold">{saveButtonLabel}</Text>
          <Icon as={ArrowRight} size={16} className="text-primary-foreground" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export type LeadCallCardProps = {
  variant: LeadCallCardVariant;
  phoneNumber: string;
  attemptCount: number;
  isOutcomeDialogOpen: boolean;
  isSubmittingOutcome: boolean;
  outcomeErrorMessage: string | null;
  autoDialNextEnabled: boolean;
  onDialCurrentLead: () => void;
  onOpenOutcomeDialog: () => void;
  onCloseOutcomeDialog: () => void;
  onToggleAutoDialNext: (isEnabled: boolean) => void;
  onSubmitOutcome: (outcome: CallOutcome, scheduledAt: string | null) => void;
};

function LeadCallCardStatus({ variant }: { variant: LeadCallCardVariant }) {
  if (variant === 'dialing') {
    return (
      <View className="flex-row items-center justify-center gap-2">
        <ActivityIndicator size="small" className="text-primary" />
        <Text className="text-xs font-semibold text-muted-foreground">
          Calling now… the outcome screen opens when the call ends.
        </Text>
      </View>
    );
  }
  if (variant === 'outcome') {
    const outcomeStatusMessage = 'Call ended. Choose what happened.';
    return (
      <Text className="text-center text-xs font-semibold text-muted-foreground">
        {outcomeStatusMessage}
      </Text>
    );
  }
  const readyStatusMessage = 'Review the number, then call when you are ready.';
  return (
    <Text className="text-center text-xs font-semibold text-muted-foreground">
      {readyStatusMessage}
    </Text>
  );
}

export function LeadCallCard({
  variant,
  phoneNumber,
  attemptCount,
  isOutcomeDialogOpen,
  isSubmittingOutcome,
  outcomeErrorMessage,
  autoDialNextEnabled,
  onDialCurrentLead,
  onOpenOutcomeDialog,
  onCloseOutcomeDialog,
  onToggleAutoDialNext,
  onSubmitOutcome,
}: LeadCallCardProps) {
  const displayedPhoneNumber = formatInternationalPhoneNumber(phoneNumber);
  const attemptLabel = buildAttemptLabel(attemptCount);
  const handleDialPress = () => onDialCurrentLead();
  const handleOutcomeOpenPress = () => onOpenOutcomeDialog();

  return (
    <View className="flex-1 justify-center px-3 pb-4 pt-2">
      <Card className="gap-4 rounded-3xl px-3 py-6">
        <View className="items-center gap-2">
          <Text className="text-center text-2xl font-extrabold tabular-nums tracking-tight">
            {displayedPhoneNumber}
          </Text>
          <View className="rounded-full bg-muted px-2.5 py-0.5">
            <Text className="text-[11px] font-semibold text-muted-foreground">
              {attemptLabel}
            </Text>
          </View>
        </View>

        <LeadCallCardStatus variant={variant} />

        {variant === 'ready' ? (
          <Button
            onPress={handleDialPress}
            className="h-14 rounded-2xl bg-accent active:bg-accent/90"
          >
            <Icon as={Phone} size={24} className="text-accent-foreground" />
            <Text className="text-lg font-bold text-accent-foreground">Call now</Text>
          </Button>
        ) : null}
        {variant === 'outcome' ? (
          <Button onPress={handleOutcomeOpenPress} className="h-12 rounded-xl">
            <Text className="text-xs font-bold">Enter outcome</Text>
          </Button>
        ) : null}
      </Card>

      <OutcomeDialog
        isOpen={isOutcomeDialogOpen}
        phoneNumber={displayedPhoneNumber}
        attemptLabel={attemptLabel}
        isSubmitting={isSubmittingOutcome}
        errorMessage={outcomeErrorMessage}
        autoDialNextEnabled={autoDialNextEnabled}
        onToggleAutoDialNext={onToggleAutoDialNext}
        onClose={onCloseOutcomeDialog}
        onSubmit={onSubmitOutcome}
      />
    </View>
  );
}
