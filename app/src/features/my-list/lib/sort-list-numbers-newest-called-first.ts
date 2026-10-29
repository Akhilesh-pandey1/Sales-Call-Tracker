import type { MyListNumber } from '@/features/tracking';

function compareByCalledAtNewestFirst(
  firstListNumber: MyListNumber,
  secondListNumber: MyListNumber,
): number {
  if (
    firstListNumber.calledAt === null &&
    secondListNumber.calledAt === null
  ) {
    return 0;
  }
  if (firstListNumber.calledAt === null) {
    return 1;
  }
  if (secondListNumber.calledAt === null) {
    return -1;
  }
  return secondListNumber.calledAt.localeCompare(firstListNumber.calledAt);
}

export function sortListNumbersNewestCalledFirst<
  ListNumber extends MyListNumber,
>(listNumbers: ListNumber[]): ListNumber[] {
  const sortedListNumbers = [...listNumbers].sort(
    compareByCalledAtNewestFirst,
  );
  return sortedListNumbers;
}
