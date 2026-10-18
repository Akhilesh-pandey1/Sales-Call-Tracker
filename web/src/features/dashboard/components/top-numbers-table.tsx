import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCount } from "@/shared/utils/format-count";
import type { TopCalledNumber } from "../types";

interface TopNumbersTableProps {
  numbers: TopCalledNumber[];
}

interface TopNumberLabels {
  minutes: string;
  calls: string;
}

function buildTopNumberLabels(topNumber: TopCalledNumber): TopNumberLabels {
  const topNumberLabels: TopNumberLabels = {
    minutes: formatCount(topNumber.minutes),
    calls: formatCount(topNumber.calls),
  };
  return topNumberLabels;
}

interface TopNumberRowProps {
  topNumber: TopCalledNumber;
}

function TopNumberDesktopRow({ topNumber }: TopNumberRowProps) {
  const labels: TopNumberLabels = buildTopNumberLabels(topNumber);

  return (
    <TableRow>
      <TableCell className="p-4 font-medium">{topNumber.phone_number}</TableCell>
      <TableCell className="p-4 text-right font-bold tabular-nums">
        {labels.minutes} <span className="font-normal text-muted-foreground">min</span>
      </TableCell>
      <TableCell className="p-4 text-right font-semibold tabular-nums">{labels.calls}</TableCell>
    </TableRow>
  );
}

function TopNumberMobileRow({ topNumber }: TopNumberRowProps) {
  const labels: TopNumberLabels = buildTopNumberLabels(topNumber);

  return (
    <div className="flex items-center justify-between gap-3 py-3.5">
      <span className="font-medium">{topNumber.phone_number}</span>
      <span className="text-sm tabular-nums">
        <span className="font-bold">{labels.minutes}</span> min · {labels.calls} calls
      </span>
    </div>
  );
}

export function TopNumbersTable({ numbers }: TopNumbersTableProps) {
  const hasNumbers: boolean = numbers.length > 0;

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-6">
        <h3 className="text-base font-bold tracking-tight">Most contacted numbers</h3>
        <span className="text-sm text-muted-foreground">Last 30 days · sorted by talk time</span>
      </div>

      {hasNumbers ? (
        <>
          <div className="hidden px-5 pb-4 sm:px-6 md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Phone number</TableHead>
                  <TableHead className="text-right">Minutes</TableHead>
                  <TableHead className="text-right">Calls</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {numbers.map((topNumber: TopCalledNumber) => (
                  <TopNumberDesktopRow key={topNumber.phone_number} topNumber={topNumber} />
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="px-4 pb-3 sm:px-6 md:hidden">
            <div className="mt-3 divide-y">
              {numbers.map((topNumber: TopCalledNumber) => (
                <TopNumberMobileRow key={topNumber.phone_number} topNumber={topNumber} />
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="px-5 pb-5 pt-3 text-sm text-muted-foreground sm:px-6">
          No calls in the last 30 days.
        </p>
      )}
    </section>
  );
}
