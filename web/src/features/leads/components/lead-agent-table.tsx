import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LeadPersonActivity } from "../types";

interface LeadAgentTableProps {
  people: LeadPersonActivity[];
}

export function LeadAgentTable({ people }: LeadAgentTableProps) {
  const hasPeople: boolean = people.length > 0;
  const tableColumnCount: number = 4;

  return (
    <section className="rounded-xl border bg-card shadow-sm">
      <div className="border-b p-4 sm:p-5">
        <h2 className="text-base font-bold tracking-tight">Today's Lead Calls</h2>
        <p className="text-xs text-muted-foreground">
          Each salesperson's lead calls attempted today.
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Salesperson</TableHead>
            <TableHead className="text-right">Attempted</TableHead>
            <TableHead className="text-right">Connected</TableHead>
            <TableHead className="text-right">Not Connected</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hasPeople ? (
            people.map((person: LeadPersonActivity) => (
              <TableRow key={person.id}>
                <TableCell className="font-medium">{person.name}</TableCell>
                <TableCell className="text-right tabular-nums">{person.attempted}</TableCell>
                <TableCell className="text-right tabular-nums">{person.connected}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {person.not_connected}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={tableColumnCount}
                className="h-24 text-center text-sm text-muted-foreground"
              >
                No lead calls yet today.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </section>
  );
}
