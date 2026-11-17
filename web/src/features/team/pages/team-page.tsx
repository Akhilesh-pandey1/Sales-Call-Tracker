import { useNavigate } from "react-router-dom";
import {
  getPersonLogFile,
  getTeamLogFile,
  useCallLogDownload,
  type CallLogFile,
} from "@/features/dashboard";
import { ErrorState } from "@/shared/components/error-state";
import { PageHeader } from "@/shared/components/page-header";
import { PageLoader } from "@/shared/components/page-loader";
import { TodaysDateAction } from "@/shared/components/todays-date-action";
import { TeamEmptyState } from "../components/team-empty-state";
import { TeamPeopleTable } from "../components/team-people-table";
import { useTeamPeople } from "../hooks/use-team-people";
import type { PersonDayDownloadTarget } from "../types";

function requestPersonDayLogFile(
  target: PersonDayDownloadTarget
): Promise<CallLogFile> {
  const personDayLogFile: Promise<CallLogFile> = getPersonLogFile(
    target.userId,
    target.day
  );
  return personDayLogFile;
}

export function TeamPage() {
  const { teamPeople, isLoading, hasError, refetch } = useTeamPeople();
  const { downloadingTarget, downloadLogs } = useCallLogDownload(getTeamLogFile);
  const {
    downloadingTarget: downloadingPersonDayTarget,
    downloadLogs: downloadPersonDayLogs,
  } = useCallLogDownload(requestPersonDayLogFile);
  const navigate = useNavigate();

  const handleOpenPerson = (userId: number): void => {
    navigate(`/person/${userId}?from=/team`);
  };

  const handleRetryClick = (): void => {
    refetch();
  };

  const hasNoSalespeople: boolean = teamPeople.length === 0;

  if (hasError) {
    return (
      <PageHeader title="Team" action={<TodaysDateAction />}>
        <ErrorState onRetry={handleRetryClick} />
      </PageHeader>
    );
  }

  return (
    <PageHeader title="Team" action={<TodaysDateAction />}>
      {isLoading && <PageLoader />}
      {!isLoading && hasNoSalespeople && <TeamEmptyState />}
      {!isLoading && !hasNoSalespeople && (
        <TeamPeopleTable
          people={teamPeople}
          onOpenPerson={handleOpenPerson}
          onDownloadDay={downloadLogs}
          downloadingDay={downloadingTarget}
          onDownloadPersonDay={downloadPersonDayLogs}
          downloadingPersonDayTarget={downloadingPersonDayTarget}
        />
      )}
    </PageHeader>
  );
}
