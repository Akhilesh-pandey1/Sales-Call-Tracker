import type { ReactNode } from "react";
import { Cell, Pie, PieChart } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { formatCount } from "@/shared/utils/format-count";
import { DashboardCard, EmptyPeriodNote } from "./dashboard-card";
import { INCOMING_COLOR } from "./chart-colors";
import type { TalkTotals } from "../types";

interface TalkSplitCardProps {
  talkTotals: TalkTotals;
  totalMinutes: number;
  headingAction?: ReactNode;
}

interface TalkSplitSegment {
  directionName: string;
  percent: number;
  fill: string;
}

interface TalkDirectionLegendRowProps {
  directionName: string;
  dotColor: string;
  minutes: number;
}

function TalkDirectionLegendRow({
  directionName,
  dotColor,
  minutes,
}: TalkDirectionLegendRowProps) {
  const minutesLabel: string = formatCount(minutes);

  return (
    <span className="flex items-center justify-between gap-2 text-sm font-medium">
      <span className="flex items-center gap-2">
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
        {directionName}
      </span>
      <span className="tabular-nums">{minutesLabel} min</span>
    </span>
  );
}

export function TalkSplitCard({ talkTotals, totalMinutes, headingAction }: TalkSplitCardProps) {
  const hasNoTalk: boolean =
    talkTotals.outgoing_calls === 0 && talkTotals.incoming_calls === 0;
  if (hasNoTalk) {
    return (
      <DashboardCard title="Call Split" headingAction={headingAction}>
        <EmptyPeriodNote />
      </DashboardCard>
    );
  }

  const incomingColor: string = INCOMING_COLOR;
  const outgoingColor: string = "hsl(var(--primary))";
  const donutOuterRadius: number = 73;
  const donutInnerRadius: number = 54;
  const totalMinutesLabel: string = formatCount(totalMinutes);
  const talkSplitSegments: TalkSplitSegment[] = [
    { directionName: "Outgoing", percent: talkTotals.outgoing_percent, fill: outgoingColor },
    { directionName: "Incoming", percent: talkTotals.incoming_percent, fill: incomingColor },
  ];
  const talkSplitChartConfig: ChartConfig = {
    outgoing: { label: "Outgoing" },
    incoming: { label: "Incoming" },
  };

  return (
    <DashboardCard title="Call Split" headingAction={headingAction}>
      <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:justify-center sm:gap-12">
        <div
          className="relative h-40 w-40"
          role="img"
          aria-label="Donut chart of outgoing versus incoming talk minutes"
        >
          <ChartContainer config={talkSplitChartConfig} className="h-40 w-40">
            <PieChart>
              <Pie
                data={talkSplitSegments}
                dataKey="percent"
                nameKey="directionName"
                startAngle={90}
                endAngle={-270}
                innerRadius={donutInnerRadius}
                outerRadius={donutOuterRadius}
                strokeWidth={0}
              >
                {talkSplitSegments.map((talkSplitSegment: TalkSplitSegment) => (
                  <Cell
                    key={talkSplitSegment.directionName}
                    fill={talkSplitSegment.fill}
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold tabular-nums tracking-tight">
              {totalMinutesLabel}
            </span>
            <span className="text-xs text-muted-foreground">total min</span>
          </div>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-1.5">
          <TalkDirectionLegendRow
            directionName="Outgoing"
            dotColor={outgoingColor}
            minutes={talkTotals.outgoing_minutes}
          />
          <TalkDirectionLegendRow
            directionName="Incoming"
            dotColor={incomingColor}
            minutes={talkTotals.incoming_minutes}
          />
        </div>
      </div>
    </DashboardCard>
  );
}
