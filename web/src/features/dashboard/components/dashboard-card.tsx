import type { ReactNode } from "react";
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
    "h-full rounded-2xl border bg-card p-4 shadow-sm sm:p-5",
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
    <p className="py-14 text-center text-sm text-muted-foreground">{emptyPeriodMessage}</p>
  );
}
