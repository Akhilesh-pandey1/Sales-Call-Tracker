import type { KeyboardEvent } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/shared/utils/cn";
import type { TeamMemberStats, TeamPeriodStats } from "../types";
import { convertSecondsToMinutes } from "../utils/format";

interface TeamTableProps {
  people: TeamMemberStats[];
  onOpenPerson: (personId: number) => void;
}

const numberCellAlignClass: string = "text-right tabular-nums whitespace-nowrap";

interface MetricColumnHeadsProps {
  hasLeadingBorder: boolean;
}

function MetricColumnHeads({ hasLeadingBorder }: MetricColumnHeadsProps) {
  const leadingBorderClass: string = hasLeadingBorder ? "border-l pl-4" : "";

  return (
    <>
      <TableHead className={cn("h-9", leadingBorderClass, numberCellAlignClass)}>Dials</TableHead>
      <TableHead className={cn("h-9", numberCellAlignClass)}>Connected</TableHead>
      <TableHead className={cn("h-9 pr-4", numberCellAlignClass)}>Min</TableHead>
    </>
  );
}

interface PersonPeriodCellsProps {
  stats: TeamPeriodStats;
  isYesterdayGroup: boolean;
}

function PersonPeriodCells({ stats, isYesterdayGroup }: PersonPeriodCellsProps) {
  const periodMinutes: number = convertSecondsToMinutes(stats.seconds);

  const emphasizedClass: string = "font-semibold text-foreground";
  const mutedClass: string = "text-muted-foreground";
  const connectedClass: string = "font-semibold text-green-600";

  const dialsCellClass: string = cn(
    "border-l pl-4",
    numberCellAlignClass,
    isYesterdayGroup || stats.dials === 0 ? mutedClass : emphasizedClass
  );
  const connectedCellClass: string = cn(
    numberCellAlignClass,
    isYesterdayGroup || stats.connected === 0 ? mutedClass : connectedClass
  );
  const minutesCellClass: string = cn(
    "pr-4",
    numberCellAlignClass,
    isYesterdayGroup || periodMinutes === 0 ? mutedClass : emphasizedClass
  );

  return (
    <>
      <TableCell className={dialsCellClass}>{stats.dials}</TableCell>
      <TableCell className={connectedCellClass}>{stats.connected}</TableCell>
      <TableCell className={minutesCellClass}>{periodMinutes}</TableCell>
    </>
  );
}

interface PersonRowProps {
  person: TeamMemberStats;
  onOpen: (personId: number) => void;
}

function PersonRow({ person, onOpen }: PersonRowProps) {
  const enterKey: string = "Enter";
  const spaceKey: string = " ";

  const handleRowClick = (): void => {
    onOpen(person.id);
  };

  const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>): void => {
    const isActivationKey: boolean = event.key === enterKey || event.key === spaceKey;
    if (!isActivationKey) {
      return;
    }
    event.preventDefault();
    onOpen(person.id);
  };

  return (
    <TableRow
      onClick={handleRowClick}
      onKeyDown={handleRowKeyDown}
      tabIndex={0}
      aria-label={`Open stats for ${person.name}`}
      className="cursor-pointer"
    >
      <TableCell className="whitespace-nowrap p-4 font-medium">{person.name}</TableCell>
      <PersonPeriodCells stats={person.today} isYesterdayGroup={false} />
      <PersonPeriodCells stats={person.yesterday} isYesterdayGroup={true} />
    </TableRow>
  );
}

export function TeamTable({ people, onOpenPerson }: TeamTableProps) {
  const personCountLabel: string = `${people.length} ${people.length === 1 ? "person" : "people"}`;
  const periodHeadClass: string =
    "h-12 border-l pl-4 text-center text-sm font-bold normal-case tracking-tight text-foreground";

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 sm:px-6">
        <h3 className="text-base font-bold tracking-tight">Team</h3>
        <span className="text-sm text-muted-foreground">
          {personCountLabel} · sorted by today&apos;s dials
        </span>
      </div>

      <div className="overflow-x-auto px-5 pb-4 sm:px-6">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-12 whitespace-nowrap">Salesperson</TableHead>
              <TableHead colSpan={3} className={periodHeadClass}>
                Today
              </TableHead>
              <TableHead colSpan={3} className={periodHeadClass}>
                Yesterday
              </TableHead>
            </TableRow>
            <TableRow className="border-b hover:bg-transparent">
              <TableHead className="h-9" />
              <MetricColumnHeads hasLeadingBorder />
              <MetricColumnHeads hasLeadingBorder={false} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {people.map((person: TeamMemberStats) => (
              <PersonRow key={person.id} person={person} onOpen={onOpenPerson} />
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
