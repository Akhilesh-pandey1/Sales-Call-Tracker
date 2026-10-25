import { useFocusEffect } from '@react-navigation/native';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  CardSim,
  ChevronRight,
  LogOut,
  MessageCircle,
  ShieldMinus,
  Trash2,
  type LucideIcon,
} from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useClearLocalData } from '../hooks/use-clear-local-data';
import { useLogout } from '../hooks/use-logout';
import { CallingSimScreen } from './calling-sim-screen';
import { DoNotTrackScreen } from './do-not-track-screen';
import { WhatsAppScreen } from './whatsapp-screen';

type SettingsSubScreen = 'callingSim' | 'doNotTrack' | 'whatsapp';

function SettingsHeader() {
  return (
    <View className="border-b border-border bg-card px-3 py-3">
      <Text className="text-lg font-bold tracking-tight">Settings</Text>
    </View>
  );
}

type SettingsMenuRowProps = {
  icon: LucideIcon;
  iconContainerClassName: string;
  iconClassName: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
};

function SettingsMenuRow({
  icon,
  iconContainerClassName,
  iconClassName,
  title,
  subtitle,
  onPress,
  disabled,
}: SettingsMenuRowProps) {
  return (
    <Button
      variant="outline"
      size="none"
      className="w-full shrink-0 justify-start gap-4 rounded-2xl border-border bg-card p-4 active:bg-muted"
      onPress={onPress}
      disabled={disabled}
    >
      <View
        className={`h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconContainerClassName}`}
      >
        <Icon as={icon} size={24} className={iconClassName} />
      </View>
      <View className="flex-1 items-start gap-0.5">
        <Text className="text-base font-bold">{title}</Text>
        <Text className="text-xs text-muted-foreground">{subtitle}</Text>
      </View>
      <Icon
        as={ChevronRight}
        size={20}
        className="shrink-0 text-muted-foreground"
      />
    </Button>
  );
}

function buildDeleteMessage(pendingCallCount: number): string {
  const singleCallCount = 1;
  const callWord: string =
    pendingCallCount === singleCallCount ? 'call' : 'calls';
  const deleteMessage: string = `This deletes ${pendingCallCount} ${callWord} not yet sent to the server. Cannot be undone.`;
  return deleteMessage;
}

type ClearConfirmDialogProps = {
  isOpen: boolean;
  pendingCallCount: number;
  isClearing: boolean;
  errorMessage: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

function ClearConfirmDialog({
  isOpen,
  pendingCallCount,
  isClearing,
  errorMessage,
  onCancel,
  onConfirm,
}: ClearConfirmDialogProps) {
  const deleteMessage: string = buildDeleteMessage(pendingCallCount);
  return (
    <Dialog
      open={isOpen}
      onOpenChange={nextOpen => (!nextOpen ? onCancel() : undefined)}
    >
      <DialogContent className="max-w-sm rounded-3xl p-6">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10">
          <Icon as={Trash2} size={24} className="text-destructive" />
        </View>
        <View className="gap-1.5">
          <DialogTitle className="text-base font-bold leading-snug">
            {deleteMessage}
          </DialogTitle>
          <DialogDescription className="text-xs">
            The numbers already on the server stay exactly as they are.
          </DialogDescription>
        </View>
        {errorMessage ? (
          <Text role="alert" className="text-xs font-semibold text-destructive">
            {errorMessage}
          </Text>
        ) : null}
        <View className="flex-row gap-3">
          <Button
            variant="outline"
            className="h-12 flex-1 rounded-xl"
            onPress={onCancel}
            disabled={isClearing}
          >
            <Text className="text-xs font-bold">Cancel</Text>
          </Button>
          <Button
            variant="destructive"
            className="h-12 flex-1 rounded-xl"
            onPress={onConfirm}
            disabled={isClearing}
          >
            <Text className="text-xs font-bold">
              {isClearing ? 'Deleting…' : 'Delete'}
            </Text>
          </Button>
        </View>
      </DialogContent>
    </Dialog>
  );
}

export function SettingsScreen() {
  const { top: topInset } = useSafeAreaInsets();
  const [openSubScreen, setOpenSubScreen] = useState<SettingsSubScreen | null>(
    null,
  );
  const {
    pendingCallCount,
    isClearDialogOpen,
    isClearing,
    clearErrorMessage,
    openClearDialog,
    closeClearDialog,
    clearLocalData,
  } = useClearLocalData();
  const { isLoggingOut, logoutErrorMessage, logout } = useLogout();

  useFocusEffect(
    useCallback(() => {
      return () => {
        setOpenSubScreen(null);
      };
    }, []),
  );

  if (openSubScreen === 'doNotTrack') {
    return <DoNotTrackScreen onBack={() => setOpenSubScreen(null)} />;
  }

  if (openSubScreen === 'callingSim') {
    return <CallingSimScreen onBack={() => setOpenSubScreen(null)} />;
  }

  if (openSubScreen === 'whatsapp') {
    return <WhatsAppScreen onBack={() => setOpenSubScreen(null)} />;
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: topInset }}>
      <SettingsHeader />
      <View className="flex-1 px-3 pb-6 pt-4">
        <View className="my-auto gap-2">
          <Text className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Local data
          </Text>
          <SettingsMenuRow
            icon={MessageCircle}
            iconContainerClassName="bg-primary/10"
            iconClassName="text-primary"
            title="WhatsApp"
            subtitle="Pick the app — WhatsApp or WhatsApp Business — and the first message chats open with."
            onPress={() => setOpenSubScreen('whatsapp')}
          />
          <SettingsMenuRow
            icon={Trash2}
            iconContainerClassName="bg-destructive/10"
            iconClassName="text-destructive"
            title="Clear local data"
            subtitle="Deletes only the calls on this phone that haven't reached the server yet."
            onPress={openClearDialog}
          />
          <SettingsMenuRow
            icon={ShieldMinus}
            iconContainerClassName="bg-primary/10"
            iconClassName="text-primary"
            title="Do not track numbers"
            subtitle="Numbers never recorded as work - incoming or outgoing."
            onPress={() => setOpenSubScreen('doNotTrack')}
          />
          <SettingsMenuRow
            icon={CardSim}
            iconContainerClassName="bg-primary/10"
            iconClassName="text-primary"
            title="Calling SIM"
            subtitle="The SIM every call goes out from."
            onPress={() => setOpenSubScreen('callingSim')}
          />
          <SettingsMenuRow
            icon={LogOut}
            iconContainerClassName="bg-primary/10"
            iconClassName="text-primary"
            title={isLoggingOut ? 'Logging out…' : 'Log out'}
            subtitle="Sends your unsent calls first, then signs you out."
            onPress={logout}
            disabled={isLoggingOut}
          />
          {clearErrorMessage && !isClearDialogOpen ? (
            <Text
              role="alert"
              className="px-1 text-xs font-semibold text-destructive"
            >
              {clearErrorMessage}
            </Text>
          ) : null}
          {logoutErrorMessage ? (
            <Text
              role="alert"
              className="px-1 text-xs font-semibold text-destructive"
            >
              {logoutErrorMessage}
            </Text>
          ) : null}
        </View>
      </View>
      <ClearConfirmDialog
        isOpen={isClearDialogOpen}
        pendingCallCount={pendingCallCount}
        isClearing={isClearing}
        errorMessage={clearErrorMessage}
        onCancel={closeClearDialog}
        onConfirm={clearLocalData}
      />
    </View>
  );
}
