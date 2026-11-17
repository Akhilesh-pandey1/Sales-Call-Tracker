import { useState } from "react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import type { CallLogFile } from "../types";

interface UseCallLogDownloadResult<TTarget> {
  downloadingTarget: TTarget | null;
  downloadLogs: (target: TTarget) => void;
}

function saveLogFile(logFile: CallLogFile): void {
  const objectUrl: string = URL.createObjectURL(logFile.blob);
  const downloadLink: HTMLAnchorElement = document.createElement("a");
  downloadLink.href = objectUrl;
  downloadLink.download = logFile.filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  const revokeDelayMs: number = 1000;
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), revokeDelayMs);
}

export function useCallLogDownload<TTarget>(
  requestLogFile: (target: TTarget) => Promise<CallLogFile>
): UseCallLogDownloadResult<TTarget> {
  const [downloadingTarget, setDownloadingTarget] = useState<TTarget | null>(null);

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

  const downloadLogs = (target: TTarget): void => {
    setDownloadingTarget(target);
    requestLogFile(target)
      .then(saveLogFile)
      .catch(handleDownloadFailure)
      .finally(() => setDownloadingTarget(null));
  };

  const result: UseCallLogDownloadResult<TTarget> = {
    downloadingTarget,
    downloadLogs,
  };
  return result;
}
