import type { KeyboardEvent } from "react";
import { ChevronRight } from "lucide-react";
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

const numberCellAlignClass: string = "text-right tabular-nums";

interface MetricColumnHeadsProps {
  hasLeadingBorder: boolean;
}

function MetricColumnHeads({ hasLeadingBorder }: MetricColumnHeadsProps) {
  const leadingBorderClass: string = hasLeadingBorder ? "border-l pl-4" : "";

  return (
    <>
      <TableHead className={cn("h-9", leadingBorderClass, numberCellAlignClass)}>Dials</TableHead>
      <TableHead className={cn("h-9", numberCellAlignClass)}>Connected</TableHead>
      <TableHead className={cn("h-9", numberCellAlignClass)}>Min</TableHead>
    </>
  );
}

interface PersonPeriodCellsProps {
  stats: TeamPeriodStats;
}

function PersonPeriodCells({ stats }: PersonPeriodCellsProps) {
  const periodMinutes: number = convertSecondsToMinutes(stats.seconds);

  return (
    <>
      <TableCell className={cn("border-l pl-4 font-semibold", numberCellAlignClass)}>
        {stats.dials}
      </TableCell>
      <TableCell className={numberCellAlignClass}>{stats.connected}</TableCell>
      <TableCell className={numberCellAlignClass}>{periodMinutes}</TableCell>
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
      <TableCell className="p-4 font-medium">{person.name}</TableCell>
      <PersonPeriodCells stats={person.today} />
      <PersonPeriodCells stats={person.yesterday} />
    </TableRow>
  );
}

interface DesktopTeamTableProps {
  people: TeamMemberStats[];
  onOpen: (personId: number) => void;
}

function DesktopTeamTable({ people, onOpen }: DesktopTeamTableProps) {
  const periodHeadClass: string =
    "h-12 border-l pl-4 text-center text-sm font-bold normal-case tracking-tight text-foreground";

  return (
    <div className="hidden px-5 pb-4 sm:px-6 md:block">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-12">Salesperson</TableHead>
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
            <PersonRow key={person.id} person={person} onOpen={onOpen} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

interface PersonCardPeriodRowProps {
  label: string;
  stats: TeamPeriodStats;
  valueClassName: string;
}

function PersonCardPeriodRow({ label, stats, valueClassName }: PersonCardPeriodRowProps) {
  const periodMinutes: number = convertSecondsToMinutes(stats.seconds);

  return (
    <>
      <span className="text-muted-foreground">{label}</span>
      <span className={valueClassName}>
        {stats.dials} / {stats.connected} / {periodMinutes}
      </span>
    </>
  );
}

interface PersonCardProps {
  person: TeamMemberStats;
  onOpen: (personId: number) => void;
}

function PersonCard({ person, onOpen }: PersonCardProps) {
  const handleCardClick = (): void => {
    onOpen(person.id);
  };

  return (
    <button
      type="button"
      onClick={handleCardClick}
      className="block w-full cursor-pointer rounded-xl border px-4 py-3.5 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex items-center justify-between gap-2">
        <span className="font-medium">{person.name}</span>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </span>
      <span className="mt-2 grid grid-cols-[6.5rem_1fr] gap-y-1 text-sm">
        <PersonCardPeriodRow
          label="Today"
          stats={person.today}
          valueClassName="font-semibold tabular-nums"
        />
        <PersonCardPeriodRow
          label="Yesterday"
          stats={person.yesterday}
          valueClassName="tabular-nums text-muted-foreground"
        />
      </span>
    </button>
  );
}

export function TeamTable({ people, onOpenPerson }: TeamTableProps) {
  const personCountLabel: string = `${people.length} ${people.length === 1 ? "person" : "people"}`;

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-6">
        <h3 className="text-base font-bold tracking-tight">Team</h3>
        <span className="text-sm text-muted-foreground">
          {personCountLabel} · sorted by today&apos;s dials
        </span>
      </div>

      <DesktopTeamTable people={people} onOpen={onOpenPerson} />

      <div className="px-4 pb-4 sm:px-6 md:hidden">
        <p className="mt-3 text-xs text-muted-foreground">dials / connected / minutes</p>
        <div className="mt-2 space-y-2">
          {people.map((person: TeamMemberStats) => (
            <PersonCard key={person.id} person={person} onOpen={onOpenPerson} />
          ))}
        </div>
      </div>
    </section>
  );
}
