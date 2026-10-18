import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { CallOutcome } from '@/features/tracking';
import { Calendar, Check, X } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { cn } from '@/lib/utils';

function getOutcomeIcon(outcome: CallOutcome) {
  if (outcome === 'connected') {
    return Check;
  }
  if (outcome === 'not_connected') {
    return X;
  }
  const scheduleIcon = Calendar;
  return scheduleIcon;
}

function getOutcomeAccentClass(outcome: CallOutcome): string {
  if (outcome === 'connected') {
    return 'text-accent';
  }
  if (outcome === 'not_connected') {
    return 'text-destructive';
  }
  const scheduleAccentClass = 'text-primary';
  return scheduleAccentClass;
}

function getOutcomeChipClass(isSelected: boolean, outcome: CallOutcome): string {
  if (!isSelected) {
    const unselectedChipClass = 'bg-muted';
    return unselectedChipClass;
  }
  if (outcome === 'connected') {
    const connectedChipClass = 'bg-accent/10';
    return connectedChipClass;
  }
  if (outcome === 'not_connected') {
    const notConnectedChipClass = 'bg-destructive/10';
    return notConnectedChipClass;
  }
  const scheduleChipClass = 'bg-primary/10';
  return scheduleChipClass;
}

function getOutcomeDotClass(outcome: CallOutcome): string {
  if (outcome === 'connected') {
    return 'bg-accent';
  }
  if (outcome === 'not_connected') {
    return 'bg-destructive';
  }
  const scheduleDotClass = 'bg-primary';
  return scheduleDotClass;
}

function getOutcomeRowClass(isSelected: boolean, outcome: CallOutcome): string {
  if (!isSelected) {
    const unselectedRowClass = 'border-border bg-card';
    return unselectedRowClass;
  }
  if (outcome === 'connected') {
    const connectedRowClass = 'border-accent bg-accent/5';
    return connectedRowClass;
  }
  if (outcome === 'not_connected') {
    const notConnectedRowClass = 'border-destructive bg-destructive/5';
    return notConnectedRowClass;
  }
  const scheduleRowClass = 'border-primary bg-primary/5';
  return scheduleRowClass;
}

type OutcomeOptionProps = {
  outcome: CallOutcome;
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: (outcome: CallOutcome) => void;
};

function OutcomeOption({
  outcome,
  title,
  description,
  isSelected,
  onSelect,
}: OutcomeOptionProps) {
  const accentClass = getOutcomeAccentClass(outcome);
  const rowClass = getOutcomeRowClass(isSelected, outcome);
  const handleSelect = () => onSelect(outcome);

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      onPress={handleSelect}
      className={cn('flex-row items-center justify-between rounded-2xl border p-3', rowClass)}
    >
      <View className="flex-1 flex-row items-center gap-3">
        <View
          className={cn(
            'h-8 w-8 items-center justify-center rounded-lg',
            getOutcomeChipClass(isSelected, outcome),
          )}
        >
          <Icon
            as={getOutcomeIcon(outcome)}
            size={16}
            className={cn(isSelected ? accentClass : 'text-muted-foreground')}
          />
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-sm font-bold">{title}</Text>
          <Text className="text-[11px] text-muted-foreground">{description}</Text>
        </View>
      </View>
      <View
        className={cn(
          'ml-2 h-4 w-4 items-center justify-center rounded-full border-2',
          isSelected ? accentClass : 'border-border',
        )}
      >
        {isSelected ? (
          <View className={cn('h-2 w-2 rounded-full', getOutcomeDotClass(outcome))} />
        ) : null}
      </View>
    </Pressable>
  );
}

export { OutcomeOption };
