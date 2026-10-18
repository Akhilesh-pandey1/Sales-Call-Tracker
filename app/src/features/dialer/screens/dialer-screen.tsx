import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { backspaceLongPressClearMs } from '@/config/app-config';
import { usePermissions } from '@/features/tracking';
import { cn } from '@/lib/utils';
import { ClipboardPaste, Delete, Inbox, Phone } from 'lucide-react-native';
import { LeadCallCard } from '../components/lead-call-card';
import { Keypad } from '../components/keypad';
import { PermissionBanner } from '../components/permission-banner';
import {
  useAutomatedCalling,
  type UseAutomatedCallingResult,
} from '../hooks/use-automated-calling';
import { useDialer, type UseDialerResult } from '../hooks/use-dialer';

type DialerSubTab = 'keypad' | 'automated';

type SubTabButtonProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
};

function SubTabButton({ label, isActive, onPress }: SubTabButtonProps) {
  const labelClasses = cn(
    'text-xs font-semibold',
    isActive ? 'text-primary-foreground' : 'text-muted-foreground',
  );
  const buttonClasses = cn(
    'rounded-full px-4 py-1',
    isActive && 'bg-primary shadow-xs',
  );

  return (
    <Pressable accessibilityRole="tab" onPress={onPress} className={buttonClasses}>
      <Text className={labelClasses}>{label}</Text>
    </Pressable>
  );
}

function DialerSubTabs({
  activeSubTab,
  onSelectSubTab,
}: {
  activeSubTab: DialerSubTab;
  onSelectSubTab: (subTab: DialerSubTab) => void;
}) {
  const handleKeypadPress = () => onSelectSubTab('keypad');
  const handleAutomatedPress = () => onSelectSubTab('automated');

  return (
    <View className="items-center border-b border-border bg-card py-2 shadow-xs">
      <View className="flex-row items-center rounded-full border border-border bg-muted p-0.5">
        <SubTabButton
          label="Keypad"
          isActive={activeSubTab === 'keypad'}
          onPress={handleKeypadPress}
        />
        <SubTabButton
          label="Automated"
          isActive={activeSubTab === 'automated'}
          onPress={handleAutomatedPress}
        />
      </View>
    </View>
  );
}

function KeypadView({ dialer }: { dialer: UseDialerResult }) {
  const isCallEnabled = dialer.isNumberValid && !dialer.isDialLocked;
  const callButtonClasses = cn(
    'h-14 rounded-2xl',
    dialer.isNumberValid
      ? 'bg-accent active:bg-accent/90'
      : 'bg-slate-200 opacity-100 shadow-none',
  );
  const callContentClasses = dialer.isNumberValid
    ? 'text-accent-foreground'
    : 'text-slate-400';
  const emptyNumberMessage = 'Enter number';
  const callHintMessage = dialer.isNumberValid
    ? 'Calls are logged and sent to your manager automatically.'
    : 'Type a valid number to enable calling.';

  const handleBackspacePress = () => dialer.removeLastCharacter();
  const handleBackspaceLongPress = () => dialer.clearDialedNumber();
  const handlePastePress = () => dialer.pasteNumberFromClipboard();
  const handleCallPress = () => dialer.startCall();

  return (
    <View className="flex-1 justify-center px-5 pb-4 pt-2">
      <View className="flex-row items-center gap-3 py-2" aria-live="polite">
        {dialer.dialedNumberInput === '' ? (
          <Text className="flex-1 text-right text-3xl font-medium tracking-[0.08em] text-muted-foreground">
            {emptyNumberMessage}
          </Text>
        ) : (
          <Text className="flex-1 text-right text-3xl font-bold tracking-[0.08em] tabular-nums">
            {dialer.dialedNumberInput}
          </Text>
        )}
        <Pressable
          accessibilityLabel="Backspace"
          accessibilityRole="button"
          onPress={handleBackspacePress}
          onLongPress={handleBackspaceLongPress}
          delayLongPress={backspaceLongPressClearMs}
          className="h-11 w-11 shrink-0 items-center justify-center rounded-full active:bg-muted"
        >
          <Icon as={Delete} size={24} className="text-muted-foreground" />
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={handlePastePress}
        className="mx-auto mt-1 flex-row items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 active:bg-muted"
      >
        <Icon as={ClipboardPaste} size={14} className="text-primary" />
        <Text className="text-xs font-semibold text-primary">Paste</Text>
      </Pressable>

      <Keypad onCharacterPress={dialer.appendKeypadCharacter} />

      <View className="mt-4">
        <Button onPress={handleCallPress} disabled={!isCallEnabled} className={callButtonClasses}>
          <Icon as={Phone} size={24} className={callContentClasses} />
          <Text className={cn('text-lg font-bold', callContentClasses)}>Call</Text>
        </Button>
        <Text className="mt-2 text-center text-[11px] text-muted-foreground">
          {callHintMessage}
        </Text>
      </View>
    </View>
  );
}

function AutomatedStartView({
  startErrorMessage,
  onStartCalling,
}: {
  startErrorMessage: string | null;
  onStartCalling: () => void;
}) {
  const handleStartPress = () => onStartCalling();

  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary">
        <Icon as={Phone} size={32} className="text-primary-foreground" />
      </View>
      <Text className="mt-4 text-xl font-bold tracking-tight">Automated Calling</Text>
      <Text className="mt-1.5 text-center text-xs text-muted-foreground">
        Click Start Calling to automatically dial the next available lead in queue.
      </Text>
      {startErrorMessage ? (
        <Text
          role="alert"
          className="mt-3 text-center text-xs font-semibold text-destructive"
        >
          {startErrorMessage}
        </Text>
      ) : null}
      <Button
        onPress={handleStartPress}
        className="mt-6 h-14 w-full rounded-2xl"
      >
        <Icon as={Phone} size={22} className="text-primary-foreground" />
        <Text className="text-base font-bold text-primary-foreground">
          Start Calling
        </Text>
      </Button>
    </View>
  );
}

function AutomatedLoadingView({ loadingLabel }: { loadingLabel: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-6">
      <ActivityIndicator size="large" className="text-primary" />
      <Text className="text-xs font-semibold text-muted-foreground">{loadingLabel}</Text>
    </View>
  );
}

function AutomatedEmptyView({ onTryAgain }: { onTryAgain: () => void }) {
  const handleTryAgainPress = () => onTryAgain();

  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <Icon as={Inbox} size={32} className="text-muted-foreground" />
      </View>
      <Text className="mt-4 text-xl font-bold tracking-tight">No leads to call</Text>
      <Text className="mt-1.5 text-center text-xs text-muted-foreground">
        The calling pool is empty right now. Your manager can upload more numbers.
      </Text>
      <Button
        variant="outline"
        onPress={handleTryAgainPress}
        className="mt-6 h-12 w-full rounded-2xl"
      >
        <Text className="text-xs font-bold">Try again</Text>
      </Button>
    </View>
  );
}

function AutomatedView({
  automatedCalling,
}: {
  automatedCalling: UseAutomatedCallingResult;
}) {
  const { viewState } = automatedCalling;

  if (viewState.kind === 'loading') {
    return <AutomatedLoadingView loadingLabel={viewState.loadingLabel} />;
  }
  if (viewState.kind === 'empty') {
    return <AutomatedEmptyView onTryAgain={automatedCalling.startCalling} />;
  }
  if (viewState.kind === 'start') {
    return (
      <AutomatedStartView
        startErrorMessage={automatedCalling.startErrorMessage}
        onStartCalling={automatedCalling.startCalling}
      />
    );
  }

  return (
    <LeadCallCard
      variant={viewState.kind}
      phoneNumber={viewState.lead.phone_number}
      attemptCount={viewState.lead.attempt_count}
      isOutcomeDialogOpen={automatedCalling.isOutcomeDialogOpen}
      isSubmittingOutcome={automatedCalling.isSubmittingOutcome}
      outcomeErrorMessage={automatedCalling.outcomeErrorMessage}
      autoDialNextEnabled={automatedCalling.autoDialNextEnabled}
      onDialCurrentLead={automatedCalling.dialCurrentLead}
      onOpenOutcomeDialog={automatedCalling.openOutcomeDialog}
      onCloseOutcomeDialog={automatedCalling.closeOutcomeDialog}
      onToggleAutoDialNext={automatedCalling.setAutoDialNextEnabled}
      onSubmitOutcome={automatedCalling.submitOutcome}
    />
  );
}

export function DialerScreen() {
  const missingPermissions = usePermissions();
  const [activeSubTab, setActiveSubTab] = useState<DialerSubTab>('keypad');
  const dialer = useDialer();
  const automatedCalling = useAutomatedCalling();
  const { top: topInset } = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: topInset }}>
      <View className="px-5 pt-3">
        <PermissionBanner missingPermissions={missingPermissions} />
      </View>
      <DialerSubTabs activeSubTab={activeSubTab} onSelectSubTab={setActiveSubTab} />
      {activeSubTab === 'keypad' ? (
        <KeypadView dialer={dialer} />
      ) : (
        <AutomatedView automatedCalling={automatedCalling} />
      )}
    </View>
  );
}
