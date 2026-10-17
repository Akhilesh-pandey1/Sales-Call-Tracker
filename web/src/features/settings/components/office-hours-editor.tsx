import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorAlert } from "@/shared/components/error-alert";
import { ErrorState } from "@/shared/components/error-state";
import { useOfficeHours } from "../hooks/use-office-hours";
import { useOfficeHoursForm } from "../hooks/use-office-hours-form";

export function OfficeHoursEditor() {
  const { officeHoursWindow, isLoading, hasError, refetch } = useOfficeHours();
  const {
    startValue,
    endValue,
    isSavePending,
    saveErrorMessage,
    handleStartChange,
    handleEndChange,
    submitSave,
  } = useOfficeHoursForm(officeHoursWindow);

  const storedStartTime: string = officeHoursWindow?.start_time ?? "";
  const storedEndTime: string = officeHoursWindow?.end_time ?? "";

  const handleSaveClick = (): void => {
    const savedWindowToastMessage: string = "Window saved. It applies at once.";
    submitSave(() => toast.success(savedWindowToastMessage));
  };

  if (hasError) {
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <section
      aria-label="Office hours"
      className="max-w-2xl overflow-hidden rounded-2xl border bg-card shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 sm:px-6">
        <h2 className="text-base font-bold tracking-tight">Office hours</h2>
        <span className="text-xs text-muted-foreground">
          Applies every day · Sunday included
        </span>
      </div>
      <div className="px-5 pb-5 sm:px-6">
        {isLoading ? (
          <p className="mt-1 text-sm text-muted-foreground">Loading office hours…</p>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              Current window:{" "}
              <span className="font-semibold tabular-nums text-foreground">
                {storedStartTime} – {storedEndTime} IST
              </span>{" "}
              · calls that start outside this window are not counted.
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <div>
                <label
                  htmlFor="office-hours-start"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Start time
                </label>
                <Input
                  id="office-hours-start"
                  type="time"
                  value={startValue}
                  onChange={handleStartChange}
                  className="mt-1.5 w-28 rounded-xl"
                />
              </div>
              <div>
                <label
                  htmlFor="office-hours-end"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  End time
                </label>
                <Input
                  id="office-hours-end"
                  type="time"
                  value={endValue}
                  onChange={handleEndChange}
                  className="mt-1.5 w-28 rounded-xl"
                />
              </div>
              <Button
                type="button"
                className="rounded-xl text-sm font-semibold"
                disabled={isSavePending}
                onClick={handleSaveClick}
              >
                {isSavePending ? "Saving..." : "Save"}
              </Button>
            </div>
            {saveErrorMessage ? (
              <div className="mt-3">
                <ErrorAlert message={saveErrorMessage} />
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
