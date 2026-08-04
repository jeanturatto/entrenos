import { Pressable, StyleSheet, Text, View } from 'react-native';

import { layout, radii, spacing, typography } from '@/constants/theme';
import { useAppTheme, type ThemePreference } from '@/design-system/theme-provider';

const options: readonly { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Automático' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
];

export function ThemeModeControl() {
  const { colors, preference, setPreference } = useAppTheme();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel="Aparência do aplicativo"
      style={[styles.group, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}
    >
      {options.map((option) => {
        const selected = preference === option.value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityLabel={`Tema ${option.label.toLowerCase()}`}
            accessibilityState={{ selected }}
            aria-checked={selected}
            onPress={() => setPreference(option.value)}
            style={({ pressed }) => [
              styles.option,
              {
                backgroundColor: selected ? colors.surface : 'transparent',
                borderColor: selected ? colors.border : 'transparent',
                opacity: pressed ? 0.72 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: selected ? colors.text : colors.textMuted },
                selected ? styles.selectedLabel : null,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.md,
    borderCurve: 'continuous',
    gap: spacing.xs,
  },
  option: {
    minHeight: layout.minTouchTarget,
    minWidth: 88,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.sm,
  },
  label: {
    fontFamily: typography.body,
    fontSize: typography.size.bodySmall,
    lineHeight: typography.lineHeight.bodySmall,
    fontWeight: '600',
  },
  selectedLabel: { fontWeight: '800' },
});
