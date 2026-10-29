import type { LucideIcon } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { Icon } from '@/components/ui/icon';

type RowActionButtonProps = {
  accessibilityLabel: string;
  icon: LucideIcon;
  iconClassName: string;
  onPress?: () => void;
};

export function RowActionButton({
  accessibilityLabel,
  icon,
  iconClassName,
  onPress,
}: RowActionButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      className="h-8 w-8 items-center justify-center rounded-lg border border-border bg-card active:bg-muted"
    >
      <Icon as={icon} size={16} className={iconClassName} />
    </Pressable>
  );
}
