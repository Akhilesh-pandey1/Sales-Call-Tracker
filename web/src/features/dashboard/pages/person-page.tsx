import { useParams } from "react-router-dom";

export function PersonPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Salesperson Stats</h2>
      <p className="text-sm text-muted-foreground">Detailed metrics for salesperson {id}.</p>
    </div>
  );
}
