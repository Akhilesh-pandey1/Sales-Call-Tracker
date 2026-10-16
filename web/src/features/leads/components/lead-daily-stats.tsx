import type { ComponentType, ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, PhoneCall, Upload } from "lucide-react";
import { KpiCard } from "../../dashboard";
import { formatCount } from "@/shared/utils/format-count";
import type { LeadsDailyCount } from "../types";
import {
  formatPercentChangeLabel,
  getDayOverDayPercentChange,
} from "../utils/format";

interface PercentChangePillData {
  label: string;
  Icon: ComponentType<{ className?: string }> | null;
  className: string;
}

interface LeadDailyStatsProps {
  uploaded: LeadsDailyCount;
  tackled: LeadsDailyCount;
}

function buildPercentChangePill(
  percentChange: number | null
): PercentChangePillData | null {
  const noPill: PercentChangePillData | null = null;
  if (percentChange === null) {
    return noPill;
  }
  const noIcon: ComponentType<{ className?: string }> | null = null;
  const positiveIcon: ComponentType<{ className?: string }> = ArrowUpRight;
  const negativeIcon: ComponentType<{ className?: string }> = ArrowDownRight;
  const isPositiveChange: boolean = percentChange > 0;
  const isNegativeChange: boolean = percentChange < 0;
  const label: string = formatPercentChangeLabel(percentChange);
  if (isPositiveChange) {
    return { label, Icon: positiveIcon, className: "bg-emerald-500/10 text-emerald-600" };
  }
  if (isNegativeChange) {
    return { label, Icon: negativeIcon, className: "bg-red-500/10 text-red-600" };
  }
  return { label, Icon: noIcon, className: "bg-muted text-muted-foreground" };
}

function buildComparisonSubLine(dailyCount: LeadsDailyCount): ReactNode {
  const percentChange: number | null = getDayOverDayPercentChange(
    dailyCount.today,
    dailyCount.yesterday
  );
  const comparisonText: string = `vs ${formatCount(dailyCount.yesterday)} yesterday`;
  const pill: PercentChangePillData | null = buildPercentChangePill(percentChange);
  if (pill === null) {
    return comparisonText;
  }
  const PillIcon = pill.Icon;
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold ${pill.className}`}
      >
        {PillIcon === null ? null : <PillIcon className="h-3 w-3" />}
        {pill.label}
      </span>
      <span>{comparisonText}</span>
    </span>
  );
}

export function LeadDailyStats({ uploaded, tackled }: LeadDailyStatsProps) {
  const uploadedSubLine: ReactNode = buildComparisonSubLine(uploaded);
  const tackledSubLine: ReactNode = buildComparisonSubLine(tackled);
  const uploadedCard = (
    <KpiCard
      label="Leads Uploaded"
      value={formatCount(uploaded.today)}
      icon={Upload}
      subLine={uploadedSubLine}
    />
  );
  const tackledCard = (
    <KpiCard
      label="Leads Tackled"
      value={formatCount(tackled.today)}
      icon={PhoneCall}
      iconClassName="text-green-500"
      valueClassName="text-green-600"
      subLine={tackledSubLine}
    />
  );
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {uploadedCard}
      {tackledCard}
    </div>
  );
}
