import { buildMyListCsvFileName } from './build-my-list-csv-file-name';

test('names the file with the save moment as date and full time', () => {
  const savedAt = new Date(2026, 9, 26, 18, 3, 26);
  const fileName = buildMyListCsvFileName(savedAt);
  expect(fileName).toBe('26-10-2026-18-03-26.csv');
});

test('pads every single-digit part of the save moment', () => {
  const savedAt = new Date(2026, 0, 5, 7, 8, 9);
  const fileName = buildMyListCsvFileName(savedAt);
  expect(fileName).toBe('05-01-2026-07-08-09.csv');
});
