import { useId, useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { radii, spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/design-system/theme-provider';

export type AppFieldProps = TextInputProps & {
  label: string;
  hint?: string;
  error?: string;
};

export function AppField({ label, hint, error, style, onFocus, onBlur, ...props }: AppFieldProps) {
  const { colors } = useAppTheme();
  const [focused, setFocused] = useState(false);
  const fieldId = useId();
  const helperId = `${fieldId}-helper`;
  const isDisabled = props.editable === false;

  return (
    <View style={styles.field}>
      <Text nativeID={`${fieldId}-label`} selectable style={[styles.label, { color: colors.text }]}>
        {label}
      </Text>
      <TextInput
        {...props}
        nativeID={fieldId}
        accessibilityLabel={props.accessibilityLabel ?? label}
        accessibilityHint={props.accessibilityHint ?? error ?? hint}
        accessibilityState={{ disabled: isDisabled }}
        aria-describedby={hint || error ? helperId : undefined}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.brand}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[
          styles.input,
          {
            backgroundColor: isDisabled ? colors.surfaceMuted : colors.background,
            borderColor: error ? colors.error : focused ? colors.focus : colors.border,
            color: colors.text,
            opacity: isDisabled ? 0.66 : 1,
          },
          style,
        ]}
      />
      {error || hint ? (
        <Text
          nativeID={helperId}
          selectable
          accessibilityLiveRegion={error ? 'polite' : 'none'}
          style={[styles.hint, { color: error ? colors.error : colors.textMuted }]}
        >
          {error ?? hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.sm },
  label: {
    fontFamily: typography.body,
    fontSize: typography.size.bodySmall,
    lineHeight: typography.lineHeight.bodySmall,
    fontWeight: '700',
  },
  input: {
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderWidth: 2,
    borderRadius: radii.md,
    borderCurve: 'continuous',
    fontFamily: typography.body,
    fontSize: typography.size.body,
  },
  hint: {
    fontFamily: typography.body,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
});
