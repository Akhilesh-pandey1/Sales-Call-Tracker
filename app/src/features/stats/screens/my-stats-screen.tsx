import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { MainTabsParamList } from '@/app/navigation/main-tabs-param-list';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { CloudOff, Settings } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import type { PersonStats, PeriodStats, TopNumberStats } from '../api/stats.api';
import { useMyStats } from '../hooks/use-my-stats';

function formatCount(count: number): string {
  const formattedCount: string = count.toLocaleString('en-US');
  return formattedCount;
}

function formatConnectedPercent(connectedPercent: number | null): string {
  if (connectedPercent === null) {
    const noDataLabel = '—';
    return noDataLabel;
  }
  const percentLabel: string = `${connectedPercent}%`;
  return percentLabel;
}

function getPersonInitials(personName: string): string {
  const maxInitialCount = 2;
  const nameParts: string[] = personName.trim().split(/\s+/);
  const initialLetters: string[] = nameParts
    .slice(0, maxInitialCount)
    .map(namePart => namePart.charAt(0));
  const initials: string = initialLetters.join('').toUpperCase();
  return initials;
}

type MyStatsHeaderProps = {
  personName: string | null;
  onOpenSettings: () => void;
};

function MyStatsHeader({ personName, onOpenSettings }: MyStatsHeaderProps) {
  return (
    <View className="flex-row items-center justify-between border-b border-border bg-card px-5 py-3">
      <View className="min-w-0 flex-row items-center gap-3">
        {personName ? (
          <>
            <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
              <Text className="text-sm font-bold text-primary-foreground">
                {getPersonInitials(personName)}
              </Text>
            </View>
            <View>
              <Text className="text-lg font-bold leading-tight tracking-tight">
                {personName}
              </Text>
              <Text className="text-xs text-muted-foreground">My Calling Stats</Text>
            </View>
          </>
        ) : null}
      </View>
      <Button
        variant="outline"
        size="icon"
        className="rounded-xl"
        onPress={onOpenSettings}
        accessibilityLabel="Settings"
      >
        <Icon as={Settings} size={20} className="text-muted-foreground" />
      </Button>
    </View>
  );
}

type StatsErrorCardProps = {
  message: string;
  onRetryPress: () => void;
};

function StatsErrorCard({ message, onRetryPress }: StatsErrorCardProps) {
  return (
    <View className="flex-1 items-center justify-center px-5">
      <View
        role="alert"
        className="w-full items-center rounded-2xl border border-border bg-card px-6 py-10 shadow-sm shadow-black/5"
      >
        <View className="h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Icon as={CloudOff} size={28} className="text-muted-foreground" />
        </View>
        <Text className="mt-4 text-center text-base font-bold leading-snug">{message}</Text>
        <Text className="mt-1.5 text-center text-sm text-muted-foreground">
          Your numbers did not load. Check your internet and try again.
        </Text>
        <Button className="mt-6 h-12 w-full rounded-xl" onPress={onRetryPress}>
          <Text>Retry</Text>
        </Button>
      </View>
    </View>
  );
}

function LoadingStats() {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" />
    </View>
  );
}

type StatsRowProps = {
  showsDivider: boolean;
  children: ReactNode;
};

function StatsRow({ showsDivider, children }: StatsRowProps) {
  const dividerClassName: string = showsDivider ? 'border-b border-border' : '';
  return (
    <View className={`flex-row items-center gap-2 py-2.5 ${dividerClassName}`}>{children}</View>
  );
}

type PeriodStatsRowProps = {
  periodLabel: string;
  periodStats: PeriodStats;
  showsDivider: boolean;
};

function PeriodStatsRow({ periodLabel, periodStats, showsDivider }: PeriodStatsRowProps) {
  const dialsCount: string = formatCount(periodStats.dials);
  const connectedCount: string = formatCount(periodStats.connected);
  const talkMinutes: string = formatCount(periodStats.minutes);
  const connectedPercent: string = formatConnectedPercent(periodStats.connected_percent);
  return (
    <StatsRow showsDivider={showsDivider}>
      <Text className="w-20 shrink-0 text-sm font-medium">{periodLabel}</Text>
      <Text className="flex-1 text-right text-sm font-semibold tabular-nums">{dialsCount}</Text>
      <Text className="flex-1 text-right text-sm font-semibold tabular-nums text-accent">
        {connectedCount}
      </Text>
      <Text className="flex-1 text-right text-sm font-semibold tabular-nums">{talkMinutes}</Text>
      <Text className="flex-1 text-right text-sm font-semibold tabular-nums">
        {connectedPercent}
      </Text>
    </StatsRow>
  );
}

function PerformanceColumnHeader({ label }: { label: string }) {
  return (
    <Text className="flex-1 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {label}
    </Text>
  );
}

function PerformanceTable({ myStats }: { myStats: PersonStats }) {
  const periodRows = [
    { periodLabel: 'Today', periodStats: myStats.today },
    { periodLabel: 'Yesterday', periodStats: myStats.yesterday },
    { periodLabel: 'Last 30 days', periodStats: myStats.last_30_days },
  ];
  const lastRowIndex: number = periodRows.length - 1;
  return (
    <View className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm shadow-black/5">
      <View className="flex-row items-center justify-between gap-3 px-4 pt-4">
        <Text className="text-base font-bold tracking-tight">Performance</Text>
        <Text className="text-xs text-muted-foreground">— means no dials yet</Text>
      </View>
      <View className="px-4 pb-1">
        <View className="mt-3 flex-row items-center gap-2 border-b border-border pb-2">
          <View className="w-20 shrink-0" />
          <PerformanceColumnHeader label="Dials" />
          <PerformanceColumnHeader label="Connected" />
          <PerformanceColumnHeader label="Min" />
          <PerformanceColumnHeader label="Conn. %" />
        </View>
        {periodRows.map((periodRow, rowIndex) => (
          <PeriodStatsRow
            key={periodRow.periodLabel}
            periodLabel={periodRow.periodLabel}
            periodStats={periodRow.periodStats}
            showsDivider={rowIndex !== lastRowIndex}
          />
        ))}
      </View>
    </View>
  );
}

type TopNumberRowProps = {
  topNumber: TopNumberStats;
  showsDivider: boolean;
};

function TopNumberRow({ topNumber, showsDivider }: TopNumberRowProps) {
  const talkMinutes: string = formatCount(topNumber.minutes);
  const callCount: string = formatCount(topNumber.calls);
  return (
    <StatsRow showsDivider={showsDivider}>
      <Text className="flex-1 text-sm font-medium" numberOfLines={1}>
        {topNumber.phone_number}
      </Text>
      <Text className="w-16 shrink-0 text-right text-sm font-semibold tabular-nums">
        {talkMinutes}
      </Text>
      <Text className="w-14 shrink-0 text-right text-sm font-semibold tabular-nums">
        {callCount}
      </Text>
    </StatsRow>
  );
}

function TopNumbersColumnHeader({ label, columnClassName }: { label: string; columnClassName: string }) {
  return (
    <Text
      className={`text-xs font-semibold uppercase tracking-wide text-muted-foreground ${columnClassName}`}
    >
      {label}
    </Text>
  );
}

function TopNumbersTable({ topNumbers }: { topNumbers: TopNumberStats[] }) {
  if (topNumbers.length === 0) {
    return (
      <View className="rounded-2xl border border-border bg-card p-4 shadow-sm shadow-black/5">
        <Text className="text-base font-bold tracking-tight">Most contacted numbers</Text>
        <Text className="mt-2 text-sm text-muted-foreground">
          No calls in the last 30 days.
        </Text>
      </View>
    );
  }
  const lastRowIndex: number = topNumbers.length - 1;
  return (
    <View className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm shadow-black/5">
      <View className="px-4 pt-4">
        <Text className="text-base font-bold tracking-tight">Most contacted numbers</Text>
        <Text className="mt-0.5 text-xs text-muted-foreground">
          Last 30 days · sorted by talk time
        </Text>
      </View>
      <View className="px-4 pb-1">
        <View className="mt-3 flex-row items-center gap-2 border-b border-border pb-2">
          <TopNumbersColumnHeader label="Number" columnClassName="flex-1" />
          <TopNumbersColumnHeader label="Min" columnClassName="w-16 shrink-0 text-right" />
          <TopNumbersColumnHeader label="Calls" columnClassName="w-14 shrink-0 text-right" />
        </View>
        {topNumbers.map((topNumber, rowIndex) => (
          <TopNumberRow
            key={topNumber.phone_number}
            topNumber={topNumber}
            showsDivider={rowIndex !== lastRowIndex}
          />
        ))}
      </View>
    </View>
  );
}

export function MyStatsScreen() {
  const { isLoading, myStats, errorMessage, reloadMyStats } = useMyStats();
  const navigation = useNavigation<NavigationProp<MainTabsParamList>>();

  function handleOpenSettingsPress(): void {
    navigation.navigate('Settings');
  }

  return (
    <View className="flex-1 bg-background">
      <MyStatsHeader
        personName={myStats?.name ?? null}
        onOpenSettings={handleOpenSettingsPress}
      />
      {isLoading ? <LoadingStats /> : null}
      {!isLoading && errorMessage ? (
        <StatsErrorCard message={errorMessage} onRetryPress={reloadMyStats} />
      ) : null}
      {!isLoading && !errorMessage && myStats ? (
        <ScrollView className="flex-1" contentContainerClassName="gap-4 px-5 pb-6 pt-4">
          <PerformanceTable myStats={myStats} />
          <TopNumbersTable topNumbers={myStats.top_numbers} />
        </ScrollView>
      ) : null}
    </View>
  );
}
