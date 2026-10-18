import * as React from 'react';
import { Modal, Pressable, Text, View, type ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

type DialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
};

type DialogContentProps = ViewProps & {
  className?: string;
  backdropClassName?: string;
  children?: React.ReactNode;
};

type DialogTextProps = React.ComponentProps<typeof Text> & {
  className?: string;
};

type DialogContextValue = {
  isOpen: boolean;
  closeDialog: () => void;
};

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext(): DialogContextValue {
  const dialogContext = React.useContext(DialogContext);
  if (!dialogContext) {
    throw new Error('Dialog parts must be rendered inside a Dialog component');
  }
  return dialogContext;
}

function claimDialogCardTouch(): boolean {
  return true;
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  const closeDialog = React.useCallback(() => onOpenChange?.(false), [onOpenChange]);
  const dialogContextValue = React.useMemo<DialogContextValue>(
    () => ({ isOpen: open, closeDialog }),
    [open, closeDialog],
  );

  return (
    <DialogContext.Provider value={dialogContextValue}>{children}</DialogContext.Provider>
  );
}

function DialogTitle({ className, ...textProps }: DialogTextProps) {
  return (
    <Text
      role="heading"
      className={cn('text-foreground text-lg font-semibold leading-none', className)}
      {...textProps}
    />
  );
}

function DialogDescription({ className, ...textProps }: DialogTextProps) {
  return <Text className={cn('text-muted-foreground text-sm', className)} {...textProps} />;
}

function DialogContent({
  className,
  backdropClassName,
  children,
  ...viewProps
}: DialogContentProps) {
  const { isOpen, closeDialog } = useDialogContext();
  const dialogCardClassName = cn(
    'bg-background border-border flex w-full flex-col gap-4 rounded-lg border p-6 shadow-lg shadow-black/5',
    className,
  );
  const dialogBackdropClassName = cn(
    'flex flex-1 items-center justify-center bg-black/50 p-6',
    backdropClassName,
  );

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={closeDialog}
    >
      <Pressable
        accessible={false}
        className={dialogBackdropClassName}
        onPress={closeDialog}
      >
        <View
          role="dialog"
          aria-modal
          onStartShouldSetResponder={claimDialogCardTouch}
          className={dialogCardClassName}
          {...viewProps}
        >
          {children}
        </View>
      </Pressable>
    </Modal>
  );
}

export { Dialog, DialogContent, DialogDescription, DialogTitle };
