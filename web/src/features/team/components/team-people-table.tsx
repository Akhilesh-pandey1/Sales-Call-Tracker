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
import { handleRowActivationKeyDown } from "@/shared/utils/row-activation";
import { formatCount } from "@/shared/utils/format-count";
import type { TeamPersonPeriodStats, TeamPersonRow } from "../types";

interface TeamPeopleTableProps {
  people: TeamPersonRow[];
  onOpenPerson: (userId: number) => void;
}

interface PeopleListProps {
  people: TeamPersonRow[];
  onOpen: (userId: number) => void;
}

function formatPeriodNumbers(periodStats: TeamPersonPeriodStats): string {
  const numbersLabel: string = `${formatCount(periodStats.dials)} / ${formatCount(periodStats.connected)} / ${formatCount(periodStats.minutes)}`;
  return numbersLabel;
}

interface DesktopPersonRowProps {
  person: TeamPersonRow;
  onOpen: (userId: number) => void;
}

function DesktopPersonRow({ person, onOpen }: DesktopPersonRowProps) {
  const handleRowClick = (): void => {
    onOpen(person.user_id);
  };

  const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>): void => {
    handleRowActivationKeyDown(event, handleRowClick);
  };

  const hasNoDialsToday: boolean = person.today.dials === 0;
  const todayDialsClassName: string = cn(
    "border-l p-4 text-right tabular-nums",
    hasNoDialsToday ? "text-muted-foreground" : "font-semibold"
  );
  const todayConnectedClassName: string = cn(
    "p-4 text-right tabular-nums",
    hasNoDialsToday ? "text-muted-foreground" : "font-semibold text-green-600"
  );
  const todayMinutesClassName: string = cn(
    "p-4 text-right tabular-nums",
    hasNoDialsToday ? "text-muted-foreground" : "font-semibold"
  );

  return (
    <TableRow
      onClick={handleRowClick}
      onKeyDown={handleRowKeyDown}
      tabIndex={0}
      aria-label={`Open stats for ${person.name}`}
      className="cursor-pointer"
    >
      <TableCell className="p-4 font-medium">{person.name}</TableCell>
      <TableCell className={todayDialsClassName}>
        {formatCount(person.today.dials)}
      </TableCell>
      <TableCell className={todayConnectedClassName}>
        {formatCount(person.today.connected)}
      </TableCell>
      <TableCell className={todayMinutesClassName}>
        {formatCount(person.today.minutes)}
      </TableCell>
      <TableCell className="border-l p-4 text-right tabular-nums text-muted-foreground">
        {formatCount(person.yesterday.dials)}
      </TableCell>
      <TableCell className="p-4 text-right tabular-nums text-muted-foreground">
        {formatCount(person.yesterday.connected)}
      </TableCell>
      <TableCell className="p-4 text-right tabular-nums text-muted-foreground">
        {formatCount(person.yesterday.minutes)}
      </TableCell>
    </TableRow>
  );
}

function DesktopPeopleTable({ people, onOpen }: PeopleListProps) {
  return (
    <div className="hidden px-5 pb-4 sm:px-6 md:block">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Salesperson</TableHead>
            <TableHead
              colSpan={3}
              className="border-l text-center text-sm font-bold normal-case tracking-tight text-foreground"
            >
              Today
            </TableHead>
            <TableHead
              colSpan={3}
              className="border-l text-center text-sm font-bold normal-case tracking-tight text-muted-foreground"
            >
              Yesterday
            </TableHead>
          </TableRow>
          <TableRow className="hover:bg-transparent">
            <TableHead aria-hidden="true" />
            <TableHead className="border-l text-right">Dials</TableHead>
            <TableHead className="text-right">Connected</TableHead>
            <TableHead className="text-right">Min</TableHead>
            <TableHead className="border-l text-right">Dials</TableHead>
            <TableHead className="text-right">Connected</TableHead>
            <TableHead className="text-right">Min</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {people.map((person: TeamPersonRow) => (
            <DesktopPersonRow key={person.user_id} person={person} onOpen={onOpen} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

interface TodayNumbersProps {
  todayStats: TeamPersonPeriodStats;
}

function TodayNumbers({ todayStats }: TodayNumbersProps) {
  const hasNoDialsToday: boolean = todayStats.dials === 0;
  const lineClassName: string = cn(
    "tabular-nums",
    hasNoDialsToday ? "text-muted-foreground" : "font-semibold"
  );
  const connectedClassName: string = hasNoDialsToday
    ? "text-muted-foreground"
    : "text-green-600";

  return (
    <span className={lineClassName}>
      {formatCount(todayStats.dials)} /{" "}
      <span className={connectedClassName}>{formatCount(todayStats.connected)}</span> /{" "}
      {formatCount(todayStats.minutes)}
    </span>
  );
}

interface PersonCardProps {
  person: TeamPersonRow;
  onOpen: (userId: number) => void;
}

function PersonCard({ person, onOpen }: PersonCardProps) {
  const handleCardClick = (): void => {
    onOpen(person.user_id);
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    handleRowActivationKeyDown(event, handleCardClick);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      aria-label={`Open stats for ${person.name}`}
      className="w-full cursor-pointer rounded-xl border px-4 py-3.5 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex items-center justify-between gap-2">
        <span className="font-medium">{person.name}</span>
        <ChevronRight className="h-6 w-6 shrink-0 text-muted-foreground" />
      </span>
      <span className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        <span className="text-muted-foreground">Today</span>
        <TodayNumbers todayStats={person.today} />
        <span className="text-muted-foreground">Yesterday</span>
        <span className="tabular-nums text-muted-foreground">
          {formatPeriodNumbers(person.yesterday)}
        </span>
      </span>
    </div>
  );
}

function MobilePersonCards({ people, onOpen }: PeopleListProps) {
  return (
    <div className="px-4 pb-4 sm:px-6 md:hidden">
      <p className="mt-3 text-xs text-muted-foreground">dials / connected / minutes</p>
      <div className="mt-2 space-y-2">
        {people.map((person: TeamPersonRow) => (
          <PersonCard key={person.user_id} person={person} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}

export function TeamPeopleTable({ people, onOpenPerson }: TeamPeopleTableProps) {
  const personWord: string = people.length === 1 ? "person" : "people";
  const countLabel: string = `${formatCount(people.length)} ${personWord} · sorted by today's dials`;

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-6">
        <h3 className="text-base font-bold tracking-tight">Salespeople</h3>
        <span className="text-sm text-muted-foreground">{countLabel}</span>
      </div>

      <DesktopPeopleTable people={people} onOpen={onOpenPerson} />
      <MobilePersonCards people={people} onOpen={onOpenPerson} />
    </section>
  );
}
