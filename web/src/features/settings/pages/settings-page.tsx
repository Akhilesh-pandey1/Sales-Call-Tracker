import { PageHeader } from "@/shared/components/page-header";
import { TodaysDateAction } from "@/shared/components/todays-date-action";
import { OfficeHoursEditor } from "../components/office-hours-editor";

export function SettingsPage() {
  return (
    <PageHeader title="Settings" action={<TodaysDateAction />}>
      <OfficeHoursEditor />
    </PageHeader>
  );
}
