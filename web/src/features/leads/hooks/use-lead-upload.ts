import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/shared/api/api-error";
import { uploadLeads } from "../api/leads.api";
import { LEADS_SUMMARY_QUERY_KEY } from "./use-leads";
import type { LeadCountry, LeadUploadResult } from "../types";

export const MAX_LEAD_UPLOAD_MB: number = 2;

interface LeadUploadRequest {
  file: File;
  country: LeadCountry;
}

type HandleUploadSuccess = (uploadResult: LeadUploadResult) => void;

interface UseLeadUploadResult {
  submitUpload: (
    file: File,
    country: LeadCountry,
    handleUploadSuccess: HandleUploadSuccess
  ) => void;
  isUploadPending: boolean;
  uploadErrorMessage: string | null;
  clearUploadState: () => void;
}

export function getCsvFileValidationError(file: File): string | null {
  const bytesPerMb: number = 1024 * 1024;
  const maxLeadUploadBytes: number = MAX_LEAD_UPLOAD_MB * bytesPerMb;
  const csvMimeType: string = "text/csv";
  const csvFileExtension: string = ".csv";
  const hasCsvMimeType: boolean = file.type === csvMimeType;
  const hasCsvExtension: boolean = file.name.toLowerCase().endsWith(csvFileExtension);
  if (!hasCsvMimeType && !hasCsvExtension) {
    const invalidCsvFileMessage: string = "Please select a valid CSV file.";
    return invalidCsvFileMessage;
  }
  if (file.size > maxLeadUploadBytes) {
    const fileTooLargeMessage: string = "File is too large.";
    return fileTooLargeMessage;
  }
  return null;
}

export function useLeadUpload(): UseLeadUploadResult {
  const queryClient = useQueryClient();

  const refreshPoolSummary = (): void => {
    queryClient.invalidateQueries({ queryKey: LEADS_SUMMARY_QUERY_KEY });
  };

  const uploadMutation = useMutation({
    mutationFn: (uploadRequest: LeadUploadRequest) =>
      uploadLeads(uploadRequest.file, uploadRequest.country),
    onSuccess: refreshPoolSummary,
  });

  const submitUpload = (
    file: File,
    country: LeadCountry,
    handleUploadSuccess: HandleUploadSuccess
  ): void => {
    uploadMutation.mutate({ file, country }, { onSuccess: handleUploadSuccess });
  };

  const clearUploadState = (): void => {
    uploadMutation.reset();
  };

  const hasUploadFailed: boolean = uploadMutation.isError;
  const uploadErrorMessage: string | null = hasUploadFailed
    ? getApiErrorMessage(uploadMutation.error)
    : null;

  const result: UseLeadUploadResult = {
    submitUpload,
    isUploadPending: uploadMutation.isPending,
    uploadErrorMessage,
    clearUploadState,
  };
  return result;
}
