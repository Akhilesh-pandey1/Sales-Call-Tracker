import type { ComponentType, ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

interface KpiCardProps {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  iconClassName?: string;
  valueClassName?: string;
  subLine?: ReactNode;
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  valueClassName,
  subLine,
}: KpiCardProps) {
  const defaultIconClassName: string = "text-primary";
  const hasSubLine: boolean = subLine !== undefined;

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground sm:text-sm">{label}</span>
        <Icon className={cn("h-4 w-4 shrink-0 sm:h-5 sm:w-5", iconClassName ?? defaultIconClassName)} />
      </div>
      <div
        className={cn(
          "mt-2 truncate text-2xl font-bold tabular-nums tracking-tight sm:text-3xl",
          valueClassName
        )}
      >
        {value}
      </div>
      {hasSubLine ? <p className="mt-1 text-xs text-muted-foreground">{subLine}</p> : null}
    </div>
  );
}
