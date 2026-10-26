import {
  findPhoneNumbersInText,
  type CountryCode,
} from 'libphonenumber-js';

function extractFirstClipboardNumber(
  clipboardText: string,
  countryCode: string | null,
): string | null {
  const searchOptions =
    countryCode === null
      ? undefined
      : { defaultCountry: countryCode as CountryCode };
  const foundNumbers = findPhoneNumbersInText(clipboardText, searchOptions);
  const firstFoundNumber = foundNumbers[0];
  if (firstFoundNumber === undefined) {
    return null;
  }
  const firstE164Number = firstFoundNumber.number.number;
  return firstE164Number;
}

export { extractFirstClipboardNumber };
