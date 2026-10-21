import { PhoneCall } from "lucide-react";

export function PageLoader() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex flex-1 flex-col items-center justify-center gap-6"
    >
      <span className="relative flex h-12 w-12">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-2xl bg-primary opacity-30 motion-reduce:animate-none" />
        <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <PhoneCall className="h-6 w-6" />
        </span>
      </span>
      <span className="flex items-center gap-1.5" aria-hidden="true">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s] motion-reduce:animate-none" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s] motion-reduce:animate-none" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary motion-reduce:animate-none" />
      </span>
      <p className="text-sm font-medium text-muted-foreground">Loading…</p>
    </div>
  );
}
