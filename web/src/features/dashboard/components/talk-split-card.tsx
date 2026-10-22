import type { ReactNode } from "react";
import { formatCount } from "@/shared/utils/format-count";
import { DashboardCard, EmptyPeriodNote } from "./dashboard-card";
import { INCOMING_COLOR } from "./chart-colors";
import type { TalkTotals } from "../types";

interface TalkSplitCardProps {
  talkTotals: TalkTotals;
  totalMinutes: number;
  headingAction?: ReactNode;
}

interface SplitArcGeometry {
  outgoingArcLength: number;
  incomingArcLength: number;
  incomingArcStartRotation: number;
}

function buildSplitArcGeometry(
  incomingPercent: number,
  donutCircumference: number
): SplitArcGeometry {
  const totalPercent: number = 100;
  const fullCircleDegrees: number = 360;
  const incomingShare: number = incomingPercent / totalPercent;
  const outgoingShare: number = 1 - incomingShare;
  const arcGeometry: SplitArcGeometry = {
    outgoingArcLength: donutCircumference * outgoingShare,
    incomingArcLength: donutCircumference * incomingShare,
    incomingArcStartRotation: fullCircleDegrees * outgoingShare,
  };
  return arcGeometry;
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

  const viewBoxSize: number = 120;
  const ringCenter: number = 60;
  const ringRadius: number = 48;
  const ringStrokeWidth: number = 14;
  const donutCircumference: number = 2 * Math.PI * ringRadius;
  const incomingColor: string = INCOMING_COLOR;
  const outgoingColor: string = "hsl(var(--primary))";
  const arcGeometry: SplitArcGeometry = buildSplitArcGeometry(
    talkTotals.incoming_percent,
    donutCircumference
  );
  const totalMinutesLabel: string = formatCount(totalMinutes);

  return (
    <DashboardCard title="Call Split" headingAction={headingAction}>
      <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:justify-center sm:gap-12">
        <div className="relative h-40 w-40">
          <svg
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            className="h-40 w-40 -rotate-90"
            role="img"
            aria-label="Donut chart of outgoing versus incoming talk minutes"
          >
            <circle
              cx={ringCenter}
              cy={ringCenter}
              r={ringRadius}
              fill="none"
              stroke={incomingColor}
              strokeWidth={ringStrokeWidth}
              strokeDasharray={`${arcGeometry.incomingArcLength} ${donutCircumference}`}
              transform={`rotate(${arcGeometry.incomingArcStartRotation} ${ringCenter} ${ringCenter})`}
            />
            <circle
              cx={ringCenter}
              cy={ringCenter}
              r={ringRadius}
              fill="none"
              stroke={outgoingColor}
              strokeWidth={ringStrokeWidth}
              strokeDasharray={`${arcGeometry.outgoingArcLength} ${donutCircumference}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
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
