import type { LeadPoolCounts, LeadWaitingAttemptCounts } from "../types";
import { formatCount } from "../utils/format";

interface LeadPoolStage {
  key: string;
  cardLabel: string;
  cardDescription: string;
  legendLabel: string;
  count: number;
  valueClassName: string;
  colorClassName: string;
}

interface LeadPoolStageCardProps {
  stage: LeadPoolStage;
}

interface PoolCompositionBarProps {
  stages: LeadPoolStage[];
  totalLeads: number;
}

interface PoolCompositionLegendProps {
  stages: LeadPoolStage[];
}

interface LeadPoolStatsProps {
  pool: LeadPoolCounts;
}

function getStageWidthPercent(stageCount: number, totalLeads: number): number {
  const fullPercentScale: number = 100;
  const noPoolWidth: number = 0;
  if (totalLeads === 0) {
    return noPoolWidth;
  }
  const stageShare: number = stageCount / totalLeads;
  const widthPercent: number = stageShare * fullPercentScale;
  return widthPercent;
}

function buildPoolStages(pool: LeadPoolCounts): LeadPoolStage[] {
  const waitingStageValueClassName: string = "text-card-foreground";
  const scheduledStageValueClassName: string = "text-indigo-600";
  const stoppedStageValueClassName: string = "text-rose-600";
  const waitingByAttempt: LeadWaitingAttemptCounts = pool.waiting_by_attempts;
  return [
    {
      key: "waiting-0-calls",
      cardLabel: "Waiting (0 calls)",
      cardDescription: "Fresh leads in queue",
      legendLabel: "0 calls",
      count: waitingByAttempt["0"],
      valueClassName: waitingStageValueClassName,
      colorClassName: "bg-blue-500",
    },
    {
      key: "waiting-1-call",
      cardLabel: "Waiting (1 call)",
      cardDescription: "Awaiting 2nd attempt",
      legendLabel: "1 call",
      count: waitingByAttempt["1"],
      valueClassName: waitingStageValueClassName,
      colorClassName: "bg-amber-500",
    },
    {
      key: "waiting-2-calls",
      cardLabel: "Waiting (2 calls)",
      cardDescription: "Awaiting final attempt",
      legendLabel: "2 calls",
      count: waitingByAttempt["2"],
      valueClassName: waitingStageValueClassName,
      colorClassName: "bg-orange-500",
    },
    {
      key: "scheduled",
      cardLabel: "Scheduled",
      cardDescription: "Scheduled callbacks",
      legendLabel: "Scheduled",
      count: pool.scheduled,
      valueClassName: scheduledStageValueClassName,
      colorClassName: "bg-indigo-500",
    },
    {
      key: "stopped",
      cardLabel: "Stopped",
      cardDescription: "No answer after 3 tries",
      legendLabel: "Stopped (max attempts)",
      count: pool.stopped,
      valueClassName: stoppedStageValueClassName,
      colorClassName: "bg-rose-500",
    },
  ];
}

function LeadPoolStageCard({ stage }: LeadPoolStageCardProps) {
  return (
    <div className="rounded-xl bg-secondary/60 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted-foreground">{stage.cardLabel}</span>
        <span className={`h-2 w-2 shrink-0 rounded-full ${stage.colorClassName}`} />
      </div>
      <div className={`mt-2 text-2xl font-bold tabular-nums tracking-tight ${stage.valueClassName}`}>
        {formatCount(stage.count)}
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">{stage.cardDescription}</p>
    </div>
  );
}

function PoolCompositionBar({ stages, totalLeads }: PoolCompositionBarProps) {
  const emptyPoolTrackClassName: string = "mt-2 h-2.5 w-full rounded-full bg-muted";
  const hasNoLeads: boolean = totalLeads === 0;
  if (hasNoLeads) {
    return <div className={emptyPoolTrackClassName} />;
  }
  return (
    <div className="mt-2 flex h-2.5 w-full overflow-hidden rounded-full">
      {stages.map((stage: LeadPoolStage) => {
        const widthPercent: number = getStageWidthPercent(stage.count, totalLeads);
        const stageHasNoLeads: boolean = stage.count === 0;
        if (stageHasNoLeads) {
          return null;
        }
        return (
          <div
            key={stage.key}
            className={stage.colorClassName}
            style={{ width: `${widthPercent}%` }}
          />
        );
      })}
    </div>
  );
}

function PoolCompositionLegend({ stages }: PoolCompositionLegendProps) {
  return (
    <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {stages.map((stage: LeadPoolStage) => (
        <li
          key={stage.key}
          className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
        >
          <span className={`h-2 w-2 shrink-0 rounded-full ${stage.colorClassName}`} />
          {stage.legendLabel}
        </li>
      ))}
    </ul>
  );
}

export function LeadPoolStats({ pool }: LeadPoolStatsProps) {
  const poolStages: LeadPoolStage[] = buildPoolStages(pool);
  const totalActiveLeads: number = poolStages.reduce(
    (runningTotal: number, stage: LeadPoolStage) => runningTotal + stage.count,
    0
  );
  const { "0": freshLeadsCount, "1": firstAttemptCount, "2": secondAttemptCount } =
    pool.waiting_by_attempts;
  const retryLeadsCount: number = firstAttemptCount + secondAttemptCount;
  const summaryLine: string =
    `${formatCount(freshLeadsCount)} fresh · ${formatCount(retryLeadsCount)} retries · ` +
    `${formatCount(pool.scheduled)} callbacks · ${formatCount(pool.stopped)} stopped`;

  return (
    <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-4">
        <div>
          <h2 className="text-base font-bold tracking-tight">Active Lead Pool</h2>
          <p className="text-xs text-muted-foreground">
            Current backlog of active leads in queue by attempt stage.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <span className="h-2 w-2 rounded-full bg-primary" />
          {formatCount(totalActiveLeads)} Total Active Leads
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {poolStages.map((stage: LeadPoolStage) => (
          <LeadPoolStageCard key={stage.key} stage={stage} />
        ))}
      </div>
      <div className="mt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span className="text-xs font-medium text-muted-foreground">Pool composition</span>
          <span className="text-[11px] text-muted-foreground">{summaryLine}</span>
        </div>
        <PoolCompositionBar stages={poolStages} totalLeads={totalActiveLeads} />
        <PoolCompositionLegend stages={poolStages} />
      </div>
    </section>
  );
}
