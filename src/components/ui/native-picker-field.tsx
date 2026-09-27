import { Host, Picker } from '@expo/ui';
import { Platform, StyleSheet, View, useColorScheme } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { Spacing } from '@/constants/theme';
import { UNSET, type PickerOption } from '@/lib/profile-options';

export function NativePickerField({
  label,
  hint,
  value,
  options,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  options: PickerOption[];
  onChange: (value: string) => void;
}) {
  const colorScheme = useColorScheme();
  const selectedValue = options.some((option) => option.value === value) ? value : UNSET;

  return (
    <View style={styles.wrap}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <Host matchContents={{ vertical: true }} colorScheme={colorScheme} style={styles.host}>
        <Picker selectedValue={selectedValue} onValueChange={onChange} appearance="wheel">
          {options.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      </Host>
      {hint ? (
        <ThemedText type="small" themeColor="textSecondary">
          {hint}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.one,
  },
  host: {
    width: '100%',
    minHeight: Platform.OS === 'ios' ? 180 : 48,
  },
});
