import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import { cn } from '@/lib/utils';
import type { MyListBadge } from '../types';

type MyListBadgeTagProps = {
  badge: MyListBadge;
};

export function MyListBadgeTag({ badge }: MyListBadgeTagProps) {
  const badgeBackgroundClassByBadge: Record<MyListBadge, string> = {
    Left: 'bg-slate-100',
    Connected: 'bg-emerald-50',
    'Not connected': 'bg-muted',
    Interested: 'bg-indigo-50',
    'Do not call': 'bg-red-50',
  };
  const badgeTextClassByBadge: Record<MyListBadge, string> = {
    Left: 'text-slate-600',
    Connected: 'text-emerald-700',
    'Not connected': 'text-muted-foreground',
    Interested: 'text-primary',
    'Do not call': 'text-destructive',
  };
  const badgeBackgroundClass = badgeBackgroundClassByBadge[badge];
  const badgeTextClass = badgeTextClassByBadge[badge];

  return (
    <View className={cn('rounded-full px-2.5 py-0.5', badgeBackgroundClass)}>
      <Text className={cn('text-[11px] font-semibold', badgeTextClass)}>
        {badge}
      </Text>
    </View>
  );
}
