import { cn } from "@/shared/utils/cn";
import { formatCount } from "@/shared/utils/format-count";
import { DashboardCard, EmptyPeriodNote } from "./dashboard-card";
import type { TeamTopPerson } from "../types";

interface TopPeopleListProps {
  people: TeamTopPerson[];
  headingLabel: string;
  className?: string;
}

export function TopPeopleList({ people, headingLabel, className }: TopPeopleListProps) {
  const hasTopPeople: boolean = people.length > 0;

  const topPersonRankClass = (rank: number): string =>
    rank === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground";

  return (
    <DashboardCard title="Top 5 by minutes" headingLabel={headingLabel} className={className}>
      {!hasTopPeople ? (
        <EmptyPeriodNote />
      ) : (
        <ul className="mt-2">
          {people.map((person: TeamTopPerson, rank: number) => (
            <li
              key={person.id}
              className={cn("flex items-center gap-3 py-2.5", rank > 0 && "border-t border-border")}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  topPersonRankClass(rank)
                )}
              >
                {rank + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{person.name}</span>
              <span className="shrink-0 text-sm font-bold tabular-nums">
                {formatCount(person.minutes)} min
              </span>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
