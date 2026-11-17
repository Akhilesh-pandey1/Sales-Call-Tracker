import { useState } from "react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { getTeamLogFile } from "../api/dashboard.api";
import type { TeamLogDay, TeamLogFile } from "../types";

interface UseCallLogDownloadResult {
  downloadingDay: TeamLogDay | null;
  downloadLogs: (day: TeamLogDay) => void;
}

function saveLogFile(logFile: TeamLogFile): void {
  const objectUrl: string = URL.createObjectURL(logFile.blob);
  const downloadLink: HTMLAnchorElement = document.createElement("a");
  downloadLink.href = objectUrl;
  downloadLink.download = logFile.filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  const revokeDelayMs: number = 0;
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), revokeDelayMs);
}

export function useCallLogDownload(): UseCallLogDownloadResult {
  const [downloadingDay, setDownloadingDay] = useState<TeamLogDay | null>(null);

  const handleDownloadFailure = (error: unknown): void => {
    const unauthorizedStatusCode: number = 401;
    if (
      isAxiosError(error) &&
      error.response?.status === unauthorizedStatusCode
    ) {
      return;
    }
    toast.error("Could not download the logs.");
  };

  const downloadLogs = (day: TeamLogDay): void => {
    setDownloadingDay(day);
    getTeamLogFile(day)
      .then(saveLogFile)
      .catch(handleDownloadFailure)
      .finally(() => setDownloadingDay(null));
  };

  const result: UseCallLogDownloadResult = { downloadingDay, downloadLogs };
  return result;
}
