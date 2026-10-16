import { useMemo } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
import { PageHeader } from "@/shared/components/page-header";
import { getTodaysDateLabel } from "@/shared/utils/todays-date";
import { DashboardErrorState } from "../components/dashboard-error-state";
import { TopNumbersTable } from "../components/top-numbers-table";
import { isValidPersonId, usePersonStats } from "../hooks/use-person-stats";
import type { PersonDashboard, PersonPeriodStats } from "../types";
import {
  convertSecondsToMinutes,
  formatConnectedPercent,
  formatCount,
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
  const talkMinutes: number = convertSecondsToMinutes(period.stats.seconds);
  const valueLabels: PeriodValueLabels = {
    dials: formatCount(period.stats.dials),
    connected: formatCount(period.stats.connected),
    minutes: formatCount(talkMinutes),
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
      <TableCell className="p-4 text-right font-semibold tabular-nums">
        {valueLabels.dials}
      </TableCell>
      <TableCell className="p-4 text-right font-semibold tabular-nums">
        {valueLabels.connected}
      </TableCell>
      <TableCell className="p-4 text-right font-semibold tabular-nums">
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
              <TableHead className="text-right">Dials</TableHead>
              <TableHead className="text-right">Connected</TableHead>
              <TableHead className="text-right">Minutes</TableHead>
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

export function PersonPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const personId: number = Number(id);
  const hasValidPersonId: boolean = isValidPersonId(personId);
  const { personStats, isLoading, hasError, refetch } = usePersonStats(personId);
  const todaysDateLabel: string = useMemo(() => getTodaysDateLabel(), []);

  const handleBackClick = (): void => {
    navigate(-1);
  };

  const handleRetryClick = (): void => {
    refetch();
  };

  const fallbackPageTitle: string = "Person";
  const headerTitle: string = personStats?.name ?? fallbackPageTitle;
  const dateAction = (
    <span className="text-sm text-muted-foreground">{todaysDateLabel}</span>
  );

  if (!hasValidPersonId) {
    return <Navigate to="/" replace />;
  }

  if (hasError) {
    return (
      <PageHeader title={headerTitle} action={dateAction}>
        <DashboardErrorState onRetry={handleRetryClick} />
      </PageHeader>
    );
  }

  return (
    <PageHeader title={headerTitle} action={dateAction}>
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
          <PerformanceSection personStats={personStats} />
          <TopNumbersTable numbers={personStats.top_numbers} />
        </>
      )}
    </PageHeader>
  );
}
