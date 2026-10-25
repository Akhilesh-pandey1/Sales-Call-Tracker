import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SettingsSubScreenHeader } from '../components/settings-sub-screen-header';
import { useWhatsAppSettings } from '../hooks/use-whatsapp-settings';

type WhatsAppScreenProps = {
  onBack: () => void;
};

function AppChoiceRadio({ isChosen }: { isChosen: boolean }) {
  return (
    <View
      className={cn(
        'h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
        isChosen ? 'border-primary' : 'border-border',
      )}
    >
      {isChosen ? (
        <View className="h-2.5 w-2.5 rounded-full bg-primary" />
      ) : null}
    </View>
  );
}

type WhatsAppAppOptionRowProps = {
  title: string;
  subtitle: string;
  isChosen: boolean;
  showsDivider: boolean;
  onChoose: () => void;
};

function WhatsAppAppOptionRow({
  title,
  subtitle,
  isChosen,
  showsDivider,
  onChoose,
}: WhatsAppAppOptionRowProps) {
  return (
    <Button
      variant="outline"
      size="none"
      className={cn(
        'w-full shrink-0 justify-start gap-3 rounded-none border-0 bg-card px-4 py-3 shadow-none active:bg-muted',
        showsDivider && 'border-b border-border',
      )}
      onPress={onChoose}
      role="radio"
      aria-checked={isChosen}
    >
      <AppChoiceRadio isChosen={isChosen} />
      <View className="flex-1 items-start gap-0.5">
        <Text className="text-sm font-bold">{title}</Text>
        <Text className="text-xs text-muted-foreground">{subtitle}</Text>
      </View>
    </Button>
  );
}

type WhatsAppAppChoiceCardProps = {
  isWhatsAppChosen: boolean;
  isWhatsAppBusinessChosen: boolean;
  onChooseWhatsApp: () => void;
  onChooseWhatsAppBusiness: () => void;
};

function WhatsAppAppChoiceCard({
  isWhatsAppChosen,
  isWhatsAppBusinessChosen,
  onChooseWhatsApp,
  onChooseWhatsAppBusiness,
}: WhatsAppAppChoiceCardProps) {
  return (
    <View
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      role="radiogroup"
      aria-label="WhatsApp app"
    >
      <WhatsAppAppOptionRow
        title="WhatsApp"
        subtitle="Opens chats in the regular WhatsApp app."
        isChosen={isWhatsAppChosen}
        showsDivider
        onChoose={onChooseWhatsApp}
      />
      <WhatsAppAppOptionRow
        title="WhatsApp Business"
        subtitle="Opens chats in the WhatsApp Business app instead."
        isChosen={isWhatsAppBusinessChosen}
        showsDivider={false}
        onChoose={onChooseWhatsAppBusiness}
      />
    </View>
  );
}

type FirstMessageSwitchProps = {
  isOn: boolean;
  onToggle: (isNextOn: boolean) => void;
};

function FirstMessageSwitch({ isOn, onToggle }: FirstMessageSwitchProps) {
  const handleToggle = (): void => {
    onToggle(!isOn);
  };
  return (
    <Button
      variant="ghost"
      size="none"
      className={cn(
        'h-6 w-11 shrink-0 justify-start rounded-full px-0.5',
        isOn ? 'bg-primary' : 'bg-gray-300',
      )}
      onPress={handleToggle}
      role="switch"
      aria-checked={isOn}
      accessibilityLabel="Start chats with this message"
    >
      <View
        className={cn(
          'h-5 w-5 rounded-full bg-white shadow',
          isOn && 'ml-auto',
        )}
      />
    </Button>
  );
}

type FirstMessageFieldProps = {
  messageText: string;
  isFirstMessageOn: boolean;
  onMessageTextChange: (nextMessageText: string) => void;
  onSaveMessage: () => void;
};

function FirstMessageField({
  messageText,
  isFirstMessageOn,
  onMessageTextChange,
  onSaveMessage,
}: FirstMessageFieldProps) {
  return (
    <View className="mt-3 gap-1.5">
      <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Message text
      </Text>
      <Input
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        value={messageText}
        editable={isFirstMessageOn}
        onChangeText={onMessageTextChange}
        placeholder="Hi, sorry I missed your call. I will call you back shortly."
        className="h-24 w-full flex-col items-start rounded-xl py-2.5 text-sm"
      />
      <View className="flex-row justify-end">
        <Button
          className="rounded-xl px-4 py-2"
          onPress={onSaveMessage}
          disabled={!isFirstMessageOn}
        >
          <Text className="text-sm font-semibold">Save message</Text>
        </Button>
      </View>
    </View>
  );
}

type FirstMessageCardProps = {
  isFirstMessageOn: boolean;
  firstMessageText: string;
  onToggleFirstMessage: (isNextOn: boolean) => void;
  onFirstMessageTextChange: (nextMessageText: string) => void;
  onSaveFirstMessage: () => void;
};

function FirstMessageCard({
  isFirstMessageOn,
  firstMessageText,
  onToggleFirstMessage,
  onFirstMessageTextChange,
  onSaveFirstMessage,
}: FirstMessageCardProps) {
  return (
    <View className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-0.5">
          <Text className="text-sm font-bold">
            Start chats with this message
          </Text>
          <Text className="text-xs text-muted-foreground">
            Chats open with this text already typed — you can always edit before
            sending. Nothing sends by itself.
          </Text>
        </View>
        <FirstMessageSwitch
          isOn={isFirstMessageOn}
          onToggle={onToggleFirstMessage}
        />
      </View>
      <FirstMessageField
        messageText={firstMessageText}
        isFirstMessageOn={isFirstMessageOn}
        onMessageTextChange={onFirstMessageTextChange}
        onSaveMessage={onSaveFirstMessage}
      />
    </View>
  );
}

export function WhatsAppScreen({ onBack }: WhatsAppScreenProps) {
  const { top: topInset } = useSafeAreaInsets();
  const {
    isLoading,
    chosenApp,
    isFirstMessageOn,
    firstMessageText,
    saveErrorMessage,
    chooseApp,
    toggleIsFirstMessageOn,
    changeFirstMessageText,
    saveFirstMessage,
  } = useWhatsAppSettings();

  const handleChooseWhatsApp = (): void => {
    chooseApp('whatsapp');
  };

  const handleChooseWhatsAppBusiness = (): void => {
    chooseApp('business');
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: topInset }}>
      <SettingsSubScreenHeader title="WhatsApp" onBack={onBack} />
      <View className="flex-1 px-5 pb-6 pt-4">
        <Text className="px-1 text-xs text-muted-foreground">
          Every WhatsApp button in the app opens the app you pick here, with the
          first message you write below. Saved on your phone only.
        </Text>
        {isLoading ? null : (
          <View className="gap-2">
            <Text className="mt-4 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              WhatsApp app
            </Text>
            <WhatsAppAppChoiceCard
              isWhatsAppChosen={chosenApp === 'whatsapp'}
              isWhatsAppBusinessChosen={chosenApp === 'business'}
              onChooseWhatsApp={handleChooseWhatsApp}
              onChooseWhatsAppBusiness={handleChooseWhatsAppBusiness}
            />
            <Text className="mt-3 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              First message
            </Text>
            <FirstMessageCard
              isFirstMessageOn={isFirstMessageOn}
              firstMessageText={firstMessageText}
              onToggleFirstMessage={toggleIsFirstMessageOn}
              onFirstMessageTextChange={changeFirstMessageText}
              onSaveFirstMessage={saveFirstMessage}
            />
          </View>
        )}
        {saveErrorMessage ? (
          <Text
            role="alert"
            className="px-1 pt-3 text-xs font-semibold text-destructive"
          >
            {saveErrorMessage}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
