import { readStoredCountry } from '@/features/auth';
import { normalizePhoneNumber } from '@/shared/utils/phone-formatter';

export async function readNormalizedPhoneNumberOrNull(
  phoneNumber: string,
): Promise<string | null> {
  const countryCode = await readStoredCountry();
  if (countryCode === null) {
    const noStoredCountry = null;
    return noStoredCountry;
  }
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber, countryCode);
  return normalizedPhoneNumber;
}
