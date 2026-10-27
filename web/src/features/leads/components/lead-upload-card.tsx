import { useState, type ChangeEvent, type DragEvent } from "react";
import { FileUp, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { maxLeadUploadMb } from "@/config/app-config";
import { ErrorAlert } from "@/shared/components/error-alert";
import { cn } from "@/shared/utils/cn";
import { getCsvFileValidationError, useLeadUpload } from "../hooks/use-lead-upload";
import type { LeadCountry, LeadUploadResult } from "../types";

interface LeadCountryOption {
  value: LeadCountry;
  label: string;
}

interface CsvFileDropzoneProps {
  selectedFile: File | null;
  fileErrorMessage: string | null;
  onFilePicked: (pickedFile: File | null) => void;
}

function getFileSizeLabel(fileSizeInBytes: number): string {
  const bytesPerKb: number = 1024;
  const bytesPerMb: number = bytesPerKb * 1024;
  if (fileSizeInBytes < bytesPerMb) {
    const fileSizeInKb: number = fileSizeInBytes / bytesPerKb;
    const fileSizeInKbLabel: string = `${fileSizeInKb.toFixed(1)} KB`;
    return fileSizeInKbLabel;
  }
  const fileSizeInMb: number = fileSizeInBytes / bytesPerMb;
  const fileSizeLabel: string = `${fileSizeInMb.toFixed(1)} MB`;
  return fileSizeLabel;
}

function CsvFileDropzone({
  selectedFile,
  fileErrorMessage,
  onFilePicked,
}: CsvFileDropzoneProps) {
  const hasFileError: boolean = fileErrorMessage !== null;
  const [isDragActive, setIsDragActive] = useState<boolean>(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const pickedFile: File | null = event.target.files?.[0] ?? null;
    event.target.value = "";
    onFilePicked(pickedFile);
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>): void => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (): void => {
    setIsDragActive(false);
  };

  const handleFileDrop = (event: DragEvent<HTMLLabelElement>): void => {
    event.preventDefault();
    setIsDragActive(false);
    const droppedFiles: FileList = event.dataTransfer.files;
    const droppedFile: File | null = droppedFiles.length > 0 ? droppedFiles[0] : null;
    onFilePicked(droppedFile);
  };

  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        CSV File
      </span>
      <label
        htmlFor="lead-upload-file"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleFileDrop}
        className={cn(
          "mt-1.5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center hover:border-primary",
          hasFileError ? "border-destructive bg-destructive/5" : "border-border bg-background",
          isDragActive && !hasFileError ? "border-primary bg-primary/5" : null
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
            <p className="mt-2 text-xs font-medium">Click to browse or drag &amp; drop</p>
            <p className="text-[11px] text-muted-foreground">
              Phone numbers on their own lines or comma-separated · No header row
            </p>
          </>
        )}
      </label>
    </div>
  );
}

function getUploadToastDescription(uploadResult: LeadUploadResult): string {
  const addedCount: number = uploadResult.added;
  const duplicateCount: number = uploadResult.duplicates;
  const invalidCount: number = uploadResult.invalid;
  const toastDescription: string = `${addedCount} added, ${duplicateCount} duplicates skipped, ${invalidCount} invalid.`;
  return toastDescription;
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

  const handlePickedFile = (pickedFile: File | null): void => {
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

  const handleCloseDialog = (): void => {
    handleDialogOpenChange(false);
  };

  const handleUploadSuccess = (uploadResult: LeadUploadResult): void => {
    const toastDescription: string = getUploadToastDescription(uploadResult);
    toast.success("Upload complete.", { description: toastDescription });
    handleCloseDialog();
  };

  const handleUploadClick = (): void => {
    if (!canUpload || !selectedFile) {
      return;
    }
    submitUpload(selectedFile, country, handleUploadSuccess);
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
              CSV file (max {maxLeadUploadMb} MB)
            </DialogDescription>
          </div>
        </div>

        <div className="space-y-4">
          <CsvFileDropzone
            selectedFile={selectedFile}
            fileErrorMessage={fileErrorMessage}
            onFilePicked={handlePickedFile}
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

          {uploadErrorMessage ? <ErrorAlert message={uploadErrorMessage} /> : null}

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
      </DialogContent>
    </Dialog>
  );
}
