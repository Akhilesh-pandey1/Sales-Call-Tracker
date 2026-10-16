import { useMemo, type ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, PhoneIncoming, PhoneOutgoing } from "lucide-react";
import { PageHeader } from "@/shared/components/page-header";
import { getTodaysDateLabel } from "@/shared/utils/todays-date";
import { DashboardErrorState } from "../components/dashboard-error-state";
import { TeamTable } from "../components/team-table";
import { useTeamDashboard } from "../hooks/use-team-dashboard";
import type { TeamPeriodStats } from "../types";
import { convertSecondsToMinutes } from "../utils/format";

interface KpiCardProps {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
}

function KpiCard({ label, value, icon: Icon }: KpiCardProps) {
  return (
    <div className="rounded-2xl border bg-card p-3 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground sm:text-sm">{label}</span>
        <Icon className="h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" />
      </div>
      <div className="mt-2 text-xl font-bold tabular-nums tracking-tight sm:text-3xl">{value}</div>
    </div>
  );
}

interface PeriodKpiSectionProps {
  label: string;
  stats: TeamPeriodStats;
}

function PeriodKpiSection({ label, stats }: PeriodKpiSectionProps) {
  const talkMinutes: number = convertSecondsToMinutes(stats.seconds);

  return (
    <section>
      <h3 className="text-base font-bold tracking-tight">{label}</h3>
      <div className="mt-3 grid grid-cols-3 gap-3 sm:gap-4">
        <KpiCard label="Dials" value={stats.dials} icon={PhoneOutgoing} />
        <KpiCard label="Connected calls" value={stats.connected} icon={PhoneIncoming} />
        <KpiCard label="Talk minutes" value={talkMinutes} icon={Clock} />
      </div>
    </section>
  );
}

export function TeamPage() {
  const { teamDashboard, isLoading, hasError, refetch } = useTeamDashboard();
  const navigate = useNavigate();
  const todaysDateLabel: string = useMemo(() => getTodaysDateLabel(), []);

  const handleOpenPerson = (personId: number): void => {
    navigate(`/person/${personId}`);
  };

  const dateAction = (
    <span className="text-sm text-muted-foreground">{todaysDateLabel}</span>
  );

  if (hasError) {
    return (
      <PageHeader title="Team Dashboard" action={dateAction}>
        <DashboardErrorState onRetry={refetch} />
      </PageHeader>
    );
  }

  return (
    <PageHeader title="Team Dashboard" action={dateAction}>
      {isLoading && <p className="text-sm text-muted-foreground">Loading dashboard…</p>}
      {teamDashboard && (
        <>
          <PeriodKpiSection label="Today" stats={teamDashboard.today} />
          <PeriodKpiSection label="Yesterday" stats={teamDashboard.yesterday} />
          <TeamTable people={teamDashboard.people} onOpenPerson={handleOpenPerson} />
        </>
      )}
    </PageHeader>
  );
}
