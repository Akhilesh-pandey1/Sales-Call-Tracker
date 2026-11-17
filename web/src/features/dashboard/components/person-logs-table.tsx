import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";
import { formatLogDate, formatLogMinutes, formatLogTime } from "../utils/format";
import type { PersonLogRow } from "../types";

const LOG_ROW_GRID_CLASS: string =
  "grid grid-cols-[1.6fr_0.9fr_1fr_1fr_0.9fr_0.8fr] items-center gap-x-2 sm:gap-x-3";

function formatDirectionLabel(direction: PersonLogRow["direction"]): string {
  const incomingLabel: string = "Incoming";
  const outgoingLabel: string = "Outgoing";
  if (direction === "incoming") {
    return incomingLabel;
  }
  return outgoingLabel;
}

interface LogColumnHeadersProps {
  hasRows: boolean;
}

function LogColumnHeaders({ hasRows }: LogColumnHeadersProps) {
  const headerVisibilityClassName: string = hasRows ? "" : "hidden";

  return (
    <div
      className={cn(
        "mt-4 border-b pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
        LOG_ROW_GRID_CLASS,
        headerVisibilityClassName
      )}
    >
      <div>Phone number</div>
      <div className="text-right">Date</div>
      <div className="text-right">Time</div>
      <div className="text-right">Direction</div>
      <div className="text-right">Connected</div>
      <div className="text-right">Minutes</div>
    </div>
  );
}

interface LogRowProps {
  logRow: PersonLogRow;
  isLastRow: boolean;
}

function LogRow({ logRow, isLastRow }: LogRowProps) {
  const isIncoming: boolean = logRow.direction === "incoming";
  const directionClassName: string = cn(
    "text-right font-medium",
    isIncoming && "text-green-600"
  );
  const connectedClassName: string = cn(
    "text-right tabular-nums",
    logRow.connected ? "font-semibold text-green-600" : "text-muted-foreground"
  );
  const minutesClassName: string = cn(
    "text-right tabular-nums",
    logRow.connected ? "font-semibold" : "text-muted-foreground"
  );
  const rowBorderClassName: string = isLastRow ? "" : "border-b";

  return (
    <div className={cn(LOG_ROW_GRID_CLASS, rowBorderClassName, "py-3")}>
      <div className="break-all font-medium">{logRow.phone_number}</div>
      <div className="text-right tabular-nums text-muted-foreground">
        {formatLogDate(logRow.date)}
      </div>
      <div className="text-right tabular-nums text-muted-foreground">
        {formatLogTime(logRow.time)}
      </div>
      <div className={directionClassName}>{formatDirectionLabel(logRow.direction)}</div>
      <div className={connectedClassName}>{logRow.connected ? "Yes" : "No"}</div>
      <div className={minutesClassName}>{formatLogMinutes(logRow.minutes)}</div>
    </div>
  );
}

interface PersonLogsTableProps {
  rows: PersonLogRow[];
  action?: ReactNode;
}

export function PersonLogsTable({ rows, action }: PersonLogsTableProps) {
  const hasRows: boolean = rows.length > 0;
  const emptyWindowMessage: string = "No calls in the last 30 days.";
  const bodyClassName: string = hasRows
    ? "px-4 pb-4 sm:px-6"
    : "px-4 pb-8 sm:px-6";
  const hasAction: boolean = action !== undefined;

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 pt-5 sm:px-6">
        <h3 className="text-base font-bold tracking-tight">Logs</h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-sm text-muted-foreground">
            Last 30 days · every call on record
          </span>
          {hasAction ? action : null}
        </div>
      </div>

      <div className={bodyClassName}>
        <LogColumnHeaders hasRows={hasRows} />
        {hasRows ? (
          rows.map((logRow: PersonLogRow, rowIndex: number) => (
            <LogRow
              key={`${logRow.phone_number}-${logRow.date}-${logRow.time}-${rowIndex}`}
              logRow={logRow}
              isLastRow={rowIndex === rows.length - 1}
            />
          ))
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {emptyWindowMessage}
          </p>
        )}
      </div>
    </section>
  );
}
