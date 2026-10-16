import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  onRetry: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border bg-card px-6 py-10 text-center shadow-sm">
      <p role="alert" className="text-sm font-medium text-destructive">
        Could not load data.
      </p>
      <Button variant="outline" onClick={onRetry} className="mt-4 rounded-xl">
        Retry
      </Button>
    </div>
  );
}
