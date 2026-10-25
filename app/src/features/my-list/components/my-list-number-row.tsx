import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import { formatInternationalPhoneNumber } from '@/shared/utils/phone-formatter';
import type { MyListBadge } from '../types';
import { MyListBadgeTag } from './my-list-badge';

type MyListNumberRowProps = {
  phoneNumber: string;
  badge: MyListBadge;
};

export function MyListNumberRow({ phoneNumber, badge }: MyListNumberRowProps) {
  const formattedPhoneNumber = formatInternationalPhoneNumber(phoneNumber);

  return (
    <View className="flex-row items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
      <Text className="text-sm font-semibold tabular-nums">
        {formattedPhoneNumber}
      </Text>
      <MyListBadgeTag badge={badge} />
    </View>
  );
}
