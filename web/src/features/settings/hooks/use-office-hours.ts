import { useQuery } from "@tanstack/react-query";
import { getOfficeHours } from "../api/office-hours.api";
import type { OfficeHoursWindow } from "../types";

export const OFFICE_HOURS_QUERY_KEY = ["settings", "office-hours"] as const;

interface UseOfficeHoursResult {
  officeHoursWindow: OfficeHoursWindow | null;
  isLoading: boolean;
  hasError: boolean;
  refetch: () => void;
}

export function useOfficeHours(): UseOfficeHoursResult {
  const officeHoursQuery = useQuery<OfficeHoursWindow>({
    queryKey: OFFICE_HOURS_QUERY_KEY,
    queryFn: getOfficeHours,
  });

  const result: UseOfficeHoursResult = {
    officeHoursWindow: officeHoursQuery.data ?? null,
    isLoading: officeHoursQuery.isLoading,
    hasError: officeHoursQuery.isError,
    refetch: officeHoursQuery.refetch,
  };
  return result;
}
