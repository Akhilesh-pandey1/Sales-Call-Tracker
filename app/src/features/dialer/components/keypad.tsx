import { Text } from '@/components/ui/text';
import { Pressable, View } from 'react-native';

const keypadCharacters = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

const keypadGridClasses =
  'mx-auto mt-4 w-full max-w-[14rem] flex-row flex-wrap justify-center gap-x-4 gap-y-2.5';

type KeypadProps = {
  onCharacterPress: (character: string) => void;
};

export function Keypad({ onCharacterPress }: KeypadProps) {
  const keypadKeys = keypadCharacters.map(character => {
    const handleKeypadPress = () => onCharacterPress(character);
    return (
      <Pressable
        key={character}
        accessibilityLabel={`Dial ${character}`}
        accessibilityRole="button"
        onPress={handleKeypadPress}
        className="h-[3.75rem] w-[3.75rem] items-center justify-center rounded-full border border-border bg-card shadow-xs active:bg-muted"
      >
        <Text className="text-2xl font-semibold">{character}</Text>
      </Pressable>
    );
  });

  return (
    <View accessibilityLabel="Keypad" className={keypadGridClasses}>
      {keypadKeys}
    </View>
  );
}
