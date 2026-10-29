const calledDayMonthFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
});
const calledTimeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

export function formatCalledAtLabel(callAt: string): string {
  const callDate = new Date(callAt);
  if (Number.isNaN(callDate.getTime())) {
    return callAt;
  }
  const dayMonthLabel: string = calledDayMonthFormatter.format(callDate);
  const timeLabel: string = calledTimeFormatter.format(callDate);
  const calledAtLabel = `${dayMonthLabel} · ${timeLabel}`;
  return calledAtLabel;
}
