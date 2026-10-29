import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import type { LucideIcon } from 'lucide-react-native';
import { Ban, CircleCheck, List, Phone } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import type { MyListCounts, MyListFlag } from '@/features/tracking';

type SummaryCardProps = {
  label: string;
  icon: LucideIcon;
  iconClass: string;
  count: number;
  countClass: string;
  subLine: string;
  onPress?: () => void;
};

function SummaryCard({
  label,
  icon,
  iconClass,
  count,
  countClass,
  subLine,
  onPress,
}: SummaryCardProps) {
  const countClassName: string = `mt-2 text-2xl font-bold tabular-nums tracking-tight ${countClass}`;
  const cardClassName: string =
    'flex-1 rounded-2xl border border-border bg-card p-4 shadow-sm shadow-black/5 active:bg-muted';
  const cardContent = (
    <>
      <View className="flex-row items-center justify-between gap-2">
        <Text className="text-sm font-medium text-muted-foreground">{label}</Text>
        <Icon as={icon} size={20} className={iconClass} />
      </View>
      <Text className={countClassName}>{count}</Text>
      <Text className="mt-1 text-xs text-muted-foreground">{subLine}</Text>
    </>
  );

  if (onPress === undefined) {
    return <View className={cardClassName}>{cardContent}</View>;
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${label} list`}
      onPress={onPress}
      className={cardClassName}
    >
      {cardContent}
    </Pressable>
  );
}

type MyListSummaryCardsProps = {
  counts: MyListCounts;
  onOpenListFlag?: (listFlag: MyListFlag) => void;
};

export function MyListSummaryCards({
  counts,
  onOpenListFlag,
}: MyListSummaryCardsProps) {
  const handleInterestedPress = () => onOpenListFlag?.('interested');
  const handleDoNotCallPress = () => onOpenListFlag?.('do-not-call');

  return (
    <View>
      <Text className="text-base font-bold tracking-tight">List summary</Text>
      <View className="mt-3 gap-3">
        <View className="flex-row gap-3">
          <SummaryCard
            label="Left"
            icon={List}
            iconClass="text-muted-foreground"
            count={counts.leftCount}
            countClass="text-foreground"
            subLine="never dialed yet"
          />
          <SummaryCard
            label="Called"
            icon={Phone}
            iconClass="text-primary"
            count={counts.calledCount}
            countClass="text-foreground"
            subLine="connected + not connected"
          />
        </View>
        <View className="flex-row gap-3">
          <SummaryCard
            label="Interested"
            icon={CircleCheck}
            iconClass="text-accent"
            count={counts.interestedCount}
            countClass="text-accent"
            subLine="wants a call back"
            onPress={onOpenListFlag === undefined ? undefined : handleInterestedPress}
          />
          <SummaryCard
            label="Do not call"
            icon={Ban}
            iconClass="text-destructive"
            count={counts.doNotCallCount}
            countClass="text-destructive"
            subLine="never call again"
            onPress={onOpenListFlag === undefined ? undefined : handleDoNotCallPress}
          />
        </View>
      </View>
    </View>
  );
}
