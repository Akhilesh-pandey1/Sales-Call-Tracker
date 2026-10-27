import {
  findPhoneNumbersInText,
  type CountryCode,
} from 'libphonenumber-js';

export type UploadedNumbers = {
  uniqueE164Numbers: string[];
  notValidCount: number;
};

function lineHasPhoneLikeDigitRun(line: string): boolean {
  const lineSeparatorPattern = /[\s().+/-]/g;
  const digitRunPattern = /\d+/g;
  const minPhoneLikeDigitCount = 7;
  const maxPhoneLikeDigitCount = 15;
  const separatorFreeLine = line.replace(lineSeparatorPattern, '');
  const digitRuns = separatorFreeLine.match(digitRunPattern) ?? [];
  return digitRuns.some(
    (digitRun) =>
      digitRun.length >= minPhoneLikeDigitCount &&
      digitRun.length <= maxPhoneLikeDigitCount,
  );
}

export function extractUploadNumbers(
  rawText: string,
  countryCode: string,
): UploadedNumbers {
  const uniqueE164Numbers = new Set<string>();
  let notValidCount = 0;
  const textPieces = rawText.split(/[\n,]+/);
  for (const textPiece of textPieces) {
    const trimmedPiece = textPiece.trim();
    if (trimmedPiece === '') {
      continue;
    }
    const foundNumbers = findPhoneNumbersInText(trimmedPiece, {
      defaultCountry: countryCode as CountryCode,
    });
    for (const foundNumber of foundNumbers) {
      uniqueE164Numbers.add(foundNumber.number.number);
    }
    const isPieceWithoutAnyNumber = foundNumbers.length === 0;
    if (isPieceWithoutAnyNumber && lineHasPhoneLikeDigitRun(trimmedPiece)) {
      notValidCount += 1;
    }
  }
  const uploadedNumbers: UploadedNumbers = {
    uniqueE164Numbers: Array.from(uniqueE164Numbers),
    notValidCount,
  };
  return uploadedNumbers;
}
