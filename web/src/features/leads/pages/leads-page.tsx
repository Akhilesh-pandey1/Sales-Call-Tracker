import { Button } from "@/components/ui/button";
import { PageHeader } from "@/shared/components/page-header";
import { LeadUploadCard } from "../components/lead-upload-card";
import { LeadDailyStats } from "../components/lead-daily-stats";
import { LeadPoolStats } from "../components/lead-pool-stats";
import { LeadAgentTable } from "../components/lead-agent-table";
import { useLeads } from "../hooks/use-leads";

export function LeadsPage() {
  const {
    data: leadsSummary,
    isPending,
    isError,
    refetch,
  } = useLeads();

  const handleRetryClick = (): void => {
    refetch();
  };

  if (isError) {
    return (
      <PageHeader title="Leads">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 text-center shadow-sm">
            <p className="text-sm text-muted-foreground">Could not load data.</p>
            <Button variant="outline" className="mt-4" onClick={handleRetryClick}>
              Retry
            </Button>
          </div>
        </div>
      </PageHeader>
    );
  }

  if (isPending) {
    return (
      <PageHeader title="Leads">
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </PageHeader>
    );
  }

  const totalLeadsInPool: number =
    leadsSummary.pool.waiting +
    leadsSummary.pool.scheduled +
    leadsSummary.pool.connected +
    leadsSummary.pool.stopped;
  const isPoolEmpty: boolean = totalLeadsInPool === 0;

  return (
    <PageHeader title="Leads" action={<LeadUploadCard />}>
      <LeadDailyStats uploaded={leadsSummary.uploaded} tackled={leadsSummary.tackled} />
      <LeadPoolStats pool={leadsSummary.pool} />
      {isPoolEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-background/50 px-6 py-12 text-center">
          <h2 className="text-base font-bold tracking-tight">No leads in calling pool</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a CSV to add phone numbers to the pool.
          </p>
        </div>
      ) : null}
      <LeadAgentTable people={leadsSummary.people} />
    </PageHeader>
  );
}
