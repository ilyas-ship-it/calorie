import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type ViewProps,
} from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export function Screen(props: ViewProps) {
  const scheme = useColorScheme();
  return (
    <View
      {...props}
      style={[
        styles.screen,
        { backgroundColor: Colors[scheme].background },
        props.style,
      ]}
    />
  );
}

export function Card(props: ViewProps) {
  const scheme = useColorScheme();
  return (
    <View
      {...props}
      style={[
        styles.card,
        {
          backgroundColor: Colors[scheme].card,
          borderColor: Colors[scheme].border,
        },
        props.style,
      ]}
    />
  );
}

export function Muted({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  return <Text style={{ color: Colors[scheme].muted, fontSize: 14 }}>{children}</Text>;
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Subtitle({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  return (
    <Text style={[styles.subtitle, { color: Colors[scheme].muted }]}>{children}</Text>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const scheme = useColorScheme();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: Colors[scheme].tint,
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
        },
      ]}>
      <Text style={styles.buttonLabel}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const scheme = useColorScheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryButton,
        {
          borderColor: Colors[scheme].border,
          backgroundColor: Colors[scheme].card,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <Text style={{ color: Colors[scheme].text, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

export function Field(props: TextInputProps & { label: string }) {
  const scheme = useColorScheme();
  const { label, style, ...rest } = props;
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: Colors[scheme].muted }]}>{label}</Text>
      <TextInput
        placeholderTextColor={Colors[scheme].muted}
        {...rest}
        style={[
          styles.input,
          {
            color: Colors[scheme].text,
            borderColor: Colors[scheme].border,
            backgroundColor: Colors[scheme].card,
          },
          style,
        ]}
      />
    </View>
  );
}

export function FlagChip({
  message,
  severity,
}: {
  message: string;
  severity: 'info' | 'warning' | 'critical';
}) {
  const scheme = useColorScheme();
  const color =
    severity === 'critical'
      ? Colors[scheme].danger
      : severity === 'warning'
        ? Colors[scheme].warning
        : Colors[scheme].tint;
  return (
    <View style={[styles.chip, { borderColor: color }]}>
      <Text style={{ color, fontSize: 13 }}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
  },
  button: {
    minHeight: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 44,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
});
