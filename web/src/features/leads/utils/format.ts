export function formatCount(count: number): string {
  const locale: string = "en-US";
  const formattedCount: string = count.toLocaleString(locale);
  return formattedCount;
}

export function getDayOverDayPercentChange(
  currentValue: number,
  previousValue: number
): number | null {
  const noPreviousDayPercent: number | null = null;
  if (previousValue === 0) {
    return noPreviousDayPercent;
  }
  const percentMultiplier: number = 100;
  const changeFraction: number = (currentValue - previousValue) / previousValue;
  const exactPercent: number = changeFraction * percentMultiplier;
  return exactPercent;
}

export function formatPercentChangeLabel(percentChange: number): string {
  const decimalPlaces: number = 1;
  const positiveSign: string = "+";
  const isPositiveChange: boolean = percentChange > 0;
  const roundedLabel: string = percentChange.toFixed(decimalPlaces);
  const signedLabel: string = isPositiveChange ? `${positiveSign}${roundedLabel}` : roundedLabel;
  const percentLabel: string = `${signedLabel}%`;
  return percentLabel;
}
