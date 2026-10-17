import { useEffect, useState, type ChangeEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/shared/api/api-error";
import { updateOfficeHours } from "../api/office-hours.api";
import { OFFICE_HOURS_QUERY_KEY } from "./use-office-hours";
import type { OfficeHoursWindow, UpdateOfficeHoursWindowRequest } from "../types";

type HandleSaveSuccess = () => void;

interface UseOfficeHoursFormResult {
  startValue: string;
  endValue: string;
  isSavePending: boolean;
  saveErrorMessage: string | null;
  handleStartChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleEndChange: (event: ChangeEvent<HTMLInputElement>) => void;
  submitSave: (handleSaveSuccess: HandleSaveSuccess) => void;
}

export function useOfficeHoursForm(
  officeHoursWindow: OfficeHoursWindow | null
): UseOfficeHoursFormResult {
  const [startValue, setStartValue] = useState<string>("");
  const [endValue, setEndValue] = useState<string>("");
  const queryClient = useQueryClient();

  const refreshOfficeHours = (): void => {
    queryClient.invalidateQueries({ queryKey: OFFICE_HOURS_QUERY_KEY });
  };

  const saveMutation = useMutation({
    mutationFn: (updateRequest: UpdateOfficeHoursWindowRequest) =>
      updateOfficeHours(updateRequest),
    onSuccess: refreshOfficeHours,
  });

  useEffect(() => {
    if (officeHoursWindow === null) {
      return;
    }
    setStartValue(officeHoursWindow.start_time);
    setEndValue(officeHoursWindow.end_time);
  }, [officeHoursWindow]);

  const handleStartChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setStartValue(event.target.value);
  };

  const handleEndChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setEndValue(event.target.value);
  };

  const submitSave = (handleSaveSuccess: HandleSaveSuccess): void => {
    if (saveMutation.isPending) {
      return;
    }
    const updateRequest: UpdateOfficeHoursWindowRequest = {
      start_time: startValue,
      end_time: endValue,
    };
    saveMutation.mutate(updateRequest, { onSuccess: handleSaveSuccess });
  };

  const hasSaveFailed: boolean = saveMutation.isError;
  const saveErrorMessage: string | null = hasSaveFailed
    ? getApiErrorMessage(saveMutation.error)
    : null;

  const result: UseOfficeHoursFormResult = {
    startValue,
    endValue,
    isSavePending: saveMutation.isPending,
    saveErrorMessage,
    handleStartChange,
    handleEndChange,
    submitSave,
  };
  return result;
}
