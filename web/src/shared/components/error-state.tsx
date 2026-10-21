import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  onRetry: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div
        role="alert"
        className="w-full max-w-md rounded-lg border bg-card p-6 text-center shadow-sm"
      >
        <p className="text-sm text-muted-foreground">Could not load data.</p>
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Retry
        </Button>
      </div>
    </div>
  );
}
