export function getTodaysDateLabel(): string {
  const dateFormatOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
  };
  const dateLabel: string = new Intl.DateTimeFormat("en-US", dateFormatOptions).format(
    new Date()
  );
  return dateLabel;
}
