import { Platform, Text, type ColorValue } from 'react-native';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';

type Props = {
  color: ColorValue;
  name: SymbolViewProps['name'];
  glyph: string;
};

/**
 * SF/Material symbols on native; simple glyph fallback on web so Expo web
 * does not depend on native symbol rendering.
 */
export function TabIcon({ color, name, glyph }: Props) {
  if (Platform.OS === 'web') {
    const label =
      typeof name === 'string'
        ? name
        : name && typeof name === 'object' && 'web' in name
          ? String(name.web ?? 'icon')
          : 'icon';
    return (
      <Text
        style={{ color: color as string, fontSize: 18, fontWeight: '700' }}
        accessibilityLabel={label}>
        {glyph}
      </Text>
    );
  }

  return <SymbolView name={name} tintColor={color} size={26} />;
}
