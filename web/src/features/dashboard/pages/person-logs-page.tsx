import { useMemo, type ReactElement } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/shared/components/error-state";
import { PageHeader } from "@/shared/components/page-header";
import { PageLoader } from "@/shared/components/page-loader";
import { getTodaysDateLabel } from "@/shared/utils/todays-date";
import { getPersonLogFile } from "../api/dashboard.api";
import { DownloadLogsButton } from "../components/download-logs-button";
import { PersonAvatar } from "../components/person-avatar";
import { PersonLogsTable } from "../components/person-logs-table";
import { useCallLogDownload } from "../hooks/use-call-log-download";
import { usePersonLogs } from "../hooks/use-person-logs";
import { isValidPersonId, usePersonStats } from "../hooks/use-person-stats";

function buildPersonPagePath(personId: number, queryString: string): string {
  const personPagePath: string = queryString
    ? `/person/${personId}?${queryString}`
    : `/person/${personId}`;
  return personPagePath;
}

export function PersonLogsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const personId: number = Number(id);
  const hasValidPersonId: boolean = isValidPersonId(personId);
  const { personLogRows, isLoading, hasError, refetch } = usePersonLogs(personId);
  const { personStats } = usePersonStats(personId);
  const { downloadingTarget, downloadLogs } = useCallLogDownload(getPersonLogFile);
  const todaysDateLabel: string = useMemo(() => getTodaysDateLabel(), []);
  const queryString: string = searchParams.toString();
  const personPagePath: string = buildPersonPagePath(personId, queryString);

  const handleBackClick = (): void => {
    navigate(personPagePath);
  };

  const handleRetryClick = (): void => {
    refetch();
  };

  const handleDownloadLogsClick = (): void => {
    downloadLogs(personId);
  };

  const fallbackPageTitle: string = "Person";
  const headerTitle: string = personStats?.name ?? fallbackPageTitle;
  const headerAvatar: ReactElement | undefined = personStats ? (
    <PersonAvatar name={personStats.name} />
  ) : undefined;
  const isDownloadingLogs: boolean = downloadingTarget === personId;
  const downloadLogsAction: ReactElement = (
    <DownloadLogsButton
      isDownloading={isDownloadingLogs}
      onClick={handleDownloadLogsClick}
    />
  );
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

      {isLoading && <PageLoader />}
      {!isLoading && (
        <PersonLogsTable rows={personLogRows} action={downloadLogsAction} />
      )}
    </PageHeader>
  );
}
