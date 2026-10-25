import * as ExcelWriter from 'xlsx';
import type { MyListNumber } from '@/features/tracking';

const csvHeaderRow = [
  'Number',
  'Status',
  'Interested',
  'Do not call',
  'Notes',
  'Called date',
];

const formulaStarterPattern = /^[=+\-@]/;
const formulaGuardTab = '\t';

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

function toCsvCellRows(listNumbers: MyListNumber[]): string[][] {
  const cellRows = listNumbers.map((listNumber) => {
    const cellRow: string[] = [
      toFormulaSafeCellText(listNumber.phoneNumber),
      toStatusText(listNumber.status),
      toFlagText(listNumber.isInterested),
      toFlagText(listNumber.isDoNotCall),
      toFormulaSafeCellText(listNumber.notes ?? ''),
      toFormulaSafeCellText(listNumber.calledAt ?? ''),
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
