import {
  findPhoneNumbersInText,
  type CountryCode,
} from 'libphonenumber-js';

function extractFirstClipboardNumber(
  clipboardText: string,
  countryCode: CountryCode | null,
): string | null {
  const maxClipboardSearchLength = 2000;
  const searchableClipboardText = clipboardText.slice(
    0,
    maxClipboardSearchLength,
  );
  const searchOptions =
    countryCode === null
      ? undefined
      : { defaultCountry: countryCode };
  const foundNumbers = findPhoneNumbersInText(
    searchableClipboardText,
    searchOptions,
  );
  const firstFoundNumber = foundNumbers[0];
  if (firstFoundNumber === undefined) {
    return null;
  }
  const firstE164Number = firstFoundNumber.number.number;
  return firstE164Number;
}

export { extractFirstClipboardNumber };
