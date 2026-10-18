import { Users } from "lucide-react";

export function TeamEmptyState() {
  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
        <Users className="h-8 w-8 text-muted-foreground" />
        <p className="text-base font-medium">No salespeople yet.</p>
        <p className="text-sm text-muted-foreground">
          Add people in Accounts and they will show up here.
        </p>
      </div>
    </section>
  );
}
