import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ChevronRight, LogOut, Trash2 } from 'lucide-react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useClearLocalData } from '../hooks/use-clear-local-data';
import { useLogout } from '../hooks/use-logout';

function SettingsHeader() {
  return (
    <View className="border-b border-border bg-card px-3 py-3">
      <Text className="text-lg font-bold tracking-tight">Settings</Text>
    </View>
  );
}

type ClearDataRowProps = {
  onOpenClearDialog: () => void;
};

function ClearDataRow({ onOpenClearDialog }: ClearDataRowProps) {
  return (
    <Button
      variant="outline"
      size="none"
      className="w-full shrink-0 justify-start gap-4 rounded-2xl border-border bg-card p-4 active:bg-muted"
      onPress={onOpenClearDialog}
    >
      <View className="h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
        <Icon as={Trash2} size={24} className="text-destructive" />
      </View>
      <View className="flex-1 items-start gap-0.5">
        <Text className="text-base font-bold">Clear local data</Text>
        <Text className="text-xs text-muted-foreground">
          Deletes only the calls on this phone that haven't reached the server yet.
        </Text>
      </View>
      <Icon as={ChevronRight} size={20} className="shrink-0 text-muted-foreground" />
    </Button>
  );
}

type LogoutRowProps = {
  isLoggingOut: boolean;
  onLogout: () => Promise<void>;
};

function LogoutRow({ isLoggingOut, onLogout }: LogoutRowProps) {
  return (
    <Button
      variant="outline"
      size="none"
      className="w-full shrink-0 justify-start gap-4 rounded-2xl border-border bg-card p-4 active:bg-muted"
      onPress={onLogout}
      disabled={isLoggingOut}
    >
      <View className="h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <Icon as={LogOut} size={24} className="text-primary" />
      </View>
      <View className="flex-1 items-start gap-0.5">
        <Text className="text-base font-bold">{isLoggingOut ? 'Logging out…' : 'Log out'}</Text>
        <Text className="text-xs text-muted-foreground">
          Sends your unsent calls first, then signs you out.
        </Text>
      </View>
      <Icon as={ChevronRight} size={20} className="shrink-0 text-muted-foreground" />
    </Button>
  );
}

function buildDeleteMessage(pendingCallCount: number): string {
  const singleCallCount = 1;
  const callWord: string = pendingCallCount === singleCallCount ? 'call' : 'calls';
  const deleteMessage: string =
    `This deletes ${pendingCallCount} ${callWord} not yet sent to the server. Cannot be undone.`;
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
    <Dialog open={isOpen} onOpenChange={nextOpen => (!nextOpen ? onCancel() : undefined)}>
      <DialogContent className="max-w-sm rounded-3xl p-6">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10">
          <Icon as={Trash2} size={24} className="text-destructive" />
        </View>
        <View className="gap-1.5">
          <DialogTitle className="text-base font-bold leading-snug">{deleteMessage}</DialogTitle>
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
            <Text className="text-xs font-bold">{isClearing ? 'Deleting…' : 'Delete'}</Text>
          </Button>
        </View>
      </DialogContent>
    </Dialog>
  );
}

export function SettingsScreen() {
  const { top: topInset } = useSafeAreaInsets();
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

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: topInset }}>
      <SettingsHeader />
      <View className="flex-1 px-3 pb-6 pt-4">
        <View className="my-auto gap-2">
          <Text className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Local data
          </Text>
          <ClearDataRow onOpenClearDialog={openClearDialog} />
          <LogoutRow isLoggingOut={isLoggingOut} onLogout={logout} />
          {clearErrorMessage && !isClearDialogOpen ? (
            <Text role="alert" className="px-1 text-xs font-semibold text-destructive">
              {clearErrorMessage}
            </Text>
          ) : null}
          {logoutErrorMessage ? (
            <Text role="alert" className="px-1 text-xs font-semibold text-destructive">
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
