import { apiClient } from "@/shared/api/api-client";
import type {
  LeadCountry,
  LeadUploadApiResponse,
  LeadUploadResult,
  LeadsSummary,
  LeadsSummaryApiResponse,
} from "../types";

export async function getLeadsSummary(): Promise<LeadsSummary> {
  const response = await apiClient.get<LeadsSummaryApiResponse>("/leads/summary");
  const summary: LeadsSummary = {
    pool: response.data.pool,
    uploaded: response.data.uploaded,
    tackled: response.data.tackled,
  };
  return summary;
}

export async function uploadLeads(
  file: File,
  country: LeadCountry
): Promise<LeadUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("country", country);
  const response = await apiClient.post<LeadUploadApiResponse>("/leads/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  const uploadResult: LeadUploadResult = {
    added: response.data.added,
    duplicates: response.data.duplicates,
    invalid: response.data.invalid,
  };
  return uploadResult;
}
