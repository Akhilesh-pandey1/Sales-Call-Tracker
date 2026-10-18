import { cn } from "@/shared/utils/cn";
import type { DashboardPeriod } from "../types";

interface PeriodSwitchProps {
  selectedPeriod: DashboardPeriod;
  onSelectPeriod: (period: DashboardPeriod) => void;
}

export function PeriodSwitch({ selectedPeriod, onSelectPeriod }: PeriodSwitchProps) {
  const periodOptions: Array<{ value: DashboardPeriod; label: string }> = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last_30_days", label: "30 days" },
  ];

  return (
    <div
      role="group"
      aria-label="Dashboard period"
      className="inline-flex rounded-full border bg-card p-1 shadow-sm"
    >
      {periodOptions.map((periodOption) => {
        const isSelected: boolean = periodOption.value === selectedPeriod;
        return (
          <button
            key={periodOption.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelectPeriod(periodOption.value)}
            className={cn(
              "cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              isSelected
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {periodOption.label}
          </button>
        );
      })}
    </div>
  );
}
