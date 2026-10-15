import type { LeadPoolCounts } from "../types";

interface PoolBucket {
  label: string;
  description: string;
  count: number;
  dotClassName: string;
}

interface LeadPoolStatsProps {
  pool: LeadPoolCounts;
}

export function LeadPoolStats({ pool }: LeadPoolStatsProps) {
  const totalLeadsInPool: number =
    pool.waiting + pool.scheduled + pool.connected + pool.stopped;

  const poolBuckets: PoolBucket[] = [
    {
      label: "Waiting",
      description: "Fresh leads never dialed yet",
      count: pool.waiting,
      dotClassName: "bg-blue-500",
    },
    {
      label: "Scheduled",
      description: "Callbacks set for a later time",
      count: pool.scheduled,
      dotClassName: "bg-indigo-500",
    },
    {
      label: "Connected",
      description: "Finished with a connected call",
      count: pool.connected,
      dotClassName: "bg-emerald-500",
    },
    {
      label: "Stopped",
      description: "No answer after 3 attempts",
      count: pool.stopped,
      dotClassName: "bg-rose-500",
    },
  ];

  return (
    <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-4">
        <div>
          <h2 className="text-base font-bold tracking-tight">Lead Pool</h2>
          <p className="text-xs text-muted-foreground">
            Current backlog of leads by pool state.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <span className="h-2 w-2 rounded-full bg-primary" />
          {totalLeadsInPool} Total Leads
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {poolBuckets.map((bucket: PoolBucket) => (
          <div key={bucket.label} className="rounded-xl border bg-background p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                {bucket.label}
              </span>
              <span className={`h-2 w-2 shrink-0 rounded-full ${bucket.dotClassName}`} />
            </div>
            <div className="mt-2 text-2xl font-bold tabular-nums tracking-tight">
              {bucket.count}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">{bucket.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
