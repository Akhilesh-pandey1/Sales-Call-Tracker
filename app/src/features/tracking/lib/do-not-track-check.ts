import { readStoredCountry } from '@/features/auth';
import { normalizePhoneNumber } from '@/shared/utils/phone-formatter';
import { readDoNotTrackNumbers } from '../db';

export async function readIsDoNotTrackNumber(phoneNumber: string): Promise<boolean> {
  const countryCode = await readStoredCountry();
  if (countryCode === null) {
    const isNotListed = false;
    return isNotListed;
  }
  const doNotTrackNumbers = await readDoNotTrackNumbers();
  const doNotTrackNumberSet = new Set(doNotTrackNumbers);
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber, countryCode);
  const isDoNotTrackNumber = doNotTrackNumberSet.has(normalizedPhoneNumber);
  return isDoNotTrackNumber;
}
