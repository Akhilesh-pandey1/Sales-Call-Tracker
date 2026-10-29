import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { maxScheduleAheadDays, noteMaxLength } from '@/config/app-config';
import type { CallOutcome } from '@/features/tracking';
import { Calendar, Check, Copy, MessageCircle } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { cn } from '@/lib/utils';
import { usePostCallSchedule } from '../hooks/use-post-call-schedule';
import { buildNoteCounterText, capNoteText } from '../lib/note-cap';
import type { PostCallSubmitData } from '../types';
import { CopyNumberButton } from './copy-number-button';
import { WhatsAppNumberButton } from './whatsapp-number-button';

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

type OutcomeTone = 'positive' | 'negative';

type OutcomeChoiceChipProps = {
  label: string;
  tone: OutcomeTone;
  isSelected: boolean;
  onToggle: () => void;
};

function OutcomeChoiceChip({ label, tone, isSelected, onToggle }: OutcomeChoiceChipProps) {
  const isPositive = tone === 'positive';
  const selectedChipClasses = isPositive
    ? 'border-accent bg-emerald-50/40'
    : 'border-destructive bg-red-50/40';
  const selectedBoxClasses = isPositive
    ? 'border-accent bg-accent'
    : 'border-destructive bg-destructive';

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={label}
      onPress={onToggle}
      className={cn(
        'flex-row items-center gap-2 rounded-xl border px-3 py-2',
        isSelected ? selectedChipClasses : 'border-border bg-card',
      )}
    >
      <View
        className={cn(
          'h-4 w-4 items-center justify-center rounded border-2',
          isSelected ? selectedBoxClasses : 'border-border bg-card',
        )}
      >
        {isSelected ? <Icon as={Check} size={12} className="text-white" /> : null}
      </View>
      <Text className="text-xs font-bold text-foreground">{label}</Text>
    </Pressable>
  );
}

type NotesFieldProps = {
  noteText: string;
  onChangeNote: (noteText: string) => void;
};

function NotesField({ noteText, onChangeNote }: NotesFieldProps) {
  return (
    <View className="rounded-xl border border-border p-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Notes (optional)
        </Text>
        <Text className="text-[10px] font-medium tabular-nums text-muted-foreground">
          {buildNoteCounterText(noteText.length, noteMaxLength)}
        </Text>
      </View>
      <TextInput
        multiline
        numberOfLines={2}
        value={noteText}
        maxLength={noteMaxLength}
        onChangeText={onChangeNote}
        placeholder="e.g. Asked to call back after 6 PM"
        className="mt-1 h-14 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground"
      />
    </View>
  );
}

export type PostCallDialogVariant = 'keypad' | 'lead' | 'my-list';

type CallOutcomeChoice = 'interested' | 'doNotCall';

type PostCallDialogProps = {
  variant: PostCallDialogVariant;
  isOpen: boolean;
  phoneNumber: string;
  phoneNumberToCopy?: string | null;
  phoneNumberForWhatsApp?: string | null;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (submitData: PostCallSubmitData) => void;
};

function PostCallDialog({
  variant,
  isOpen,
  phoneNumber,
  phoneNumberToCopy = null,
  phoneNumberForWhatsApp = null,
  isSubmitting,
  errorMessage,
  onSubmit,
}: PostCallDialogProps) {
  const { scheduleDate, scheduleLabel, openSchedulePicker } = usePostCallSchedule();
  const [isScheduleChosen, setIsScheduleChosen] = useState(false);
  const [shouldContinueToNextLead, setShouldContinueToNextLead] = useState(true);
  const [chosenOutcome, setChosenOutcome] = useState<CallOutcomeChoice | null>(null);
  const [noteText, setNoteText] = useState('');
  const isInterested = chosenOutcome === 'interested';
  const isDoNotCall = chosenOutcome === 'doNotCall';

  const handleChooseSchedule = () => setIsScheduleChosen(true);
  const handleChooseNoSchedule = () => setIsScheduleChosen(false);
  const handleContinueToNextLeadToggle = () =>
    setShouldContinueToNextLead(!shouldContinueToNextLead);
  const handleToggleInterested = () =>
    setChosenOutcome(chosenOutcome === 'interested' ? null : 'interested');
  const handleToggleDoNotCall = () =>
    setChosenOutcome(chosenOutcome === 'doNotCall' ? null : 'doNotCall');
  const handleChangeNote = (changedNoteText: string) =>
    setNoteText(capNoteText(changedNoteText, noteMaxLength));
  const handleSubmitPress = () => {
    const scheduledAt = isScheduleChosen ? scheduleDate.toISOString() : null;
    const trimmedNoteText = noteText.trim();
    const callOutcome: CallOutcome = {
      interested: isInterested,
      doNotCall: isDoNotCall,
      notes: trimmedNoteText === '' ? null : trimmedNoteText,
    };
    const submitData: PostCallSubmitData = {
      scheduledAt,
      shouldContinueToNextLead,
      outcome: callOutcome,
    };
    onSubmit(submitData);
  };

  const isLeadFlow = variant === 'lead';
  const isNextCallSectionShown = variant === 'lead' || variant === 'my-list';
  const nextCallHintMessage = isLeadFlow
    ? 'Uncheck to stop automated calling after Submit.'
    : 'Uncheck to stop calling after Submit.';
  const submitButtonLabel = isSubmitting ? 'Submitting…' : 'Submit';

  return (
    <Dialog open={isOpen} isDismissalLocked>
      <DialogContent
        className="max-w-sm rounded-3xl p-6"
        backdropClassName="bg-black/60 p-4"
      >
        <View className="flex-row items-start justify-between border-b border-border pb-3">
          <View className="flex-1 gap-1">
            <DialogTitle className="text-base font-bold tracking-tight">
              Call ended
            </DialogTitle>
            <View className="flex-row items-center gap-1.5">
              <DialogDescription className="text-xs tabular-nums">
                {phoneNumber}
              </DialogDescription>
              {phoneNumberToCopy !== null ? (
                <CopyNumberButton
                  phoneNumber={phoneNumberToCopy}
                  className="h-5 w-5 items-center justify-center rounded-full active:bg-muted"
                >
                  <Icon as={Copy} size={14} className="text-muted-foreground" />
                </CopyNumberButton>
              ) : null}
              {phoneNumberForWhatsApp !== null ? (
                <WhatsAppNumberButton
                  phoneNumber={phoneNumberForWhatsApp}
                  className="h-5 w-5 items-center justify-center rounded-full active:bg-muted"
                >
                  <Icon as={MessageCircle} size={14} className="text-accent" />
                </WhatsAppNumberButton>
              ) : null}
            </View>
          </View>
          <View className="ml-2 rounded-full bg-muted px-2.5 py-0.5">
            <Text className="text-[11px] font-semibold text-muted-foreground">Ended</Text>
          </View>
        </View>

        <View className="gap-2">
          <View className="flex-row flex-wrap items-center gap-2">
            <OutcomeChoiceChip
              label="Interested"
              tone="positive"
              isSelected={isInterested}
              onToggle={handleToggleInterested}
            />
            <OutcomeChoiceChip
              label="Do not call again"
              tone="negative"
              isSelected={isDoNotCall}
              onToggle={handleToggleDoNotCall}
            />
          </View>
          <NotesField noteText={noteText} onChangeNote={handleChangeNote} />
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

        {isNextCallSectionShown ? (
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
              {nextCallHintMessage}
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
