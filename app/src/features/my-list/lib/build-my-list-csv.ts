import * as ExcelWriter from 'xlsx';
import type { MyListNumber } from '@/features/tracking';

const csvHeaderRow = [
  'Number',
  'Status',
  'Interested',
  'Do not call',
  'Notes',
  'Called date',
  'Called time',
];

const formulaStarterPattern = /^[=+\-@]/;
const formulaGuardTab = '\t';

const calledDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: '2-digit',
});
const calledTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function toFormulaSafeCellText(cellText: string): string {
  const startsFormulaLike = formulaStarterPattern.test(cellText);
  if (startsFormulaLike) {
    return formulaGuardTab + cellText;
  }
  return cellText;
}

function toFlagText(flag: boolean): string {
  if (flag) {
    return 'Yes';
  }
  return 'No';
}

function toStatusText(status: MyListNumber['status']): string {
  if (status === 'called') {
    return 'Called';
  }
  return 'Left';
}

function toCalledAtCellTexts(calledAt: string | null): [string, string] {
  if (calledAt === null) {
    return ['', ''];
  }
  const callDate = new Date(calledAt);
  if (Number.isNaN(callDate.getTime())) {
    return ['', ''];
  }
  const calledDateText: string = calledDateFormatter.format(callDate);
  const calledTimeText: string = calledTimeFormatter.format(callDate);
  return [calledDateText, calledTimeText];
}

function toCsvCellRows(listNumbers: MyListNumber[]): string[][] {
  const cellRows = listNumbers.map((listNumber) => {
    const [calledDateText, calledTimeText] = toCalledAtCellTexts(
      listNumber.calledAt,
    );
    const cellRow: string[] = [
      toFormulaSafeCellText(listNumber.phoneNumber),
      toStatusText(listNumber.status),
      toFlagText(listNumber.isInterested),
      toFlagText(listNumber.isDoNotCall),
      toFormulaSafeCellText(listNumber.notes ?? ''),
      toFormulaSafeCellText(calledDateText),
      toFormulaSafeCellText(calledTimeText),
    ];
    return cellRow;
  });
  const allCellRows = [csvHeaderRow, ...cellRows];
  return allCellRows;
}

export function buildMyListCsv(listNumbers: MyListNumber[]): string {
  const allCellRows = toCsvCellRows(listNumbers);
  const sheet = ExcelWriter.utils.aoa_to_sheet(allCellRows);
  const csvText = ExcelWriter.utils.sheet_to_csv(sheet);
  return csvText;
}
