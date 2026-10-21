import { PageHeader } from "@/shared/components/page-header";
import { PageLoader } from "@/shared/components/page-loader";
import { ErrorState } from "@/shared/components/error-state";
import { LeadUploadCard } from "../components/lead-upload-card";
import { LeadDailyStats } from "../components/lead-daily-stats";
import { LeadPoolStats } from "../components/lead-pool-stats";
import { useLeads } from "../hooks/use-leads";

export function LeadsPage() {
  const {
    data: leadsSummary,
    isPending,
    isError,
    refetch,
  } = useLeads();

  if (isError) {
    return (
      <PageHeader title="Leads">
        <ErrorState onRetry={refetch} />
      </PageHeader>
    );
  }

  if (isPending) {
    return (
      <PageHeader title="Leads">
        <PageLoader />
      </PageHeader>
    );
  }

  const totalActiveLeads: number =
    leadsSummary.pool.waiting + leadsSummary.pool.scheduled + leadsSummary.pool.stopped;
  const isPoolEmpty: boolean = totalActiveLeads === 0;

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
    </PageHeader>
  );
}
