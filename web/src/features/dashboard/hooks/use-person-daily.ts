import { useQuery } from "@tanstack/react-query";
import { getPersonDaily } from "../api/dashboard.api";
import type { DailyRow } from "../types";
import { isValidPersonId } from "./use-person-stats";

interface UsePersonDailyResult {
  personDailyRows: DailyRow[] | null;
  isLoading: boolean;
  hasError: boolean;
  refetch: () => void;
}

export function usePersonDaily(personId: number): UsePersonDailyResult {
  const personDailyQuery = useQuery<DailyRow[]>({
    queryKey: ["person-daily", personId],
    queryFn: () => getPersonDaily(personId),
    enabled: isValidPersonId(personId),
  });

  const personDailyRows: DailyRow[] | null = personDailyQuery.data ?? null;

  const result: UsePersonDailyResult = {
    personDailyRows,
    isLoading: personDailyQuery.isLoading,
    hasError: personDailyQuery.isError,
    refetch: personDailyQuery.refetch,
  };
  return result;
}
