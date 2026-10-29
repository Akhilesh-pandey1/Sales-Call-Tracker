import { Info } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { Icon } from '@/components/ui/icon';

type NoteInfoButtonProps = {
  displayedPhoneNumber: string;
  onPress: () => void;
};

export function NoteInfoButton({
  displayedPhoneNumber,
  onPress,
}: NoteInfoButtonProps) {
  const notesAccessibilityLabel = `Notes ${displayedPhoneNumber}`;

  return (
    <Pressable
      accessibilityLabel={notesAccessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      className="h-5 w-5 shrink-0 items-center justify-center rounded-md active:bg-muted"
    >
      <Icon as={Info} size={14} className="text-muted-foreground" />
    </Pressable>
  );
}
