import { useMemo, useState, type ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Megaphone, PhoneIncoming, PhoneMissed } from "lucide-react";
import { PageHeader } from "@/shared/components/page-header";
import { formatCount } from "@/shared/utils/format-count";
import { getTodaysDateLabel } from "@/shared/utils/todays-date";
import { cn } from "@/shared/utils/cn";
import { CallsByHourChart } from "../components/calls-by-hour-chart";
import { ErrorState } from "@/shared/components/error-state";
import { KpiCard } from "../components/kpi-card";
import { TeamTable } from "../components/team-table";
import { TopPeopleList } from "../components/top-people-list";
import { useTeamDashboard } from "../hooks/use-team-dashboard";
import type { TeamDashboard, TeamPeriod, TeamPeriodStats, TeamTopPerson } from "../types";
import {
  convertSecondsToMinutes,
  formatAveragePerPersonPerDay,
  formatConnectedPercent,
  formatYesterdayComparison,
  getCountSharePercent,
} from "../utils/format";

interface TeamKpiCardData {
  key: string;
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  iconClassName: string;
  valueClassName?: string;
  subLine: string;
}

function getPeriodStats(teamDashboard: TeamDashboard, period: TeamPeriod): TeamPeriodStats {
  if (period === "yesterday") {
    return teamDashboard.yesterday;
  }
  if (period === "last_30_days") {
    return teamDashboard.last_30_days;
  }
  return teamDashboard.today;
}

function getPeriodDayCount(period: TeamPeriod): number {
  const singleDayPeriodDayCount: number = 1;
  const thirtyDayPeriodDayCount: number = 30;
  if (period === "last_30_days") {
    return thirtyDayPeriodDayCount;
  }
  return singleDayPeriodDayCount;
}

function buildAverageSubLine(
  metricTotal: number,
  periodDayCount: number,
  activePeopleCount: number,
  todayComparison: string | null
): string {
  const averageLabel: string = formatAveragePerPersonPerDay(
    metricTotal,
    periodDayCount,
    activePeopleCount
  );
  if (todayComparison === null) {
    return averageLabel;
  }
  const subLine: string = `${averageLabel} · ${todayComparison}`;
  return subLine;
}

function buildShareAverageSubLine(
  count: number,
  dials: number,
  shareLabelNoun: string,
  periodDayCount: number,
  activePeopleCount: number,
  todayComparison: string | null
): string {
  const sharePercent: number | null = getCountSharePercent(count, dials);
  const shareLabel: string = `${formatConnectedPercent(sharePercent)} ${shareLabelNoun}`;
  const averageLabel: string = formatAveragePerPersonPerDay(
    count,
    periodDayCount,
    activePeopleCount
  );
  const subLineParts: string[] = [shareLabel, averageLabel];
  if (todayComparison !== null) {
    subLineParts.push(todayComparison);
  }
  const subLine: string = subLineParts.join(" · ");
  return subLine;
}

function buildTeamKpiCards(
  teamDashboard: TeamDashboard,
  period: TeamPeriod
): TeamKpiCardData[] {
  const periodStats: TeamPeriodStats = getPeriodStats(teamDashboard, period);
  const periodDayCount: number = getPeriodDayCount(period);
  const activePeopleCount: number = teamDashboard.people.length;
  const isTodaySelected: boolean = period === "today";

  const notConnectedCount: number = periodStats.dials - periodStats.connected;
  const secondsPerMinute: number = 60;
  const exactTalkMinutes: number = periodStats.seconds / secondsPerMinute;
  const talkMinutes: number = convertSecondsToMinutes(periodStats.seconds);

  const dialsComparison: string | null = isTodaySelected
    ? formatYesterdayComparison(periodStats.dials, teamDashboard.yesterday.dials)
    : null;
  const connectedComparison: string | null = isTodaySelected
    ? formatYesterdayComparison(periodStats.connected, teamDashboard.yesterday.connected)
    : null;
  const notConnectedComparison: string | null = isTodaySelected
    ? formatYesterdayComparison(
        notConnectedCount,
        teamDashboard.yesterday.dials - teamDashboard.yesterday.connected
      )
    : null;
  const minutesComparison: string | null = isTodaySelected
    ? formatYesterdayComparison(talkMinutes, convertSecondsToMinutes(teamDashboard.yesterday.seconds))
    : null;

  const dialsCard: TeamKpiCardData = {
    key: "dials",
    label: "Dials",
    value: formatCount(periodStats.dials),
    icon: Megaphone,
    iconClassName: "text-primary",
    subLine: buildAverageSubLine(
      periodStats.dials,
      periodDayCount,
      activePeopleCount,
      dialsComparison
    ),
  };

  const connectedCard: TeamKpiCardData = {
    key: "connected",
    label: "Connected calls",
    value: formatCount(periodStats.connected),
    icon: PhoneIncoming,
    iconClassName: "text-green-500",
    valueClassName: "text-green-600",
    subLine: buildShareAverageSubLine(
      periodStats.connected,
      periodStats.dials,
      "connected",
      periodDayCount,
      activePeopleCount,
      connectedComparison
    ),
  };

  const notConnectedCard: TeamKpiCardData = {
    key: "not-connected",
    label: "Not connected",
    value: formatCount(notConnectedCount),
    icon: PhoneMissed,
    iconClassName: "text-red-500",
    valueClassName: "text-red-600",
    subLine: buildShareAverageSubLine(
      notConnectedCount,
      periodStats.dials,
      "of dials",
      periodDayCount,
      activePeopleCount,
      notConnectedComparison
    ),
  };

  const talkMinutesCard: TeamKpiCardData = {
    key: "talk-minutes",
    label: "Talk minutes",
    value: formatCount(talkMinutes),
    icon: Clock,
    iconClassName: "text-primary",
    subLine: buildAverageSubLine(
      exactTalkMinutes,
      periodDayCount,
      activePeopleCount,
      minutesComparison
    ),
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

function getPeriodHeadingLabels(period: TeamPeriod): PeriodHeadingLabels {
  const chartHeadingLabelsByPeriod: Record<TeamPeriod, string> = {
    today: "Dials per hour · Today (IST)",
    yesterday: "Dials per hour · Yesterday (IST)",
    last_30_days: "Avg dials per hour · 30 days (IST)",
  };
  const topPeopleHeadingLabelsByPeriod: Record<TeamPeriod, string> = {
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

interface PeriodSwitchProps {
  selectedPeriod: TeamPeriod;
  onSelectPeriod: (period: TeamPeriod) => void;
}

function PeriodSwitch({ selectedPeriod, onSelectPeriod }: PeriodSwitchProps) {
  const periodOptions: Array<{ value: TeamPeriod; label: string }> = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last_30_days", label: "30 days" },
  ];

  const handleSelectClick = (period: TeamPeriod): void => {
    onSelectPeriod(period);
  };

  return (
    <div
      role="group"
      aria-label="Dashboard period"
      className="inline-flex rounded-full border bg-card p-1 shadow-sm"
    >
      {periodOptions.map((periodOption) => {
        const isSelected: boolean = periodOption.value === selectedPeriod;
        return (
          <button
            key={periodOption.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => handleSelectClick(periodOption.value)}
            className={cn(
              "cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              isSelected
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {periodOption.label}
          </button>
        );
      })}
    </div>
  );
}

interface TeamPerformanceSectionProps {
  teamDashboard: TeamDashboard;
  selectedPeriod: TeamPeriod;
  onSelectPeriod: (period: TeamPeriod) => void;
}

function TeamPerformanceSection({
  teamDashboard,
  selectedPeriod,
  onSelectPeriod,
}: TeamPerformanceSectionProps) {
  const kpiCards: TeamKpiCardData[] = buildTeamKpiCards(teamDashboard, selectedPeriod);
  const headingLabels: PeriodHeadingLabels = getPeriodHeadingLabels(selectedPeriod);
  const periodHourlyDials: number[] = teamDashboard.calls_by_hour[selectedPeriod];
  const periodTopPeople: TeamTopPerson[] = teamDashboard.top_people[selectedPeriod];
  const showsDailyAverage: boolean = selectedPeriod === "last_30_days";

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
          hourlyDials={periodHourlyDials}
          showsDailyAverage={showsDailyAverage}
          headingLabel={headingLabels.chart}
        />
        <TopPeopleList
          people={periodTopPeople}
          headingLabel={headingLabels.topPeople}
        />
      </div>
    </section>
  );
}

export function TeamPage() {
  const { teamDashboard, isLoading, hasError, refetch } = useTeamDashboard();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<TeamPeriod>("today");
  const todaysDateLabel: string = useMemo(() => getTodaysDateLabel(), []);

  const handleOpenPerson = (personId: number): void => {
    navigate(`/person/${personId}?from=/`);
  };

  const handleSelectPeriod = (period: TeamPeriod): void => {
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
        <>
          <TeamPerformanceSection
            teamDashboard={teamDashboard}
            selectedPeriod={selectedPeriod}
            onSelectPeriod={handleSelectPeriod}
          />
          <TeamTable people={teamDashboard.people} onOpenPerson={handleOpenPerson} />
        </>
      )}
    </PageHeader>
  );
}
