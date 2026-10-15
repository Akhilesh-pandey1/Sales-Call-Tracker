import { useState, type ChangeEvent } from "react";
import { FileUp, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/shared/utils/cn";
import {
  getCsvFileValidationError,
  MAX_LEAD_UPLOAD_MB,
  useLeadUpload,
} from "../hooks/use-lead-upload";
import type { LeadCountry, LeadUploadResult } from "../types";

interface LeadCountryOption {
  value: LeadCountry;
  label: string;
}

interface UploadResultPanelProps {
  result: LeadUploadResult;
  handleClose: () => void;
}

interface CsvFileDropzoneProps {
  selectedFile: File | null;
  fileErrorMessage: string | null;
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

function getFileSizeLabel(fileSizeInBytes: number): string {
  const bytesPerMb: number = 1024 * 1024;
  const fileSizeInMb: number = fileSizeInBytes / bytesPerMb;
  const fileSizeLabel: string = `${fileSizeInMb.toFixed(1)} MB`;
  return fileSizeLabel;
}

function CsvFileDropzone({
  selectedFile,
  fileErrorMessage,
  handleFileChange,
}: CsvFileDropzoneProps) {
  const hasFileError: boolean = fileErrorMessage !== null;

  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        CSV File
      </span>
      <label
        htmlFor="lead-upload-file"
        className={cn(
          "mt-1.5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center hover:border-primary",
          hasFileError ? "border-destructive bg-destructive/5" : "border-border bg-background"
        )}
      >
        <input
          id="lead-upload-file"
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={handleFileChange}
        />
        <FileUp
          className={cn("h-8 w-8", hasFileError ? "text-destructive" : "text-muted-foreground")}
        />
        {selectedFile ? (
          <>
            <p className="mt-2 text-xs font-bold">
              {selectedFile.name} ({getFileSizeLabel(selectedFile.size)})
            </p>
            {fileErrorMessage ? (
              <p role="alert" className="mt-1 text-xs font-medium text-destructive">
                {fileErrorMessage}
              </p>
            ) : null}
          </>
        ) : (
          <>
            <p className="mt-2 text-xs font-medium">Click to browse</p>
            <p className="text-[11px] text-muted-foreground">
              Phone numbers in column 1 · UTF-8
            </p>
          </>
        )}
      </label>
    </div>
  );
}

function UploadResultPanel({ result, handleClose }: UploadResultPanelProps) {
  const uploadedCounts = [
    { label: "Added", count: result.added },
    { label: "Duplicates", count: result.duplicates },
    { label: "Invalid", count: result.invalid },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
        <h3 className="text-sm font-bold text-emerald-900">Upload complete.</h3>
        <p className="mt-1 text-xs text-emerald-800">
          The new leads are ready in the calling pool.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {uploadedCounts.map((uploadedCount) => (
          <div
            key={uploadedCount.label}
            className="rounded-xl border bg-background p-3 text-center"
          >
            <div className="text-2xl font-bold tabular-nums tracking-tight">
              {uploadedCount.count}
            </div>
            <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
              {uploadedCount.label}
            </p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end border-t pt-4">
        <Button type="button" className="rounded-xl text-xs font-semibold" onClick={handleClose}>
          Done
        </Button>
      </div>
    </div>
  );
}

export function LeadUploadCard() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileErrorMessage, setFileErrorMessage] = useState<string | null>(null);
  const [country, setCountry] = useState<LeadCountry>("IN");
  const {
    submitUpload,
    isUploadPending,
    uploadErrorMessage,
    uploadResult,
    clearUploadState,
  } = useLeadUpload();

  const defaultLeadCountry: LeadCountry = "IN";
  const leadCountryLabels: Record<LeadCountry, string> = {
    IN: "India (IN +91)",
    AE: "UAE (AE +971)",
    US: "United States (US +1)",
  };
  const leadCountryOptions: LeadCountryOption[] = (
    Object.keys(leadCountryLabels) as LeadCountry[]
  ).map((leadCountry: LeadCountry) => ({
    value: leadCountry,
    label: leadCountryLabels[leadCountry],
  }));

  const canUpload: boolean =
    selectedFile !== null && fileErrorMessage === null && !isUploadPending;

  const resetFileSelection = (): void => {
    setSelectedFile(null);
    setFileErrorMessage(null);
  };

  const handleDialogOpenChange = (isOpen: boolean): void => {
    setIsDialogOpen(isOpen);
    if (!isOpen) {
      resetFileSelection();
      setCountry(defaultLeadCountry);
      clearUploadState();
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const pickedFile: File | null = event.target.files?.[0] ?? null;
    event.target.value = "";
    clearUploadState();
    if (!pickedFile) {
      resetFileSelection();
      return;
    }
    setSelectedFile(pickedFile);
    setFileErrorMessage(getCsvFileValidationError(pickedFile));
  };

  const handleCountryChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const pickedCountry: string = event.target.value;
    const matchedCountryOption = leadCountryOptions.find(
      (leadCountryOption: LeadCountryOption) => leadCountryOption.value === pickedCountry
    );
    if (matchedCountryOption) {
      setCountry(matchedCountryOption.value);
    }
  };

  const handleUploadClick = (): void => {
    if (!canUpload || !selectedFile) {
      return;
    }
    submitUpload(selectedFile, country);
  };

  const handleCloseDialog = (): void => {
    handleDialogOpenChange(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button className="rounded-xl font-semibold">Upload Leads</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl">
        <div className="flex items-center gap-2.5 border-b pb-3 pr-8">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileUp className="h-5 w-5" />
          </span>
          <div>
            <DialogTitle className="text-base font-bold tracking-tight">
              Upload Leads
            </DialogTitle>
            <DialogDescription className="text-xs">
              Single-column CSV file (max {MAX_LEAD_UPLOAD_MB} MB)
            </DialogDescription>
          </div>
        </div>

        {uploadResult ? (
          <UploadResultPanel result={uploadResult} handleClose={handleCloseDialog} />
        ) : (
          <div className="space-y-4">
            <CsvFileDropzone
              selectedFile={selectedFile}
              fileErrorMessage={fileErrorMessage}
              handleFileChange={handleFileChange}
            />

            <div>
              <label
                htmlFor="lead-upload-country"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Default Country
              </label>
              <select
                id="lead-upload-country"
                value={country}
                onChange={handleCountryChange}
                className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {leadCountryOptions.map((leadCountryOption: LeadCountryOption) => (
                  <option key={leadCountryOption.value} value={leadCountryOption.value}>
                    {leadCountryOption.label}
                  </option>
                ))}
              </select>
            </div>

            {uploadErrorMessage ? (
              <p
                role="alert"
                className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {uploadErrorMessage}
              </p>
            ) : null}

            <div className="flex items-center justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl text-xs font-semibold text-muted-foreground"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="rounded-xl text-xs font-semibold"
                disabled={!canUpload}
                onClick={handleUploadClick}
              >
                <UploadCloud className="h-4 w-4" />
                {isUploadPending ? "Uploading..." : "Upload Leads"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
