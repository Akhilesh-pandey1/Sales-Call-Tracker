import { useState } from 'react';
import { PermissionsAndroid, Pressable, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { usePermissions } from '@/features/tracking';
import { cn } from '@/lib/utils';
import { ClipboardPaste, Delete, Phone } from 'lucide-react-native';
import { Keypad } from '../components/keypad';
import { PermissionBanner } from '../components/permission-banner';
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
          onPress={dialer.removeLastCharacter}
          className="h-11 w-11 shrink-0 items-center justify-center rounded-full active:bg-muted"
        >
          <Icon as={Delete} size={24} className="text-muted-foreground" />
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={dialer.pasteNumberFromClipboard}
        className="mx-auto mt-1 flex-row items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 active:bg-muted"
      >
        <Icon as={ClipboardPaste} size={14} className="text-primary" />
        <Text className="text-xs font-semibold text-primary">Paste</Text>
      </Pressable>

      <Keypad onCharacterPress={dialer.appendKeypadCharacter} />

      <View className="mt-4">
        <Button
          onPress={dialer.startCall}
          disabled={!isCallEnabled}
          className={callButtonClasses}
        >
          <Icon as={Phone} size={24} className={callContentClasses} />
          <Text className={cn('text-lg font-bold', callContentClasses)}>Call</Text>
        </Button>
        <Text className="mt-2 text-center text-[11px] text-muted-foreground">
          Calls are logged and sent to your manager automatically.
        </Text>
      </View>
    </View>
  );
}

function AutomatedViewPlaceholder() {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary">
        <Icon as={Phone} size={32} className="text-primary-foreground" />
      </View>
      <Text className="mt-4 text-xl font-bold tracking-tight">Automated Calling</Text>
      <Text className="mt-1.5 text-center text-xs text-muted-foreground">
        Start Calling will dial your next lead automatically.
      </Text>
    </View>
  );
}

export function DialerScreen() {
  const missingPermissions = usePermissions();
  const [activeSubTab, setActiveSubTab] = useState<DialerSubTab>('keypad');
  const isCallPermissionDenied = missingPermissions.includes(
    PermissionsAndroid.PERMISSIONS.CALL_PHONE,
  );
  const dialer = useDialer(isCallPermissionDenied);

  return (
    <View className="flex-1 bg-background">
      <View className="px-5 pt-3">
        <PermissionBanner missingPermissions={missingPermissions} />
      </View>
      <DialerSubTabs activeSubTab={activeSubTab} onSelectSubTab={setActiveSubTab} />
      {activeSubTab === 'keypad' ? (
        <KeypadView dialer={dialer} />
      ) : (
        <AutomatedViewPlaceholder />
      )}
    </View>
  );
}
