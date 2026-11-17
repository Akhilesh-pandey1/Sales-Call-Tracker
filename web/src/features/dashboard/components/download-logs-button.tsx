import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DownloadLogsButtonProps {
  isDownloading: boolean;
  onClick: () => void;
}

export function DownloadLogsButton({
  isDownloading,
  onClick,
}: DownloadLogsButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={isDownloading}
      className="h-auto gap-1.5 rounded-xl bg-card px-3 py-1.5 font-medium"
    >
      <Download
        className="h-5 w-5 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      Download logs
    </Button>
  );
}
