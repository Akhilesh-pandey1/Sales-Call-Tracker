import { readStoredCountry } from '@/features/auth';
import {
  readDoNotTrackNumbers,
  readMyListNumbers,
} from '@/features/tracking';
import { normalizePhoneNumber } from '@/shared/utils/phone-formatter';

export async function pickNextListNumber(): Promise<string | null> {
  const listNumbers = await readMyListNumbers();
  const leftListNumbers = listNumbers.filter(
    (listNumber) => listNumber.status === 'left',
  );
  if (leftListNumbers.length === 0) {
    const noListNumberFound = null;
    return noListNumberFound;
  }
  const countryCode = await readStoredCountry();
  if (countryCode === null) {
    const oldestLeftPhoneNumber = leftListNumbers[0].phoneNumber;
    return oldestLeftPhoneNumber;
  }
  const doNotTrackNumbers = await readDoNotTrackNumbers();
  const doNotTrackNumberSet = new Set(doNotTrackNumbers);
  for (const leftListNumber of leftListNumbers) {
    const candidatePhoneNumber = leftListNumber.phoneNumber;
    const normalizedCandidate = normalizePhoneNumber(
      candidatePhoneNumber,
      countryCode,
    );
    const isDoNotTrackNumber = doNotTrackNumberSet.has(normalizedCandidate);
    if (!isDoNotTrackNumber) {
      const nextListPhoneNumber = candidatePhoneNumber;
      return nextListPhoneNumber;
    }
  }
  const onlyDoNotTrackNumbersLeft = null;
  return onlyDoNotTrackNumbersLeft;
}
