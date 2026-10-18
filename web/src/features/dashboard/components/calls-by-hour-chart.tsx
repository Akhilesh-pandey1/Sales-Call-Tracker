import type { ReactNode } from "react";
import { Bar, BarChart, Cell, LabelList, XAxis } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { formatCount } from "@/shared/utils/format-count";
import { DashboardCard, EmptyPeriodNote } from "./dashboard-card";
import type { CallsByHourBlock } from "../types";

interface HourlyDialBar {
  hourLabel: string;
  dials: number;
  dialsLabel: string;
  isBestHour: boolean;
}

interface DialsTopLabelProps {
  x?: number | string;
  y?: number | string;
  value?: string | number | boolean | null;
  index?: number;
}

interface CallsByHourChartProps {
  callsByHour: CallsByHourBlock;
  usesDailyAverageWording: boolean;
  headingLabel?: string;
  headingAction?: ReactNode;
  className?: string;
}

function getTwelveHourLabel(hour: number): string {
  const noonHour: number = 12;
  const hourOnTwelveHourClock: number = hour % noonHour === 0 ? noonHour : hour % noonHour;
  const dayPeriod: string = hour < noonHour ? "AM" : "PM";
  const hourLabel: string = `${hourOnTwelveHourClock} ${dayPeriod}`;
  return hourLabel;
}

function buildHourlyBars(callsByHour: CallsByHourBlock): HourlyDialBar[] {
  const bestHour: number | null = callsByHour.best_hour;
  const hourlyBars: HourlyDialBar[] = callsByHour.hours.map(
    (hour: number, hourIndex: number) => {
      const dialsCount: number = callsByHour.dials[hourIndex];
      const hourlyBar: HourlyDialBar = {
        hourLabel: getTwelveHourLabel(hour),
        dials: dialsCount,
        dialsLabel: dialsCount === 0 ? "" : formatCount(dialsCount),
        isBestHour: hour === bestHour,
      };
      return hourlyBar;
    }
  );
  return hourlyBars;
}

function buildBestHourSummaryLine(
  bestHourLabel: string,
  bestHourDials: number,
  usesDailyAverageWording: boolean
): string {
  const bestHourDialsLabel: string = formatCount(bestHourDials);
  if (usesDailyAverageWording) {
    const summaryLine: string = `Best hour: ${bestHourLabel} — ${bestHourDialsLabel} dials a day on average.`;
    return summaryLine;
  }
  const summaryLine: string = `Best hour: ${bestHourLabel} — ${bestHourDialsLabel} dials.`;
  return summaryLine;
}

export function CallsByHourChart({
  callsByHour,
  usesDailyAverageWording,
  headingLabel,
  headingAction,
  className,
}: CallsByHourChartProps) {
  const bestHour: number | null = callsByHour.best_hour;
  if (bestHour === null) {
    return (
      <DashboardCard
        title="Calls by hour"
        headingLabel={headingLabel}
        headingAction={headingAction}
        className={className}
      >
        <EmptyPeriodNote />
      </DashboardCard>
    );
  }

  const bestHourIndex: number = callsByHour.hours.indexOf(bestHour);
  const hourlyBars: HourlyDialBar[] = buildHourlyBars(callsByHour);
  const bestHourBar: HourlyDialBar = hourlyBars[bestHourIndex];
  const bestHourSummaryLine: string = buildBestHourSummaryLine(
    bestHourBar.hourLabel,
    bestHourBar.dials,
    usesDailyAverageWording
  );

  const chartConfig: ChartConfig = {
    dials: {
      label: "Dials",
    },
  };

  const bestHourBarColor: string = "hsl(var(--primary))";
  const otherBarColor: string = "hsl(var(--primary) / 0.3)";
  const axisLabelColor: string = "hsl(var(--muted-foreground))";
  const bestHourLabelColor: string = "hsl(var(--primary))";

  const chartLabelFontSize: number = 10;
  const maxBarWidth: number = 28;
  const chartTopMargin: number = 20;
  const labelGapAboveBar: number = 6;
  const xAxisTickMargin: number = 8;
  const showTickLabelEveryNthHour: number = 2;
  const barCornerRadius: [number, number, number, number] = [4, 4, 0, 0];

  const renderDialsTopLabel = (labelProps: DialsTopLabelProps) => {
    if (labelProps.x === undefined || labelProps.y === undefined || !labelProps.value) {
      return null;
    }
    const isBestHourLabel: boolean = labelProps.index === bestHourIndex;
    const labelX: number = Number(labelProps.x);
    const labelY: number = Number(labelProps.y) - labelGapAboveBar;
    return (
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        fontSize={chartLabelFontSize}
        fontWeight={isBestHourLabel ? 600 : 400}
        fill={isBestHourLabel ? bestHourLabelColor : axisLabelColor}
      >
        {labelProps.value}
      </text>
    );
  };

  return (
    <DashboardCard
      title="Calls by hour"
      headingLabel={headingLabel}
      headingAction={headingAction}
      className={className}
    >
      <ChartContainer
        config={chartConfig}
        className="mt-4 aspect-auto h-44 sm:h-48"
      >
        <BarChart
          data={hourlyBars}
          margin={{ top: chartTopMargin, right: 0, bottom: 0, left: 0 }}
        >
          <XAxis
            dataKey="hourLabel"
            interval={showTickLabelEveryNthHour}
            axisLine={false}
            tickLine={false}
            tickMargin={xAxisTickMargin}
            tick={{ fontSize: chartLabelFontSize, fill: axisLabelColor }}
          />
          <Bar dataKey="dials" radius={barCornerRadius} maxBarSize={maxBarWidth}>
            {hourlyBars.map((hourlyBar: HourlyDialBar) => (
              <Cell
                key={hourlyBar.hourLabel}
                fill={hourlyBar.isBestHour ? bestHourBarColor : otherBarColor}
              />
            ))}
            <LabelList dataKey="dialsLabel" position="top" content={renderDialsTopLabel} />
          </Bar>
        </BarChart>
      </ChartContainer>
      <p className="mt-3 text-xs text-muted-foreground sm:text-sm">{bestHourSummaryLine}</p>
    </DashboardCard>
  );
}
