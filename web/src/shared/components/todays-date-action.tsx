import { getTodaysDateLabel } from "@/shared/utils/todays-date";

export function TodaysDateAction() {
  return (
    <span className="text-sm text-muted-foreground">{getTodaysDateLabel()}</span>
  );
}
