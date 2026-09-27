import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, variant = 'primary', disabled, style, ...rest }: ButtonProps) {
  const theme = useTheme();
  const background =
    variant === 'primary'
      ? theme.accent
      : variant === 'secondary'
        ? theme.backgroundElement
        : variant === 'danger'
          ? theme.backgroundElement
          : 'transparent';
  const color = variant === 'primary' ? theme.background : variant === 'danger' ? theme.danger : theme.text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: background, opacity: disabled ? 0.45 : pressed ? 0.82 : 1 },
        style,
      ]}
      {...rest}>
      <ThemedText type="smallBold" style={{ color }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: Spacing.four,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
