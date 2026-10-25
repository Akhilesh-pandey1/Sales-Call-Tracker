export type MyListBadge = 'Left' | 'Connected' | 'Not connected' | 'Interested' | 'Do not call';

export type MyListNumberItem = {
  id: number;
  phoneNumber: string;
  badge: MyListBadge;
};

export type MyListCounts = {
  leftCount: number;
  calledCount: number;
  interestedCount: number;
  doNotCallCount: number;
};
