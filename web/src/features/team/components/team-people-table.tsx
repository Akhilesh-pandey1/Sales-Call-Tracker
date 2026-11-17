import type { KeyboardEvent, MouseEvent } from "react";
import { ChevronRight, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TeamLogDay } from "@/features/dashboard";
import { cn } from "@/shared/utils/cn";
import { handleRowActivationKeyDown } from "@/shared/utils/row-activation";
import { formatCount } from "@/shared/utils/format-count";
import type {
  PersonDayDownloadTarget,
  TeamPersonPeriodStats,
  TeamPersonRow,
} from "../types";

interface TeamPeopleTableProps {
  people: TeamPersonRow[];
  onOpenPerson: (userId: number) => void;
  onDownloadDay: (day: TeamLogDay) => void;
  downloadingDay: TeamLogDay | null;
  onDownloadPersonDay: (target: PersonDayDownloadTarget) => void;
  downloadingPersonDayTarget: PersonDayDownloadTarget | null;
}

interface PeopleListProps {
  people: TeamPersonRow[];
  onOpen: (userId: number) => void;
  onDownloadPersonDay: (target: PersonDayDownloadTarget) => void;
  downloadingPersonDayTarget: PersonDayDownloadTarget | null;
}

interface DownloadHeadingButtonProps {
  label: string;
  isDisabled: boolean;
  onClick: () => void;
}

function DownloadHeadingButton({
  label,
  isDisabled,
  onClick,
}: DownloadHeadingButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={isDisabled}
      onClick={onClick}
      className="absolute right-0 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Download className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

interface PersonDayDownloadControlProps {
  personName: string;
  day: TeamLogDay;
  appearance: "icon" | "chip";
  label?: string;
  isDisabled: boolean;
  onClick: () => void;
}

function PersonDayDownloadControl({
  personName,
  day,
  appearance,
  label,
  isDisabled,
  onClick,
}: PersonDayDownloadControlProps) {
  const buttonLabel: string = `Download ${personName}'s logs - ${day}`;
  const isChip: boolean = appearance === "chip";
  const iconButtonClassName: string =
    "h-7 w-7 text-muted-foreground hover:text-foreground";
  const chipButtonClassName: string =
    "gap-1 border border-border px-2 py-1 text-xs font-medium text-foreground";
  const buttonClassName: string = cn(
    "inline-flex cursor-pointer items-center justify-center rounded-lg transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
    isChip ? chipButtonClassName : iconButtonClassName
  );
  const iconClassName: string = isChip ? "h-3.5 w-3.5" : "h-4 w-4";

  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
    onClick();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
  };

  return (
    <button
      type="button"
      title={buttonLabel}
      aria-label={buttonLabel}
      disabled={isDisabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={buttonClassName}
    >
      <Download className={iconClassName} aria-hidden="true" />
      {label}
    </button>
  );
}

function formatPeriodNumbers(periodStats: TeamPersonPeriodStats): string {
  const numbersLabel: string = `${formatCount(periodStats.dials)} / ${formatCount(periodStats.connected)} / ${formatCount(periodStats.minutes)}`;
  return numbersLabel;
}

interface DesktopPersonRowProps {
  person: TeamPersonRow;
  onOpen: (userId: number) => void;
  onDownloadPersonDay: (target: PersonDayDownloadTarget) => void;
  downloadingPersonDayTarget: PersonDayDownloadTarget | null;
}

function DesktopPersonRow({
  person,
  onOpen,
  onDownloadPersonDay,
  downloadingPersonDayTarget,
}: DesktopPersonRowProps) {
  const handleRowClick = (): void => {
    onOpen(person.user_id);
  };

  const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>): void => {
    handleRowActivationKeyDown(event, handleRowClick);
  };

  const handleTodayDownloadClick = (): void => {
    onDownloadPersonDay({ userId: person.user_id, day: "today" });
  };

  const handleYesterdayDownloadClick = (): void => {
    onDownloadPersonDay({ userId: person.user_id, day: "yesterday" });
  };

  const hasNoDialsToday: boolean = person.today.dials === 0;
  const todayDialsClassName: string = cn(
    "border-l p-4 text-left tabular-nums",
    hasNoDialsToday ? "text-muted-foreground" : "font-semibold"
  );
  const todayConnectedClassName: string = cn(
    "p-4 text-center tabular-nums",
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
      <TableCell className="w-8 px-0 py-4">
        <span className="flex items-center justify-end">
          <PersonDayDownloadControl
            personName={person.name}
            day="today"
            appearance="icon"
            isDisabled={downloadingPersonDayTarget !== null}
            onClick={handleTodayDownloadClick}
          />
        </span>
      </TableCell>
      <TableCell className="border-l p-4 text-left tabular-nums text-muted-foreground">
        {formatCount(person.yesterday.dials)}
      </TableCell>
      <TableCell className="p-4 text-center tabular-nums text-muted-foreground">
        {formatCount(person.yesterday.connected)}
      </TableCell>
      <TableCell className="p-4 text-right tabular-nums text-muted-foreground">
        {formatCount(person.yesterday.minutes)}
      </TableCell>
      <TableCell className="w-8 px-0 py-4">
        <span className="flex items-center justify-end">
          <PersonDayDownloadControl
            personName={person.name}
            day="yesterday"
            appearance="icon"
            isDisabled={downloadingPersonDayTarget !== null}
            onClick={handleYesterdayDownloadClick}
          />
        </span>
      </TableCell>
    </TableRow>
  );
}

interface DesktopPeopleTableProps {
  people: TeamPersonRow[];
  onOpen: (userId: number) => void;
  onDownloadDay: (day: TeamLogDay) => void;
  downloadingDay: TeamLogDay | null;
  onDownloadPersonDay: (target: PersonDayDownloadTarget) => void;
  downloadingPersonDayTarget: PersonDayDownloadTarget | null;
}

function DesktopPeopleTable({
  people,
  onOpen,
  onDownloadDay,
  downloadingDay,
  onDownloadPersonDay,
  downloadingPersonDayTarget,
}: DesktopPeopleTableProps) {
  const isDownloading: boolean = downloadingDay !== null;

  const handleTodayDownloadClick = (): void => {
    onDownloadDay("today");
  };

  const handleYesterdayDownloadClick = (): void => {
    onDownloadDay("yesterday");
  };

  return (
    <div className="hidden px-5 pb-4 sm:px-6 md:block">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Salesperson</TableHead>
            <TableHead
              colSpan={4}
              className="relative border-l text-center text-sm font-bold normal-case tracking-tight text-foreground"
            >
              Today
              <DownloadHeadingButton
                label="Download all salespeople's logs - today"
                isDisabled={isDownloading}
                onClick={handleTodayDownloadClick}
              />
            </TableHead>
            <TableHead
              colSpan={4}
              className="relative border-l text-center text-sm font-bold normal-case tracking-tight text-muted-foreground"
            >
              Yesterday
              <DownloadHeadingButton
                label="Download all salespeople's logs - yesterday"
                isDisabled={isDownloading}
                onClick={handleYesterdayDownloadClick}
              />
            </TableHead>
          </TableRow>
          <TableRow className="hover:bg-transparent">
            <TableHead aria-hidden="true" />
            <TableHead className="border-l text-left">Dials</TableHead>
            <TableHead className="text-center">Connected</TableHead>
            <TableHead className="text-right">Min</TableHead>
            <TableHead className="w-8" aria-hidden="true" />
            <TableHead className="border-l text-left">Dials</TableHead>
            <TableHead className="text-center">Connected</TableHead>
            <TableHead className="text-right">Min</TableHead>
            <TableHead className="w-8" aria-hidden="true" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {people.map((person: TeamPersonRow) => (
            <DesktopPersonRow
              key={person.user_id}
              person={person}
              onOpen={onOpen}
              onDownloadPersonDay={onDownloadPersonDay}
              downloadingPersonDayTarget={downloadingPersonDayTarget}
            />
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
  onDownloadPersonDay: (target: PersonDayDownloadTarget) => void;
  downloadingPersonDayTarget: PersonDayDownloadTarget | null;
}

function PersonCard({
  person,
  onOpen,
  onDownloadPersonDay,
  downloadingPersonDayTarget,
}: PersonCardProps) {
  const handleCardClick = (): void => {
    onOpen(person.user_id);
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    handleRowActivationKeyDown(event, handleCardClick);
  };

  const handleTodayDownloadClick = (): void => {
    onDownloadPersonDay({ userId: person.user_id, day: "today" });
  };

  const handleYesterdayDownloadClick = (): void => {
    onDownloadPersonDay({ userId: person.user_id, day: "yesterday" });
  };

  const isDownloadingAnyPersonDay: boolean = downloadingPersonDayTarget !== null;

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
      <span className="mt-2 flex items-center gap-2 border-t border-border pt-2">
        <span className="text-xs text-muted-foreground">Download</span>
        <PersonDayDownloadControl
          personName={person.name}
          day="today"
          appearance="chip"
          label="Today"
          isDisabled={isDownloadingAnyPersonDay}
          onClick={handleTodayDownloadClick}
        />
        <PersonDayDownloadControl
          personName={person.name}
          day="yesterday"
          appearance="chip"
          label="Yesterday"
          isDisabled={isDownloadingAnyPersonDay}
          onClick={handleYesterdayDownloadClick}
        />
      </span>
    </div>
  );
}

function MobilePersonCards({
  people,
  onOpen,
  onDownloadPersonDay,
  downloadingPersonDayTarget,
}: PeopleListProps) {
  return (
    <div className="px-4 pb-4 sm:px-6 md:hidden">
      <p className="mt-3 text-xs text-muted-foreground">dials / connected / minutes</p>
      <div className="mt-2 space-y-2">
        {people.map((person: TeamPersonRow) => (
          <PersonCard
            key={person.user_id}
            person={person}
            onOpen={onOpen}
            onDownloadPersonDay={onDownloadPersonDay}
            downloadingPersonDayTarget={downloadingPersonDayTarget}
          />
        ))}
      </div>
    </div>
  );
}

export function TeamPeopleTable({
  people,
  onOpenPerson,
  onDownloadDay,
  downloadingDay,
  onDownloadPersonDay,
  downloadingPersonDayTarget,
}: TeamPeopleTableProps) {
  const personWord: string = people.length === 1 ? "person" : "people";
  const countLabel: string = `${formatCount(people.length)} ${personWord} · sorted by today's minutes`;

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-6">
        <h3 className="text-base font-bold tracking-tight">Salespeople</h3>
        <span className="text-sm text-muted-foreground">{countLabel}</span>
      </div>

      <DesktopPeopleTable
        people={people}
        onOpen={onOpenPerson}
        onDownloadDay={onDownloadDay}
        downloadingDay={downloadingDay}
        onDownloadPersonDay={onDownloadPersonDay}
        downloadingPersonDayTarget={downloadingPersonDayTarget}
      />
      <MobilePersonCards
        people={people}
        onOpen={onOpenPerson}
        onDownloadPersonDay={onDownloadPersonDay}
        downloadingPersonDayTarget={downloadingPersonDayTarget}
      />
    </section>
  );
}
