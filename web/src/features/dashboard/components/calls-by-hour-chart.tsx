import type { ReactElement, ReactNode } from "react";
import { Bar, BarChart, LabelList, XAxis } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { formatCount } from "@/shared/utils/format-count";
import { DashboardCard, EmptyPeriodNote } from "./dashboard-card";
import { INCOMING_COLOR } from "./chart-colors";
import type { CallsByHourBlock, TalkTotals } from "../types";

interface HourlyCallBar {
  hourLabel: string;
  axisLabel: string;
  outgoing: number;
  incoming: number;
  total: number;
  totalLabel: string;
  isBestHour: boolean;
}

interface ChartLabelProps {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  value?: string | number | boolean | null;
  index?: number;
}

interface HourAxisTickProps {
  x?: number | string;
  y?: number | string;
  payload?: { value?: string | number };
}

interface LabelPlacement {
  centerX: number;
  y: number;
}

interface CallsByHourChartProps {
  callsByHour: CallsByHourBlock;
  talkTotals: TalkTotals;
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

function buildAxisHourLabel(
  hour: number,
  hourIndex: number,
  lastHourIndex: number
): string {
  const noonHour: number = 12;
  const onePmHour: number = 13;
  const showsMeridiem: boolean =
    hourIndex === 0 || hour === noonHour || hour === onePmHour || hourIndex === lastHourIndex;
  if (showsMeridiem) {
    const meridiemHourLabel: string = getTwelveHourLabel(hour);
    return meridiemHourLabel;
  }
  const plainHourLabel: string = String(hour % noonHour === 0 ? noonHour : hour % noonHour);
  return plainHourLabel;
}

function buildHourlyCallBars(callsByHour: CallsByHourBlock): HourlyCallBar[] {
  const bestHour: number | null = callsByHour.best_hour;
  const lastHourIndex: number = callsByHour.hours.length - 1;
  const hourlyBars: HourlyCallBar[] = callsByHour.hours.map(
    (hour: number, hourIndex: number) => {
      const outgoingCount: number = callsByHour.outgoing[hourIndex];
      const incomingCount: number = callsByHour.incoming[hourIndex];
      const totalCalls: number = outgoingCount + incomingCount;
      const hourlyBar: HourlyCallBar = {
        hourLabel: getTwelveHourLabel(hour),
        axisLabel: buildAxisHourLabel(hour, hourIndex, lastHourIndex),
        outgoing: outgoingCount,
        incoming: incomingCount,
        total: totalCalls,
        totalLabel: totalCalls === 0 ? "" : formatCount(totalCalls),
        isBestHour: hour === bestHour,
      };
      return hourlyBar;
    }
  );
  return hourlyBars;
}

function getHighestCallTotal(hourlyBars: HourlyCallBar[]): number {
  const highestCallTotal: number = Math.max(...hourlyBars.map((bar: HourlyCallBar) => bar.total));
  return highestCallTotal;
}

function buildChartSummaryLine(
  talkTotals: TalkTotals,
  bestHourBar: HourlyCallBar,
  usesDailyAverageWording: boolean
): string {
  const outgoingCallsLabel: string = formatCount(talkTotals.outgoing_calls);
  const incomingCallsLabel: string = formatCount(talkTotals.incoming_calls);
  if (usesDailyAverageWording) {
    const averageSummaryLine: string = `Outgoing ${outgoingCallsLabel} · Incoming ${incomingCallsLabel} per day on average · Best hour: ${bestHourBar.hourLabel}`;
    return averageSummaryLine;
  }
  const bestHourCallsLabel: string = formatCount(bestHourBar.total);
  const summaryLine: string = `Outgoing ${outgoingCallsLabel} · Incoming ${incomingCallsLabel} · Best hour: ${bestHourBar.hourLabel} (${bestHourCallsLabel} calls)`;
  return summaryLine;
}

function getLabelPlacement(labelProps: ChartLabelProps): LabelPlacement | null {
  if (
    labelProps.x === undefined ||
    labelProps.y === undefined ||
    labelProps.width === undefined
  ) {
    return null;
  }
  const leftEdge: number = Number(labelProps.x);
  const labelWidth: number = Number(labelProps.width);
  const placement: LabelPlacement = {
    centerX: leftEdge + labelWidth / 2,
    y: Number(labelProps.y),
  };
  return placement;
}

function renderTotalTopLabel(
  labelProps: ChartLabelProps,
  bestHourIndex: number,
  bestHourLabelFill: string
): ReactElement | null {
  if (!labelProps.value) {
    return null;
  }
  const placement: LabelPlacement | null = getLabelPlacement(labelProps);
  if (placement === null) {
    return null;
  }
  const labelFontSize: number = 10;
  const labelGapAboveBar: number = 6;
  const mutedLabelFill: string = "hsl(var(--muted-foreground))";
  const isBestHourLabel: boolean = labelProps.index === bestHourIndex;
  return (
    <text
      x={placement.centerX}
      y={placement.y - labelGapAboveBar}
      textAnchor="middle"
      fontSize={labelFontSize}
      fontWeight={isBestHourLabel ? 600 : 400}
      fill={isBestHourLabel ? bestHourLabelFill : mutedLabelFill}
    >
      {labelProps.value}
    </text>
  );
}

function renderSegmentInsideLabel(
  labelProps: ChartLabelProps,
  labelFill: string,
  minimumLabelCount: number
): ReactElement | null {
  if (labelProps.value === undefined || labelProps.value === null) {
    return null;
  }
  const segmentCount: number = Number(labelProps.value);
  if (segmentCount < minimumLabelCount) {
    return null;
  }
  const placement: LabelPlacement | null = getLabelPlacement(labelProps);
  if (placement === null) {
    return null;
  }
  const labelFontSize: number = 9;
  const insideLabelTopGap: number = 10;
  return (
    <text
      x={placement.centerX}
      y={placement.y + insideLabelTopGap}
      textAnchor="middle"
      fontSize={labelFontSize}
      fontWeight={600}
      fill={labelFill}
    >
      {formatCount(segmentCount)}
    </text>
  );
}

function renderHourAxisTick(
  tickProps: HourAxisTickProps,
  bestHourLabel: string
): ReactElement | null {
  if (
    tickProps.x === undefined ||
    tickProps.y === undefined ||
    tickProps.payload === undefined
  ) {
    return null;
  }
  const labelFontSize: number = 10;
  const mutedLabelFill: string = "hsl(var(--muted-foreground))";
  const bestHourTickFill: string = "hsl(var(--foreground))";
  const isBestHourTick: boolean = tickProps.payload.value === bestHourLabel;
  return (
    <text
      x={tickProps.x}
      y={tickProps.y}
      textAnchor="middle"
      fontSize={labelFontSize}
      fontWeight={isBestHourTick ? 600 : 400}
      fill={isBestHourTick ? bestHourTickFill : mutedLabelFill}
    >
      {tickProps.payload.value}
    </text>
  );
}

export function CallsByHourChart({
  callsByHour,
  talkTotals,
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

  const hourlyBars: HourlyCallBar[] = buildHourlyCallBars(callsByHour);
  const bestHourIndex: number = callsByHour.hours.indexOf(bestHour);
  const bestHourBar: HourlyCallBar = hourlyBars[bestHourIndex];
  const chartSummaryLine: string = buildChartSummaryLine(
    talkTotals,
    bestHourBar,
    usesDailyAverageWording
  );

  const chartConfig: ChartConfig = {
    outgoing: {
      label: "Outgoing",
    },
    incoming: {
      label: "Incoming",
    },
  };

  const outgoingSegmentFill: string = "hsl(var(--primary))";
  const incomingSegmentFill: string = INCOMING_COLOR;
  const outgoingInsideLabelFill: string = "hsl(var(--primary-foreground))";
  const incomingInsideLabelFill: string = "hsl(var(--primary-foreground))";

  const maxBarWidth: number = 48;
  const chartTopMargin: number = 20;
  const xAxisTickMargin: number = 8;
  const showTickLabelEveryNthHour: number = 0;
  const barCornerRadius: [number, number, number, number] = [4, 4, 0, 0];
  const insideLabelShareDivisor: number = 8;
  const highestCallTotal: number = getHighestCallTotal(hourlyBars);
  const minimumInsideLabelCount: number = highestCallTotal / insideLabelShareDivisor;

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
            dataKey="axisLabel"
            interval={showTickLabelEveryNthHour}
            axisLine={false}
            tickLine={false}
            tickMargin={xAxisTickMargin}
            tick={(tickProps: HourAxisTickProps) =>
              renderHourAxisTick(tickProps, bestHourBar.axisLabel)
            }
          />
          <Bar
            dataKey="incoming"
            stackId="calls"
            fill={incomingSegmentFill}
            maxBarSize={maxBarWidth}
          >
            <LabelList
              dataKey="incoming"
              position="insideTop"
              content={(labelProps: ChartLabelProps) =>
                renderSegmentInsideLabel(labelProps, incomingInsideLabelFill, minimumInsideLabelCount)
              }
            />
          </Bar>
          <Bar
            dataKey="outgoing"
            stackId="calls"
            fill={outgoingSegmentFill}
            radius={barCornerRadius}
            maxBarSize={maxBarWidth}
          >
            <LabelList
              dataKey="totalLabel"
              position="top"
              content={(labelProps: ChartLabelProps) =>
                renderTotalTopLabel(labelProps, bestHourIndex, outgoingSegmentFill)
              }
            />
            <LabelList
              dataKey="outgoing"
              position="insideTop"
              content={(labelProps: ChartLabelProps) =>
                renderSegmentInsideLabel(labelProps, outgoingInsideLabelFill, minimumInsideLabelCount)
              }
            />
          </Bar>
        </BarChart>
      </ChartContainer>
      <p className="mt-3 text-xs text-muted-foreground sm:text-sm">{chartSummaryLine}</p>
    </DashboardCard>
  );
}
