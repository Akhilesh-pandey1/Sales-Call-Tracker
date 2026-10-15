import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';

export function normalizePhoneNumber(phoneNumber: string, countryCode: string): string {
  const parsedNumber = parsePhoneNumberFromString(
    phoneNumber,
    countryCode as CountryCode,
  );

  if (!parsedNumber) {
    const rawDigits = phoneNumber.replace(/\D/g, '');
    return rawDigits;
  }

  const e164Number = parsedNumber.number;
  return e164Number;
}
