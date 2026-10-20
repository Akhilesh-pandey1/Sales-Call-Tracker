import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  Calendar,
  ChartColumn,
  Clock,
  CloudOff,
  Megaphone,
  Percent,
  Phone,
  PhoneCall,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type {
  CallsByHourStats,
  Last30DaysStats,
  PersonStats,
  PeriodStats,
} from '../api/stats.api';
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

function formatAverageOrNoDataLabel(average: number | null): string {
  if (average === null) {
    const noAverageLabel = '—';
    return noAverageLabel;
  }
  const averageLabel: string = formatCount(average);
  return averageLabel;
}

function formatHourLabel(hourNumber: number): string {
  const hoursOnTwelveHourClock = 12;
  const hourOnTwelveHourClock: number = hourNumber % hoursOnTwelveHourClock;
  const isNoonOrMidnight: boolean = hourOnTwelveHourClock === 0;
  const displayedHour: number = isNoonOrMidnight ? hoursOnTwelveHourClock : hourOnTwelveHourClock;
  const meridiem: string = hourNumber < hoursOnTwelveHourClock ? 'AM' : 'PM';
  const hourLabel: string = `${displayedHour} ${meridiem}`;
  return hourLabel;
}

function getAxisHourLabel(hourNumber: number, hourIndex: number, lastHourIndex: number): string {
  const noonHour = 12;
  const isFirstHour: boolean = hourIndex === 0;
  const isLastHour: boolean = hourIndex === lastHourIndex;
  const isNoon: boolean = hourNumber === noonHour;
  if (isFirstHour || isLastHour || isNoon) {
    const meridiemHourLabel: string = formatHourLabel(hourNumber);
    return meridiemHourLabel;
  }
  const plainHourLabel: string = String(hourNumber);
  return plainHourLabel;
}

type HourBar = {
  hour: number;
  heightPercent: string;
  valueLabel: string;
  valueClassName: string;
  barClassName: string;
  axisLabel: string;
  axisLabelClassName: string;
};

function buildHourBars(callsByHour: CallsByHourStats): HourBar[] {
  const highestDialCount: number = Math.max(...callsByHour.dials);
  const halfOfHighestDialCount: number = highestDialCount / 2;
  const lastHourIndex: number = callsByHour.hours.length - 1;
  return callsByHour.hours.map((hour, hourIndex) => {
    const dialCount: number = callsByHour.dials[hourIndex];
    const isBestHour: boolean = hour === callsByHour.best_hour;
    const heightRatio: number = highestDialCount === 0 ? 0 : dialCount / highestDialCount;
    const heightPercent: string = `${heightRatio * 100}%`;
    let barClassName: string = 'bg-muted';
    if (isBestHour) {
      barClassName = 'bg-primary';
    } else if (dialCount >= halfOfHighestDialCount) {
      barClassName = 'bg-secondary';
    }
    let valueClassName: string = 'text-muted-foreground';
    let axisLabelClassName: string = 'text-muted-foreground';
    if (isBestHour) {
      valueClassName = 'font-semibold text-primary';
      axisLabelClassName = 'font-semibold text-foreground';
    }
    const hourBar: HourBar = {
      hour,
      heightPercent,
      valueLabel: formatCount(dialCount),
      valueClassName,
      barClassName,
      axisLabel: getAxisHourLabel(hour, hourIndex, lastHourIndex),
      axisLabelClassName,
    };
    return hourBar;
  });
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
};

function MyStatsHeader({ personName }: MyStatsHeaderProps) {
  return (
    <View className="flex-row items-center gap-3 border-b border-border bg-card px-3 py-3">
      {personName ? (
        <>
          <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
            <Text className="text-sm font-bold text-primary-foreground">
              {getPersonInitials(personName)}
            </Text>
          </View>
          <View className="min-w-0">
            <Text className="text-lg font-bold leading-tight tracking-tight">
              {personName}
            </Text>
            <Text className="text-xs text-muted-foreground">My Calling Stats</Text>
          </View>
        </>
      ) : null}
    </View>
  );
}

type StatsErrorCardProps = {
  message: string;
  onRetryPress: () => void;
};

function StatsErrorCard({ message, onRetryPress }: StatsErrorCardProps) {
  return (
    <View className="flex-1 items-center justify-center px-3">
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

type PerformanceColumnHeaderProps = {
  icon: LucideIcon;
};

function PerformanceColumnHeader({ icon }: PerformanceColumnHeaderProps) {
  return (
    <View className="flex-1 items-end">
      <Icon as={icon} size={14} className="text-muted-foreground" />
    </View>
  );
}

type PerformanceTableProps = {
  periodStats: Record<ChartPeriod, PeriodStats>;
};

function PerformanceTable({ periodStats }: PerformanceTableProps) {
  const periodRows = [
    { periodLabel: 'Today', periodStats: periodStats.today },
    { periodLabel: 'Yesterday', periodStats: periodStats.yesterday },
    { periodLabel: 'Last 30 days', periodStats: periodStats.last_30_days },
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
          <PerformanceColumnHeader icon={Phone} />
          <PerformanceColumnHeader icon={PhoneCall} />
          <PerformanceColumnHeader icon={Clock} />
          <PerformanceColumnHeader icon={Percent} />
        </View>
        {periodRows.map((periodRow, rowIndex) => (
          <PeriodStatsRow
            key={periodRow.periodLabel}
            periodLabel={periodRow.periodLabel}
            periodStats={periodRow.periodStats}
            showsDivider={rowIndex !== lastRowIndex}
          />
        ))}
        <Text className="border-t border-border pt-2 text-[10px] text-muted-foreground">
          Dials · Connected · Minutes · Connected %
        </Text>
      </View>
    </View>
  );
}

type KpiCardProps = {
  label: string;
  icon: LucideIcon;
  isAccent: boolean;
  value: string;
  subLine: string;
};

function KpiCard({ label, icon, isAccent, value, subLine }: KpiCardProps) {
  const iconClassName: string = isAccent ? 'text-accent' : 'text-primary';
  const valueClassName: string = isAccent ? 'text-accent' : '';
  return (
    <View className="flex-1 rounded-2xl border border-border bg-card p-4 shadow-sm shadow-black/5">
      <View className="flex-row items-center justify-between gap-2">
        <Text className="text-sm font-medium text-muted-foreground">{label}</Text>
        <Icon as={icon} size={20} className={iconClassName} />
      </View>
      <Text className={`mt-2 text-2xl font-bold tabular-nums tracking-tight ${valueClassName}`}>
        {value}
      </Text>
      <Text className="mt-1 text-xs text-muted-foreground">{subLine}</Text>
    </View>
  );
}

type Last30DaysCardsProps = {
  last30DaysStats: Last30DaysStats;
};

function Last30DaysCards({ last30DaysStats }: Last30DaysCardsProps) {
  const periodDayCount = 30;
  const averagePerActiveDay = last30DaysStats.avg_per_active_day;
  const activeDaysValue: string = `${last30DaysStats.active_days} / ${periodDayCount}`;
  const averageDials: number | null = averagePerActiveDay?.dials ?? null;
  const averageConnected: number | null = averagePerActiveDay?.connected ?? null;
  const averageMinutes: number | null = averagePerActiveDay?.minutes ?? null;
  const avgDialsValue: string = formatAverageOrNoDataLabel(averageDials);
  const avgConnectedValue: string = formatAverageOrNoDataLabel(averageConnected);
  const avgMinutesValue: string = formatAverageOrNoDataLabel(averageMinutes);
  return (
    <View>
      <Text className="text-base font-bold tracking-tight">Last 30 days</Text>
      <View className="mt-3 gap-3">
        <View className="flex-row gap-3">
          <KpiCard
            label="Active days"
            icon={Calendar}
            isAccent={false}
            value={activeDaysValue}
            subLine="days with at least 1 dial"
          />
          <KpiCard
            label="Avg dials"
            icon={Megaphone}
            isAccent={false}
            value={avgDialsValue}
            subLine={`per active day · ${formatCount(last30DaysStats.dials)} total`}
          />
        </View>
        <View className="flex-row gap-3">
          <KpiCard
            label="Avg connected"
            icon={Phone}
            isAccent
            value={avgConnectedValue}
            subLine={`per active day · ${formatCount(last30DaysStats.connected)} total`}
          />
          <KpiCard
            label="Avg minutes"
            icon={Clock}
            isAccent={false}
            value={avgMinutesValue}
            subLine={`per active day · ${formatCount(last30DaysStats.minutes)} total`}
          />
        </View>
      </View>
    </View>
  );
}

function ChartEmptyNote() {
  return (
    <View className="mt-4 items-center gap-2 rounded-xl border border-dashed border-border px-6 py-10">
      <Icon as={ChartColumn} size={32} className="text-muted-foreground" />
      <Text className="text-center text-sm text-muted-foreground">No calls in this period.</Text>
    </View>
  );
}

type HourBarsChartProps = {
  hourBars: HourBar[];
};

function HourBarsChart({ hourBars }: HourBarsChartProps) {
  return (
    <View className="mt-4 h-32 flex-row items-end gap-1.5">
      {hourBars.map(hourBar => (
        <View key={hourBar.hour} className="h-full flex-1 items-center gap-1">
          <View className="w-full flex-1 justify-end">
            <Text
              numberOfLines={1}
              className={`mb-1 text-center text-[9px] tabular-nums ${hourBar.valueClassName}`}
            >
              {hourBar.valueLabel}
            </Text>
            <View
              className={`w-full rounded-t-md ${hourBar.barClassName}`}
              style={{ height: hourBar.heightPercent }}
            />
          </View>
          <Text numberOfLines={1} className={`text-[9px] ${hourBar.axisLabelClassName}`}>
            {hourBar.axisLabel}
          </Text>
        </View>
      ))}
    </View>
  );
}

type ChartPeriod = 'today' | 'yesterday' | 'last_30_days';

type ChartPeriodInfo = {
  switchLabel: string;
  dialsWord: string;
};

const chartPeriodsInfo: Record<ChartPeriod, ChartPeriodInfo> = {
  today: { switchLabel: 'Today', dialsWord: 'Dials' },
  yesterday: { switchLabel: 'Yesterday', dialsWord: 'Dials' },
  last_30_days: { switchLabel: '30 days', dialsWord: 'Avg dials' },
};

type ChartPeriodSwitchProps = {
  selectedPeriod: ChartPeriod;
  onPeriodPress: (period: ChartPeriod) => void;
};

function ChartPeriodSwitch({ selectedPeriod, onPeriodPress }: ChartPeriodSwitchProps) {
  const switchPeriodOrder: ChartPeriod[] = ['today', 'yesterday', 'last_30_days'];
  return (
    <View
      accessibilityLabel="Period for calls by hour"
      className="flex-row rounded-xl border border-border bg-card p-1"
    >
      {switchPeriodOrder.map(period => {
        const periodInfo: ChartPeriodInfo = chartPeriodsInfo[period];
        const isSelected: boolean = period === selectedPeriod;
        const handlePress = () => onPeriodPress(period);
        const labelClassName: string = isSelected
          ? 'text-xs font-semibold text-primary-foreground'
          : 'text-xs font-medium text-muted-foreground';
        return (
          <Pressable
            key={period}
            accessibilityRole="button"
            accessibilityLabel={periodInfo.switchLabel}
            accessibilityState={{ selected: isSelected }}
            onPress={handlePress}
            className={`rounded-lg px-2.5 py-1 ${isSelected ? 'bg-primary' : ''}`}
          >
            <Text className={labelClassName}>{periodInfo.switchLabel}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type CallsByHourChartProps = {
  periodCallsByHour: Record<ChartPeriod, CallsByHourStats>;
};

function CallsByHourChart({ periodCallsByHour }: CallsByHourChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>('today');
  const selectedCallsByHour: CallsByHourStats = periodCallsByHour[selectedPeriod];
  const selectedPeriodInfo: ChartPeriodInfo = chartPeriodsInfo[selectedPeriod];
  const bestHour: number | null = selectedCallsByHour.best_hour;
  const isChartEmpty: boolean = bestHour === null;
  const hourBars: HourBar[] = isChartEmpty ? [] : buildHourBars(selectedCallsByHour);
  const chartFooterText: string =
    bestHour === null
      ? ''
      : `${selectedPeriodInfo.dialsWord} per hour · ${selectedPeriodInfo.switchLabel} (IST). Best hour: ${formatHourLabel(bestHour)}.`;

  const handlePeriodPress = (period: ChartPeriod): void => {
    setSelectedPeriod(period);
  };

  return (
    <View className="rounded-2xl border border-border bg-card p-4 shadow-sm shadow-black/5">
      <View className="flex-row flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <Text className="text-base font-bold tracking-tight">Calls by hour</Text>
        <ChartPeriodSwitch selectedPeriod={selectedPeriod} onPeriodPress={handlePeriodPress} />
      </View>
      {isChartEmpty ? (
        <ChartEmptyNote />
      ) : (
        <>
          <HourBarsChart hourBars={hourBars} />
          <Text className="mt-2 text-xs text-muted-foreground">{chartFooterText}</Text>
        </>
      )}
    </View>
  );
}

function collectPeriodStats(myStats: PersonStats): Record<ChartPeriod, PeriodStats> {
  const periodStats: Record<ChartPeriod, PeriodStats> = {
    today: myStats.today,
    yesterday: myStats.yesterday,
    last_30_days: myStats.last_30_days,
  };
  return periodStats;
}

function collectPeriodCallsByHour(myStats: PersonStats): Record<ChartPeriod, CallsByHourStats> {
  const periodCallsByHour: Record<ChartPeriod, CallsByHourStats> = {
    today: myStats.today.calls_by_hour,
    yesterday: myStats.yesterday.calls_by_hour,
    last_30_days: myStats.last_30_days.calls_by_hour,
  };
  return periodCallsByHour;
}

export function MyStatsScreen() {
  const { isLoading, myStats, errorMessage, reloadMyStats } = useMyStats();
  const { top: topInset } = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: topInset }}>
      <MyStatsHeader personName={myStats?.name ?? null} />
      {isLoading ? <LoadingStats /> : null}
      {!isLoading && errorMessage ? (
        <StatsErrorCard message={errorMessage} onRetryPress={reloadMyStats} />
      ) : null}
      {!isLoading && !errorMessage && myStats ? (
        <ScrollView className="flex-1" contentContainerClassName="gap-4 px-3 pb-6 pt-4">
          <Last30DaysCards last30DaysStats={myStats.last_30_days} />
          <PerformanceTable periodStats={collectPeriodStats(myStats)} />
          <CallsByHourChart periodCallsByHour={collectPeriodCallsByHour(myStats)} />
        </ScrollView>
      ) : null}
    </View>
  );
}
