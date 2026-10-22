import type { ReactNode } from "react";
import { ChartColumn } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface DashboardCardProps {
  title: string;
  headingLabel?: string;
  headingAction?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function DashboardCard({ title, headingLabel, headingAction, className, children }: DashboardCardProps) {
  const cardClass: string = cn(
    "rounded-2xl border bg-card p-4 shadow-sm sm:p-5",
    className
  );
  const hasHeadingAction: boolean = headingAction !== undefined;

  return (
    <div className={cardClass}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h3 className="text-sm font-bold tracking-tight sm:text-base">{title}</h3>
        {hasHeadingAction ? (
          headingAction
        ) : (
          <span className="text-xs text-muted-foreground">{headingLabel}</span>
        )}
      </div>
      {children}
    </div>
  );
}

export function EmptyPeriodNote() {
  const emptyPeriodMessage: string = "No calls in this period.";

  return (
    <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-10">
      <ChartColumn className="h-8 w-8 text-muted-foreground" />
      <p className="text-center text-sm text-muted-foreground">{emptyPeriodMessage}</p>
    </div>
  );
}
