function toTwoDigitText(numberValue: number): string {
  return String(numberValue).padStart(2, '0');
}

export function buildMyListCsvFileName(savedAt: Date): string {
  const monthIndex = savedAt.getMonth();
  const monthNumber = monthIndex + 1;
  const dayText = toTwoDigitText(savedAt.getDate());
  const monthText = toTwoDigitText(monthNumber);
  const yearText = String(savedAt.getFullYear());
  const hourText = toTwoDigitText(savedAt.getHours());
  const minuteText = toTwoDigitText(savedAt.getMinutes());
  const secondText = toTwoDigitText(savedAt.getSeconds());
  const csvFileName =
    `${dayText}-${monthText}-${yearText}` +
    `-${hourText}-${minuteText}-${secondText}.csv`;
  return csvFileName;
}
