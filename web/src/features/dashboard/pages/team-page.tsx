import { useMemo, useState, type ComponentType } from "react";
import { Clock, Megaphone, PhoneIncoming, PhoneMissed } from "lucide-react";
import { PageHeader } from "@/shared/components/page-header";
import { formatCount } from "@/shared/utils/format-count";
import { getTodaysDateLabel } from "@/shared/utils/todays-date";
import { CallsByHourChart } from "../components/calls-by-hour-chart";
import { ErrorState } from "@/shared/components/error-state";
import { KpiCard } from "../components/kpi-card";
import { PeriodSwitch } from "../components/period-switch";
import { TopPeopleList } from "../components/top-people-list";
import { useTeamDashboard } from "../hooks/use-team-dashboard";
import {
  formatAveragePerPersonPerDayLabel,
  formatConnectedPercent,
  formatYesterdayDeltaLabel,
} from "../utils/format";
import type {
  DashboardPeriod,
  TeamAveragePerPersonPerDay,
  TeamPeriodBlock,
  TeamVsYesterday,
} from "../types";

interface TeamKpiCardData {
  key: string;
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  iconClassName: string;
  valueClassName?: string;
  subLine: string;
}

function getMetricYesterdayDelta(
  yesterdayDeltas: TeamVsYesterday | null,
  metricName: keyof TeamVsYesterday
): number | null {
  if (yesterdayDeltas === null) {
    return null;
  }
  const metricDelta: number = yesterdayDeltas[metricName];
  return metricDelta;
}

function buildMetricSubLine(
  yesterdayDelta: number | null,
  averagePerPersonPerDay: number
): string {
  if (yesterdayDelta === null) {
    return formatAveragePerPersonPerDayLabel(averagePerPersonPerDay);
  }
  return formatYesterdayDeltaLabel(yesterdayDelta);
}

function buildTeamKpiCards(periodBlock: TeamPeriodBlock): TeamKpiCardData[] {
  const yesterdayDeltas: TeamVsYesterday | null = periodBlock.vs_yesterday;
  const averages: TeamAveragePerPersonPerDay = periodBlock.avg_per_person_per_day;

  const dialsSubLine: string = buildMetricSubLine(
    getMetricYesterdayDelta(yesterdayDeltas, "dials"),
    averages.dials
  );
  const connectedChangeSubLine: string = buildMetricSubLine(
    getMetricYesterdayDelta(yesterdayDeltas, "connected"),
    averages.connected
  );
  const connectedShareLabel: string = formatConnectedPercent(periodBlock.connected_percent);
  const connectedSubLine: string = `${connectedShareLabel} connected · ${connectedChangeSubLine}`;
  const notConnectedSubLine: string = buildMetricSubLine(
    getMetricYesterdayDelta(yesterdayDeltas, "not_connected"),
    averages.not_connected
  );
  const minutesSubLine: string = buildMetricSubLine(
    getMetricYesterdayDelta(yesterdayDeltas, "minutes"),
    averages.minutes
  );

  const dialsCard: TeamKpiCardData = {
    key: "dials",
    label: "Dials",
    value: formatCount(periodBlock.dials),
    icon: Megaphone,
    iconClassName: "text-primary",
    subLine: dialsSubLine,
  };

  const connectedCard: TeamKpiCardData = {
    key: "connected",
    label: "Connected calls",
    value: formatCount(periodBlock.connected),
    icon: PhoneIncoming,
    iconClassName: "text-green-500",
    valueClassName: "text-green-600",
    subLine: connectedSubLine,
  };

  const notConnectedCard: TeamKpiCardData = {
    key: "not-connected",
    label: "Not connected",
    value: formatCount(periodBlock.not_connected),
    icon: PhoneMissed,
    iconClassName: "text-red-500",
    valueClassName: "text-red-600",
    subLine: notConnectedSubLine,
  };

  const talkMinutesCard: TeamKpiCardData = {
    key: "talk-minutes",
    label: "Talk minutes",
    value: formatCount(periodBlock.minutes),
    icon: Clock,
    iconClassName: "text-primary",
    subLine: minutesSubLine,
  };

  const kpiCards: TeamKpiCardData[] = [
    dialsCard,
    connectedCard,
    notConnectedCard,
    talkMinutesCard,
  ];
  return kpiCards;
}

interface PeriodHeadingLabels {
  chart: string;
  topPeople: string;
}

function getPeriodHeadingLabels(period: DashboardPeriod): PeriodHeadingLabels {
  const chartHeadingLabelsByPeriod: Record<DashboardPeriod, string> = {
    today: "Dials per hour · Today (IST)",
    yesterday: "Dials per hour · Yesterday (IST)",
    last_30_days: "Avg dials per hour · 30 days (IST)",
  };
  const topPeopleHeadingLabelsByPeriod: Record<DashboardPeriod, string> = {
    today: "Talk time · Today",
    yesterday: "Talk time · Yesterday",
    last_30_days: "Talk time · 30 days",
  };

  const periodHeadingLabels: PeriodHeadingLabels = {
    chart: chartHeadingLabelsByPeriod[period],
    topPeople: topPeopleHeadingLabelsByPeriod[period],
  };
  return periodHeadingLabels;
}

interface TeamPerformanceSectionProps {
  periodBlock: TeamPeriodBlock;
  selectedPeriod: DashboardPeriod;
  onSelectPeriod: (period: DashboardPeriod) => void;
}

function TeamPerformanceSection({
  periodBlock,
  selectedPeriod,
  onSelectPeriod,
}: TeamPerformanceSectionProps) {
  const kpiCards: TeamKpiCardData[] = buildTeamKpiCards(periodBlock);
  const headingLabels: PeriodHeadingLabels = getPeriodHeadingLabels(selectedPeriod);
  const usesDailyAverageWording: boolean = selectedPeriod === "last_30_days";

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-bold tracking-tight sm:text-lg">Team performance</h3>
        <PeriodSwitch selectedPeriod={selectedPeriod} onSelectPeriod={onSelectPeriod} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {kpiCards.map((kpiCard: TeamKpiCardData) => (
          <KpiCard
            key={kpiCard.key}
            label={kpiCard.label}
            value={kpiCard.value}
            icon={kpiCard.icon}
            iconClassName={kpiCard.iconClassName}
            valueClassName={kpiCard.valueClassName}
            subLine={kpiCard.subLine}
          />
        ))}
      </div>
      <div className="mt-3 grid gap-3 sm:mt-4 sm:gap-4 lg:grid-cols-3">
        <CallsByHourChart
          className="lg:col-span-2"
          callsByHour={periodBlock.calls_by_hour}
          usesDailyAverageWording={usesDailyAverageWording}
          headingLabel={headingLabels.chart}
        />
        <TopPeopleList
          people={periodBlock.top_people}
          headingLabel={headingLabels.topPeople}
        />
      </div>
    </section>
  );
}

export function TeamPage() {
  const { teamDashboard, isLoading, hasError, refetch } = useTeamDashboard();
  const [selectedPeriod, setSelectedPeriod] = useState<DashboardPeriod>("today");
  const todaysDateLabel: string = useMemo(() => getTodaysDateLabel(), []);

  const handleSelectPeriod = (period: DashboardPeriod): void => {
    setSelectedPeriod(period);
  };

  const dateAction = (
    <span className="text-sm text-muted-foreground">{todaysDateLabel}</span>
  );

  if (hasError) {
    return (
      <PageHeader title="Team Dashboard" action={dateAction}>
        <ErrorState onRetry={refetch} />
      </PageHeader>
    );
  }

  return (
    <PageHeader title="Team Dashboard" action={dateAction}>
      {isLoading && <p className="text-sm text-muted-foreground">Loading dashboard…</p>}
      {teamDashboard && (
        <TeamPerformanceSection
          periodBlock={teamDashboard[selectedPeriod]}
          selectedPeriod={selectedPeriod}
          onSelectPeriod={handleSelectPeriod}
        />
      )}
    </PageHeader>
  );
}
