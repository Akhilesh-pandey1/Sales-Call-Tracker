import type { MyListFlag } from '@/features/tracking';

type MyListFlagLabel = {
  title: string;
  emptyHint: string;
};

const myListFlagLabels: Record<MyListFlag, MyListFlagLabel> = {
  interested: {
    title: 'Interested',
    emptyHint: 'Mark a call Interested in My List and the number lands here.',
  },
  'do-not-call': {
    title: 'Do not call',
    emptyHint: 'Mark a call Do not call in My List and the number lands here.',
  },
};

export function getMyListFlagLabel(listFlag: MyListFlag): MyListFlagLabel {
  return myListFlagLabels[listFlag];
}
