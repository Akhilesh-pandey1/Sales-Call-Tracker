export function convertSecondsToMinutes(totalSeconds: number): number {
  const secondsPerMinute: number = 60;
  const totalMinutes: number = Math.round(totalSeconds / secondsPerMinute);
  return totalMinutes;
}

export function formatConnectedPercent(connectedPercent: number | null): string {
  const noDialsLabel: string = "—";
  if (connectedPercent === null) {
    return noDialsLabel;
  }
  const percentLabel: string = `${connectedPercent}%`;
  return percentLabel;
}

export function formatCount(count: number): string {
  const locale: string = "en-US";
  const formattedCount: string = count.toLocaleString(locale);
  return formattedCount;
}
