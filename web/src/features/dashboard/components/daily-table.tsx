import type { ReactElement } from "react";
import {
  Bar,
  BarChart,
  LabelList,
  Rectangle,
  XAxis,
  type BarShapeProps,
} from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { formatCount } from "@/shared/utils/format-count";
import { DashboardCard } from "./dashboard-card";
import { INCOMING_COLOR } from "./chart-colors";
import type { DailyRow } from "../types";

interface DailyLabelProps {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  value?: string | number | boolean | null;
}

interface DailyBarData {
  dayLabel: string;
  connected: number;
  notConnected: number;
  dialsLabel: string;
}

interface DailyLegendEntry {
  legendLabel: string;
  dotColor: string;
}

interface DailyTableProps {
  rows: DailyRow[];
  className?: string;
}

function buildDayOfMonthLabel(dayDate: string): string {
  const dayPart: string = dayDate.slice(-2);
  const dayOfMonthLabel: string = String(Number(dayPart));
  return dayOfMonthLabel;
}

function buildDailyBars(rows: DailyRow[]): DailyBarData[] {
  const dailyBars: DailyBarData[] = rows.map((row: DailyRow) => ({
    dayLabel: buildDayOfMonthLabel(row.date),
    connected: row.connected,
    notConnected: row.not_connected,
    dialsLabel: formatCount(row.dials),
  }));
  return dailyBars;
}

function renderNotConnectedSegment(segmentProps: BarShapeProps): ReactElement {
  const segmentRectangle: ReactElement = (
    <Rectangle
      x={segmentProps.x}
      y={segmentProps.y}
      width={segmentProps.width}
      height={segmentProps.height}
      radius={segmentProps.radius}
      fill={segmentProps.fill}
    />
  );
  return segmentRectangle;
}

function renderDialsTopLabel(labelProps: DailyLabelProps): ReactElement | null {
  if (labelProps.value === undefined || labelProps.value === null) {
    return null;
  }
  if (
    labelProps.x === undefined ||
    labelProps.y === undefined ||
    labelProps.width === undefined
  ) {
    return null;
  }
  const labelFontSize: number = 9;
  const labelGapAboveBar: number = 6;
  const mutedLabelFill: string = "hsl(var(--muted-foreground))";
  const centerX: number = Number(labelProps.x) + Number(labelProps.width) / 2;
  const labelY: number = Number(labelProps.y) - labelGapAboveBar;
  return (
    <text
      x={centerX}
      y={labelY}
      textAnchor="middle"
      fontSize={labelFontSize}
      fill={mutedLabelFill}
    >
      {labelProps.value}
    </text>
  );
}

function DailyLegend({ entries }: { entries: DailyLegendEntry[] }) {
  return (
    <div className="mt-3 flex items-center gap-4">
      {entries.map((entry: DailyLegendEntry) => (
        <span
          key={entry.legendLabel}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground"
        >
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.dotColor }}
          />
          {entry.legendLabel}
        </span>
      ))}
    </div>
  );
}

export function DailyTable({ rows, className }: DailyTableProps) {
  const dailyBars: DailyBarData[] = buildDailyBars(rows);
  const chartConfig: ChartConfig = {
    connected: { label: "Connected" },
    notConnected: { label: "Not connected" },
  };
  const notConnectedSegmentFill: string = "hsl(var(--primary))";
  const connectedSegmentFill: string = INCOMING_COLOR;
  const barCornerRadius: [number, number, number, number] = [4, 4, 0, 0];
  const maximumBarWidth: number = 20;
  const chartTopMargin: number = 20;
  const xAxisTickMargin: number = 8;
  const axisLabelFontSize: number = 9;
  const axisLabelFill: string = "hsl(var(--muted-foreground))";
  const legendEntries: DailyLegendEntry[] = [
    { legendLabel: "Not connected", dotColor: notConnectedSegmentFill },
    { legendLabel: "Connected", dotColor: connectedSegmentFill },
  ];

  return (
    <DashboardCard
      title="Day by day"
      headingLabel="Dials per day · last 30 days (IST)"
      className={className}
    >
      <ChartContainer config={chartConfig} className="mt-4 aspect-auto h-44">
        <BarChart
          data={dailyBars}
          margin={{ top: chartTopMargin, right: 0, bottom: 0, left: 0 }}
        >
          <XAxis
            dataKey="dayLabel"
            interval={0}
            axisLine={false}
            tickLine={false}
            tickMargin={xAxisTickMargin}
            tick={{ fontSize: axisLabelFontSize, fill: axisLabelFill }}
          />
          <Bar
            dataKey="connected"
            stackId="dials"
            fill={connectedSegmentFill}
            maxBarSize={maximumBarWidth}
          />
          <Bar
            dataKey="notConnected"
            stackId="dials"
            fill={notConnectedSegmentFill}
            radius={barCornerRadius}
            maxBarSize={maximumBarWidth}
            shape={renderNotConnectedSegment}
          >
            <LabelList
              dataKey="dialsLabel"
              position="top"
              content={(labelProps: DailyLabelProps) => renderDialsTopLabel(labelProps)}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
      <DailyLegend entries={legendEntries} />
    </DashboardCard>
  );
}
