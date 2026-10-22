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
  simNumber: string;
  carrierName: string;
  isChosen: boolean;
  onSelect: (simNumber: string) => void;
};

function CallingSimRow({ simNumber, carrierName, isChosen, onSelect }: CallingSimRowProps) {
  const displayNumber = formatInternationalPhoneNumber(simNumber);
  const handleSelectSim = (): void => {
    onSelect(simNumber);
  };
  return (
    <SimChoiceRow
      icon={CardSim}
      iconContainerClassName="bg-primary/10"
      iconClassName="text-primary"
      title={displayNumber}
      subtitle={carrierName}
      isChosen={isChosen}
      onSelect={handleSelectSim}
    />
  );
}

function UnreadableSimNote() {
  return (
    <View className="gap-1 rounded-2xl border border-border bg-muted p-4">
      <Text className="text-sm font-semibold">SIM numbers cannot be read on this phone.</Text>
      <Text className="text-xs text-muted-foreground">
        Calls use the phone's default SIM. When the numbers can be read again, this page lists them
        for picking.
      </Text>
    </View>
  );
}

export function CallingSimScreen({ onBack }: CallingSimScreenProps) {
  const { top: topInset } = useSafeAreaInsets();
  const {
    simCards,
    isLoading,
    saveErrorMessage,
    isPhoneDefaultChosen,
    isSimNumberChosen,
    chooseCallingNumber,
    choosePhoneDefault,
  } = useCallingSim();

  const handleSelectSim = (simNumber: string): void => {
    chooseCallingNumber(simNumber);
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
          Every call goes out from the number you pick. The choice stays on your phone only.
        </Text>
        {isLoading ? null : (
          <View className="mt-3 gap-3">
            {hasReadableSims ? null : <UnreadableSimNote />}
            {simCards.map(simCard => (
              <CallingSimRow
                key={simCard.number}
                simNumber={simCard.number}
                carrierName={simCard.carrierName}
                isChosen={isSimNumberChosen(simCard.number)}
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
