import { apiClient } from "@/shared/api/api-client";
import type { OfficeHoursWindow, UpdateOfficeHoursWindowRequest } from "../types";

export async function getOfficeHours(): Promise<OfficeHoursWindow> {
  const response = await apiClient.get<OfficeHoursWindow>("/settings/office-hours");
  const officeHoursWindow: OfficeHoursWindow = response.data;
  return officeHoursWindow;
}

export async function updateOfficeHours(
  updateRequest: UpdateOfficeHoursWindowRequest
): Promise<void> {
  await apiClient.put("/settings/office-hours", updateRequest);
}
