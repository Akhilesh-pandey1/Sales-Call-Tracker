import { useNavigate } from "react-router-dom";
import { ErrorState } from "@/shared/components/error-state";
import { PageHeader } from "@/shared/components/page-header";
import { PageLoader } from "@/shared/components/page-loader";
import { TodaysDateAction } from "@/shared/components/todays-date-action";
import { TeamEmptyState } from "../components/team-empty-state";
import { TeamPeopleTable } from "../components/team-people-table";
import { useTeamPeople } from "../hooks/use-team-people";

export function TeamPage() {
  const { teamPeople, isLoading, hasError, refetch } = useTeamPeople();
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
        <TeamPeopleTable people={teamPeople} onOpenPerson={handleOpenPerson} />
      )}
    </PageHeader>
  );
}
