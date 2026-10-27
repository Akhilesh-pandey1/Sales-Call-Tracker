import { extractUploadNumbers } from './extract-upload-numbers';

test('pulls every number out of one comma-separated line', () => {
  const commaSeparatedLine =
    '9876501234,9123456780,8765402193,7890123456,9012345678,' +
    '7654321098,8901234567,6789012345,9345678120,8567012349';
  const uploadedNumbers = extractUploadNumbers(commaSeparatedLine, 'IN');
  expect(uploadedNumbers.uniqueE164Numbers).toHaveLength(10);
  expect(uploadedNumbers.uniqueE164Numbers[0]).toBe('+919876501234');
  expect(uploadedNumbers.notValidCount).toBe(0);
});

test('pulls every number out of newline-separated lines', () => {
  const newlineSeparatedText = '9876501234\n9123456780\n8765402193';
  const uploadedNumbers = extractUploadNumbers(newlineSeparatedText, 'IN');
  expect(uploadedNumbers.uniqueE164Numbers).toHaveLength(3);
  expect(uploadedNumbers.notValidCount).toBe(0);
});

test('pulls numbers out of messy text', () => {
  const messyText = 'Call Raj at 9876501234 about the plot.\nSneha - 9123456780';
  const uploadedNumbers = extractUploadNumbers(messyText, 'IN');
  expect(uploadedNumbers.uniqueE164Numbers).toEqual(
    expect.arrayContaining(['+919876501234', '+919123456780']),
  );
  expect(uploadedNumbers.uniqueE164Numbers).toHaveLength(2);
});

test('counts a phone-like but unparseable piece as not valid', () => {
  const textWithInvalidPiece = '9876501234,0000000000';
  const uploadedNumbers = extractUploadNumbers(textWithInvalidPiece, 'IN');
  expect(uploadedNumbers.uniqueE164Numbers).toEqual(['+919876501234']);
  expect(uploadedNumbers.notValidCount).toBe(1);
});

test('keeps a number repeated in the text once', () => {
  const textWithRepeat = '9876501234\n9876501234,9876501234';
  const uploadedNumbers = extractUploadNumbers(textWithRepeat, 'IN');
  expect(uploadedNumbers.uniqueE164Numbers).toEqual(['+919876501234']);
  expect(uploadedNumbers.notValidCount).toBe(0);
});
