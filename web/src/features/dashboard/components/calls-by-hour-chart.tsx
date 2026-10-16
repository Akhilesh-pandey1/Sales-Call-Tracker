import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis } from "recharts";
import { DashboardCard, EmptyPeriodNote } from "./dashboard-card";
import { formatCount } from "../utils/format";

interface HourlyDialBar {
  hourLabel: string;
  dials: number;
  dialsLabel: string;
  isBestHour: boolean;
}

interface CallsByHourChartProps {
  hourlyDials: number[];
  showsDailyAverage: boolean;
  headingLabel: string;
  className?: string;
}

function getTwelveHourLabel(hour: number): string {
  const noonHour: number = 12;
  const hourOnTwelveHourClock: number = hour % noonHour === 0 ? noonHour : hour % noonHour;
  const dayPeriod: string = hour < noonHour ? "AM" : "PM";
  const hourLabel: string = `${hourOnTwelveHourClock} ${dayPeriod}`;
  return hourLabel;
}

function hasAnyDials(hourlyDials: number[]): boolean {
  return hourlyDials.some((hourTotal: number) => hourTotal > 0);
}

function getBestHourIndex(hourlyDials: number[]): number {
  const highestDialCount: number = Math.max(...hourlyDials);
  const bestHourIndex: number = hourlyDials.indexOf(highestDialCount);
  return bestHourIndex;
}

function buildHourlyBars(
  hourlyDials: number[],
  bestHourIndex: number,
  dailyAverageDivisor: number
): HourlyDialBar[] {
  const hourlyBars: HourlyDialBar[] = hourlyDials.map((hourTotal: number, hour: number) => {
    const dials: number = Math.round(hourTotal / dailyAverageDivisor);
    const dialsLabel: string = dials === 0 ? "" : formatCount(dials);
    const hourlyBar: HourlyDialBar = {
      hourLabel: getTwelveHourLabel(hour),
      dials,
      dialsLabel,
      isBestHour: hour === bestHourIndex,
    };
    return hourlyBar;
  });
  return hourlyBars;
}

function buildBestHourSummaryLine(bestHourBar: HourlyDialBar, showsDailyAverage: boolean): string {
  const bestHourDialsLabel: string = formatCount(bestHourBar.dials);
  if (showsDailyAverage) {
    const summaryLine: string = `Best hour: ${bestHourBar.hourLabel} — ${bestHourDialsLabel} dials a day on average.`;
    return summaryLine;
  }
  const summaryLine: string = `Best hour: ${bestHourBar.hourLabel} — ${bestHourDialsLabel} dials.`;
  return summaryLine;
}

export function CallsByHourChart({
  hourlyDials,
  showsDailyAverage,
  headingLabel,
  className,
}: CallsByHourChartProps) {
  if (!hasAnyDials(hourlyDials)) {
    return (
      <DashboardCard title="Calls by hour" headingLabel={headingLabel} className={className}>
        <EmptyPeriodNote />
      </DashboardCard>
    );
  }

  const singleDayDivisor: number = 1;
  const thirtyDayDivisor: number = 30;
  const dailyAverageDivisor: number = showsDailyAverage ? thirtyDayDivisor : singleDayDivisor;

  const bestHourIndex: number = getBestHourIndex(hourlyDials);
  const hourlyBars: HourlyDialBar[] = buildHourlyBars(
    hourlyDials,
    bestHourIndex,
    dailyAverageDivisor
  );
  const bestHourBar: HourlyDialBar = hourlyBars[bestHourIndex];
  const bestHourSummaryLine: string = buildBestHourSummaryLine(bestHourBar, showsDailyAverage);

  const bestHourBarColor: string = "hsl(var(--primary))";
  const otherBarColor: string = "hsl(var(--primary) / 0.3)";
  const axisLabelColor: string = "hsl(var(--muted-foreground))";

  const chartLabelFontSize: number = 10;
  const maxBarWidth: number = 28;
  const chartTopMargin: number = 20;
  const xAxisTickMargin: number = 8;
  const showTickLabelEveryNthHour: number = 2;
  const barCornerRadius: [number, number, number, number] = [4, 4, 0, 0];

  return (
    <DashboardCard title="Calls by hour" headingLabel={headingLabel} className={className}>
      <div className="mt-4 h-52 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
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
            </Bar>
            <LabelList
              dataKey="dialsLabel"
              position="top"
              fontSize={chartLabelFontSize}
              fill={axisLabelColor}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-xs text-muted-foreground sm:text-sm">{bestHourSummaryLine}</p>
    </DashboardCard>
  );
}
