import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { CardSim, Check, ChevronLeft, Monitor, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatInternationalPhoneNumber } from '@/shared/utils/phone-formatter';
import { cn } from '@/lib/utils';
import { useCallingSim } from '../hooks/use-calling-sim';

type CallingSimScreenProps = {
  onBack: () => void;
};

type CallingSimHeaderProps = {
  onBack: () => void;
};

function CallingSimHeader({ onBack }: CallingSimHeaderProps) {
  return (
    <View className="border-b border-border bg-card px-3 py-3">
      <View className="flex-row items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl"
          onPress={onBack}
          accessibilityLabel="Back to Settings"
        >
          <Icon as={ChevronLeft} size={24} className="text-muted-foreground" />
        </Button>
        <Text className="flex-1 text-lg font-bold leading-tight tracking-tight">Calling SIM</Text>
      </View>
    </View>
  );
}

function SimChoiceCheck({ isVisible }: { isVisible: boolean }) {
  return (
    <View className="h-5 w-5 shrink-0 items-center justify-center">
      {isVisible ? <Icon as={Check} size={20} className="text-primary" /> : null}
    </View>
  );
}

type SimChoiceRowProps = {
  icon: LucideIcon;
  iconContainerClassName: string;
  iconClassName: string;
  title: string;
  subtitle: string;
  isChosen: boolean;
  className?: string;
  onSelect: () => void;
};

function SimChoiceRow({
  icon,
  iconContainerClassName,
  iconClassName,
  title,
  subtitle,
  isChosen,
  className,
  onSelect,
}: SimChoiceRowProps) {
  return (
    <Button
      variant="outline"
      size="none"
      className={cn(
        'w-full shrink-0 justify-start gap-3 rounded-2xl border-border bg-card p-4 active:bg-muted',
        className,
      )}
      onPress={onSelect}
    >
      <View
        className={`h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconContainerClassName}`}
      >
        <Icon as={icon} size={24} className={iconClassName} />
      </View>
      <View className="flex-1 items-start gap-0.5">
        <Text className="text-sm font-semibold tabular-nums">{title}</Text>
        <Text className="text-xs text-muted-foreground">{subtitle}</Text>
      </View>
      <SimChoiceCheck isVisible={isChosen} />
    </Button>
  );
}

type CallingSimRowProps = {
  simSlotIndex: number;
  carrierName: string;
  simNumber: string;
  isChosen: boolean;
  onSelect: (simSlotIndex: number) => void;
};

function CallingSimRow({
  simSlotIndex,
  carrierName,
  simNumber,
  isChosen,
  onSelect,
}: CallingSimRowProps) {
  const slotTitle = `SIM ${simSlotIndex + 1}`;
  const readableSimNumber =
    simNumber === '' ? null : formatInternationalPhoneNumber(simNumber);
  const rowSubtitle = [carrierName, readableSimNumber].filter(Boolean).join(' · ');
  const handleSelectSim = (): void => {
    onSelect(simSlotIndex);
  };
  return (
    <SimChoiceRow
      icon={CardSim}
      iconContainerClassName="bg-primary/10"
      iconClassName="text-primary"
      title={slotTitle}
      subtitle={rowSubtitle}
      isChosen={isChosen}
      onSelect={handleSelectSim}
    />
  );
}

type SimNoteCardProps = {
  title: string;
  description: string;
};

function SimNoteCard({ title, description }: SimNoteCardProps) {
  return (
    <View className="gap-1 rounded-2xl border border-border bg-muted p-4">
      <Text className="text-sm font-semibold">{title}</Text>
      <Text className="text-xs text-muted-foreground">{description}</Text>
    </View>
  );
}

function UnreadableSimNote() {
  return (
    <SimNoteCard
      title="SIMs cannot be read on this phone."
      description="Calls use the phone's default SIM. When the SIMs can be read again, this page lists them for picking."
    />
  );
}

function PhonePermissionNote() {
  return (
    <SimNoteCard
      title="Phone permission is off."
      description="Allow it in Android settings to see your SIMs. Calls use the phone's default SIM until then."
    />
  );
}

export function CallingSimScreen({ onBack }: CallingSimScreenProps) {
  const { top: topInset } = useSafeAreaInsets();
  const {
    simCards,
    isLoading,
    isPhonePermissionDenied,
    saveErrorMessage,
    isPhoneDefaultChosen,
    isSimSlotChosen,
    chooseSimSlot,
    choosePhoneDefault,
  } = useCallingSim();

  const handleSelectSim = (simSlotIndex: number): void => {
    chooseSimSlot(simSlotIndex);
  };

  const handleSelectPhoneDefault = (): void => {
    choosePhoneDefault();
  };

  const hasReadableSims = simCards.length > 0;
  const phoneDefaultRowClassName = hasReadableSims ? 'mt-2' : '';

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: topInset }}>
      <CallingSimHeader onBack={onBack} />
      <View className="flex-1 px-5 pb-6 pt-4">
        <Text className="px-1 text-xs text-muted-foreground">
          Every call goes out from the SIM you pick. The choice stays on your phone only.
        </Text>
        {isLoading ? null : (
          <View className="mt-3 gap-3">
            {isPhonePermissionDenied ? (
              <PhonePermissionNote />
            ) : hasReadableSims ? null : (
              <UnreadableSimNote />
            )}
            {simCards.map(simCard => (
              <CallingSimRow
                key={simCard.simSlotIndex}
                simSlotIndex={simCard.simSlotIndex}
                carrierName={simCard.carrierName}
                simNumber={simCard.number}
                isChosen={isSimSlotChosen(simCard.simSlotIndex)}
                onSelect={handleSelectSim}
              />
            ))}
            <SimChoiceRow
              icon={Monitor}
              iconContainerClassName="bg-muted"
              iconClassName="text-muted-foreground"
              title="Use phone default"
              subtitle="Let Android pick the SIM for every call."
              isChosen={isPhoneDefaultChosen}
              className={phoneDefaultRowClassName}
              onSelect={handleSelectPhoneDefault}
            />
          </View>
        )}
        {saveErrorMessage ? (
          <Text role="alert" className="px-1 pt-3 text-xs font-semibold text-destructive">
            {saveErrorMessage}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
