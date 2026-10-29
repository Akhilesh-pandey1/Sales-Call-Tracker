import { MessageCircle, Phone } from 'lucide-react-native';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import type { MyListNumber } from '@/features/tracking';
import { RowActionButton } from '@/shared/components/row-action-button';
import { formatCalledAtLabel } from '@/shared/utils/format-called-at';
import { formatInternationalPhoneNumber } from '@/shared/utils/phone-formatter';

type MyListNumberRowProps = {
  listNumber: MyListNumber;
};

export function MyListNumberRow({ listNumber }: MyListNumberRowProps) {
  const displayedPhoneNumber = formatInternationalPhoneNumber(
    listNumber.phoneNumber,
  );
  const calledAtLabel = listNumber.calledAt === null
    ? null
    : formatCalledAtLabel(listNumber.calledAt);

  return (
    <View className="mt-2 flex-row items-center gap-3 rounded-xl border border-border bg-card px-4 py-2 shadow-sm">
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-bold tabular-nums">
          {displayedPhoneNumber}
        </Text>
        {calledAtLabel === null ? null : (
          <Text className="mt-0.5 text-[11px] text-muted-foreground">
            {`Called ${calledAtLabel}`}
          </Text>
        )}
      </View>
      <View className="shrink-0 flex-row items-center gap-1">
        <RowActionButton
          accessibilityLabel={`Call ${displayedPhoneNumber}`}
          icon={Phone}
          iconClassName="text-primary"
        />
        <RowActionButton
          accessibilityLabel={`WhatsApp ${displayedPhoneNumber}`}
          icon={MessageCircle}
          iconClassName="text-accent"
        />
      </View>
    </View>
  );
}
