import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';

export function isValidPhoneNumber(phoneNumber: string, countryCode: string): boolean {
  const parsedNumber = parsePhoneNumberFromString(
    phoneNumber,
    countryCode as CountryCode,
  );

  if (!parsedNumber) {
    return false;
  }

  const isNumberValid = parsedNumber.isValid();
  return isNumberValid;
}

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
