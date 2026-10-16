export function formatCount(count: number): string {
  const locale: string = "en-US";
  const formattedCount: string = count.toLocaleString(locale);
  return formattedCount;
}
