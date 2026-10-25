import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import { cn } from '@/lib/utils';
import type { MyListCounts } from '../types';

type CountChipProps = {
  dotClass: string;
  label: string;
  count: number;
};

function CountChip({ dotClass, label, count }: CountChipProps) {
  return (
    <View className="flex-row items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5">
      <View className={cn('h-2 w-2 rounded-full', dotClass)} />
      <Text className="text-xs font-semibold">{label}</Text>
      <Text className="text-xs font-semibold tabular-nums">{count}</Text>
    </View>
  );
}

type MyListCountChipsProps = {
  counts: MyListCounts;
};

export function MyListCountChips({ counts }: MyListCountChipsProps) {
  return (
    <View className="flex-row flex-wrap items-center gap-2">
      <CountChip dotClass="bg-slate-400" label="Left" count={counts.leftCount} />
      <CountChip dotClass="bg-primary" label="Called" count={counts.calledCount} />
      <CountChip dotClass="bg-accent" label="Interested" count={counts.interestedCount} />
      <CountChip dotClass="bg-destructive" label="Do not call" count={counts.doNotCallCount} />
    </View>
  );
}
