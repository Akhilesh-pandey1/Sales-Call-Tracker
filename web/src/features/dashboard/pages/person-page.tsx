import { useMemo, useState, type ComponentType, type ReactElement } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Megaphone, PhoneIncoming } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/shared/utils/cn";
import { ErrorState } from "@/shared/components/error-state";
import { PageHeader } from "@/shared/components/page-header";
import { formatCount } from "@/shared/utils/format-count";
import { getTodaysDateLabel } from "@/shared/utils/todays-date";
import { CallsByHourChart } from "../components/calls-by-hour-chart";
import { KpiCard } from "../components/kpi-card";
import { PeriodSwitch } from "../components/period-switch";
import { TopNumbersTable } from "../components/top-numbers-table";
import { isValidPersonId, usePersonStats } from "../hooks/use-person-stats";
import type {
  CallsByHourBlock,
  DashboardPeriod,
  PersonAveragePerActiveDay,
  PersonDashboard,
  PersonLast30DaysStats,
  PersonPeriodStats,
} from "../types";
import {
  formatActiveDaysOutOfPeriod,
  formatConnectedPercent,
  getPersonInitials,
} from "../utils/format";

interface PeriodView {
  label: string;
  stats: PersonPeriodStats;
}

function buildPeriodViews(personStats: PersonDashboard): PeriodView[] {
  const periodViews: PeriodView[] = [
    { label: "Today", stats: personStats.today },
    { label: "Yesterday", stats: personStats.yesterday },
    { label: "Last 30 days", stats: personStats.last_30_days },
  ];
  return periodViews;
}

interface PeriodValueLabels {
  dials: string;
  connected: string;
  minutes: string;
  connectedPercent: string;
}

function buildPeriodValueLabels(period: PeriodView): PeriodValueLabels {
  const valueLabels: PeriodValueLabels = {
    dials: formatCount(period.stats.dials),
    connected: formatCount(period.stats.connected),
    minutes: formatCount(period.stats.minutes),
    connectedPercent: formatConnectedPercent(period.stats.connected_percent),
  };
  return valueLabels;
}

interface DesktopPeriodRowProps {
  period: PeriodView;
}

function DesktopPeriodRow({ period }: DesktopPeriodRowProps) {
  const valueLabels: PeriodValueLabels = buildPeriodValueLabels(period);

  return (
    <TableRow>
      <TableCell className="p-4 font-medium">{period.label}</TableCell>
      <TableCell className="p-4 text-left font-semibold tabular-nums">
        {valueLabels.dials}
      </TableCell>
      <TableCell className="p-4 text-center font-semibold tabular-nums">
        {valueLabels.connected}
      </TableCell>
      <TableCell className="p-4 text-center font-semibold tabular-nums">
        {valueLabels.minutes}
      </TableCell>
      <TableCell className="p-4 text-right font-semibold tabular-nums">
        {valueLabels.connectedPercent}
      </TableCell>
    </TableRow>
  );
}

interface MobilePeriodMetricProps {
  label: string;
  value: string;
  isMuted: boolean;
}

function MobilePeriodMetric({ label, value, isMuted }: MobilePeriodMetricProps) {
  const valueClassName: string = cn(
    "mt-0.5 text-sm font-semibold tabular-nums",
    isMuted && "text-muted-foreground"
  );

  return (
    <div className="text-center">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={valueClassName}>{value}</p>
    </div>
  );
}

interface MobilePeriodBlockProps {
  period: PeriodView;
}

function MobilePeriodBlock({ period }: MobilePeriodBlockProps) {
  const valueLabels: PeriodValueLabels = buildPeriodValueLabels(period);
  const hasNoDials: boolean = period.stats.connected_percent === null;

  return (
    <div className="py-3.5">
      <p className="text-sm font-semibold">{period.label}</p>
      <div className="mt-2 grid grid-cols-4 gap-1 text-center">
        <MobilePeriodMetric label="Dials" value={valueLabels.dials} isMuted={hasNoDials} />
        <MobilePeriodMetric label="Connected" value={valueLabels.connected} isMuted={hasNoDials} />
        <MobilePeriodMetric label="Minutes" value={valueLabels.minutes} isMuted={hasNoDials} />
        <MobilePeriodMetric
          label="Conn. %"
          value={valueLabels.connectedPercent}
          isMuted={hasNoDials}
        />
      </div>
    </div>
  );
}

interface PerformanceSectionProps {
  personStats: PersonDashboard;
}

function PerformanceSection({ personStats }: PerformanceSectionProps) {
  const periodViews: PeriodView[] = buildPeriodViews(personStats);

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-6">
        <h3 className="text-base font-bold tracking-tight">Performance</h3>
        <span className="text-xs text-muted-foreground">— means no dials in the period</span>
      </div>

      <div className="hidden px-5 pb-4 sm:px-6 md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Period</TableHead>
              <TableHead className="text-left">Dials</TableHead>
              <TableHead className="text-center">Connected</TableHead>
              <TableHead className="text-center">Minutes</TableHead>
              <TableHead className="text-right">Connected %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {periodViews.map((period: PeriodView) => (
              <DesktopPeriodRow key={period.label} period={period} />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="px-4 pb-3 sm:px-6 md:hidden">
        <div className="mt-3 divide-y">
          {periodViews.map((period: PeriodView) => (
            <MobilePeriodBlock key={period.label} period={period} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface PersonAvatarProps {
  name: string;
}

function PersonAvatar({ name }: PersonAvatarProps) {
  const initials: string = getPersonInitials(name);

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
      {initials}
    </div>
  );
}

interface PersonKpiCardData {
  key: string;
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  iconClassName: string;
  valueClassName?: string;
  subLine: string;
}

function buildAverageCardValue(
  averagePerActiveDay: PersonAveragePerActiveDay | null,
  metricName: keyof PersonAveragePerActiveDay
): string {
  const noAverageLabel: string = "—";
  if (averagePerActiveDay === null) {
    return noAverageLabel;
  }
  return formatCount(averagePerActiveDay[metricName]);
}

function buildAverageCardSubLine(metricTotal: number): string {
  const subLine: string = `per active day · ${formatCount(metricTotal)} total`;
  return subLine;
}

function buildPersonKpiCards(last30DaysStats: PersonLast30DaysStats): PersonKpiCardData[] {
  const averagePerActiveDay: PersonAveragePerActiveDay | null =
    last30DaysStats.avg_per_active_day;

  const activeDaysCard: PersonKpiCardData = {
    key: "active-days",
    label: "Active days",
    value: formatActiveDaysOutOfPeriod(last30DaysStats.active_days),
    icon: Calendar,
    iconClassName: "text-primary",
    subLine: "days with at least 1 dial",
  };

  const avgDialsCard: PersonKpiCardData = {
    key: "avg-dials",
    label: "Avg dials",
    value: buildAverageCardValue(averagePerActiveDay, "dials"),
    icon: Megaphone,
    iconClassName: "text-primary",
    subLine: buildAverageCardSubLine(last30DaysStats.dials),
  };

  const avgConnectedCard: PersonKpiCardData = {
    key: "avg-connected",
    label: "Avg connected",
    value: buildAverageCardValue(averagePerActiveDay, "connected"),
    icon: PhoneIncoming,
    iconClassName: "text-green-500",
    valueClassName: "text-green-600",
    subLine: buildAverageCardSubLine(last30DaysStats.connected),
  };

  const avgMinutesCard: PersonKpiCardData = {
    key: "avg-minutes",
    label: "Avg minutes",
    value: buildAverageCardValue(averagePerActiveDay, "minutes"),
    icon: Clock,
    iconClassName: "text-primary",
    subLine: buildAverageCardSubLine(last30DaysStats.minutes),
  };

  const kpiCards: PersonKpiCardData[] = [
    activeDaysCard,
    avgDialsCard,
    avgConnectedCard,
    avgMinutesCard,
  ];
  return kpiCards;
}

interface Last30DaysKpiSectionProps {
  last30DaysStats: PersonLast30DaysStats;
}

function Last30DaysKpiSection({ last30DaysStats }: Last30DaysKpiSectionProps) {
  const kpiCards: PersonKpiCardData[] = buildPersonKpiCards(last30DaysStats);

  return (
    <section>
      <h3 className="text-base font-bold tracking-tight text-primary sm:text-lg">Last 30 days</h3>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {kpiCards.map((kpiCard: PersonKpiCardData) => (
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
    </section>
  );
}

interface CallsByHourSectionProps {
  callsByHour: CallsByHourBlock;
  selectedPeriod: DashboardPeriod;
  onSelectPeriod: (period: DashboardPeriod) => void;
}

function CallsByHourSection({
  callsByHour,
  selectedPeriod,
  onSelectPeriod,
}: CallsByHourSectionProps) {
  const usesDailyAverageWording: boolean = selectedPeriod === "last_30_days";

  return (
    <CallsByHourChart
      callsByHour={callsByHour}
      usesDailyAverageWording={usesDailyAverageWording}
      headingAction={
        <PeriodSwitch selectedPeriod={selectedPeriod} onSelectPeriod={onSelectPeriod} />
      }
    />
  );
}

function getPersonPageBackTarget(fromSectionPath: string | null): string {
  const teamPagePath: string = "/team";
  const accountsPagePath: string = "/accounts";
  const fallbackBackTarget: string = teamPagePath;

  if (fromSectionPath === teamPagePath || fromSectionPath === accountsPagePath) {
    return fromSectionPath;
  }
  return fallbackBackTarget;
}

export function PersonPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const personId: number = Number(id);
  const hasValidPersonId: boolean = isValidPersonId(personId);
  const { personStats, isLoading, hasError, refetch } = usePersonStats(personId);
  const [selectedPeriod, setSelectedPeriod] = useState<DashboardPeriod>("last_30_days");
  const todaysDateLabel: string = useMemo(() => getTodaysDateLabel(), []);
  const fromSectionPath: string | null = searchParams.get("from");
  const backTargetPath: string = getPersonPageBackTarget(fromSectionPath);

  const handleBackClick = (): void => {
    navigate(backTargetPath);
  };

  const handleRetryClick = (): void => {
    refetch();
  };

  const handleSelectPeriod = (period: DashboardPeriod): void => {
    setSelectedPeriod(period);
  };

  const fallbackPageTitle: string = "Person";
  const headerTitle: string = personStats?.name ?? fallbackPageTitle;
  const headerAvatar: ReactElement | undefined = personStats ? (
    <PersonAvatar name={personStats.name} />
  ) : undefined;
  const dateAction = (
    <span className="text-sm text-muted-foreground">{todaysDateLabel}</span>
  );

  if (!hasValidPersonId) {
    return <Navigate to="/" replace />;
  }

  if (hasError) {
    return (
      <PageHeader title={headerTitle} icon={headerAvatar} action={dateAction}>
        <ErrorState onRetry={handleRetryClick} />
      </PageHeader>
    );
  }

  return (
    <PageHeader title={headerTitle} icon={headerAvatar} action={dateAction}>
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackClick}
          className="-ml-2 rounded-xl text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading stats…</p>}
      {personStats && (
        <>
          <Last30DaysKpiSection last30DaysStats={personStats.last_30_days} />
          <PerformanceSection personStats={personStats} />
          <CallsByHourSection
            callsByHour={personStats[selectedPeriod].calls_by_hour}
            selectedPeriod={selectedPeriod}
            onSelectPeriod={handleSelectPeriod}
          />
          <TopNumbersTable numbers={personStats.top_numbers} />
        </>
      )}
    </PageHeader>
  );
}
