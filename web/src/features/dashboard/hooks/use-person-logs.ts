import { useQuery } from "@tanstack/react-query";
import { getPersonLogs } from "../api/dashboard.api";
import type { PersonLogRow } from "../types";
import { isValidPersonId } from "./use-person-stats";

interface UsePersonLogsResult {
  personLogRows: PersonLogRow[];
  isLoading: boolean;
  hasError: boolean;
  refetch: () => void;
}

export function usePersonLogs(personId: number): UsePersonLogsResult {
  const personLogsQuery = useQuery<PersonLogRow[]>({
    queryKey: ["person-logs", personId],
    queryFn: () => getPersonLogs(personId),
    enabled: isValidPersonId(personId),
  });

  const result: UsePersonLogsResult = {
    personLogRows: personLogsQuery.data ?? [],
    isLoading: personLogsQuery.isLoading,
    hasError: personLogsQuery.isError,
    refetch: personLogsQuery.refetch,
  };
  return result;
}
