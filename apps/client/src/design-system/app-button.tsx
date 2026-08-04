import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type AccessibilityRole,
  type ViewStyle,
} from 'react-native';

import { layout, radii, spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/design-system/theme-provider';

export type AppButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: AppButtonVariant;
  pending?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  accessibilityRole?: AccessibilityRole;
  selected?: boolean;
  accessibilityHint?: string;
  style?: ViewStyle;
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  pending = false,
  disabled = false,
  fullWidth = false,
  accessibilityRole = 'button',
  selected,
  accessibilityHint,
  style,
}: AppButtonProps) {
  const { colors, isDark } = useAppTheme();
  const isDisabled = disabled || pending;
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const backgroundColor = isPrimary
    ? colors.brandStrong
    : isDanger
      ? colors.error
      : variant === 'secondary'
        ? colors.surface
        : 'transparent';
  const foregroundColor = isPrimary
    ? colors.onBrand
    : isDanger
      ? isDark
        ? colors.background
        : '#ffffff'
      : variant === 'ghost'
        ? colors.brand
        : colors.text;
  const borderColor = isPrimary
    ? colors.brandStrong
    : isDanger
      ? colors.error
      : variant === 'secondary'
        ? colors.border
        : 'transparent';

  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ busy: pending, disabled: isDisabled, selected }}
      aria-selected={accessibilityRole === 'tab' ? selected : undefined}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        fullWidth ? styles.fullWidth : null,
        {
          backgroundColor,
          borderColor,
          opacity: isDisabled ? 0.46 : pressed ? 0.78 : 1,
        },
        style,
      ]}
    >
      {pending ? <ActivityIndicator color={foregroundColor} /> : null}
      <Text style={[styles.label, { color: foregroundColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: layout.minTouchTarget,
    minWidth: layout.minTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: 11,
    borderWidth: 1,
    borderRadius: radii.md,
    borderCurve: 'continuous',
  },
  fullWidth: { width: '100%' },
  label: {
    fontFamily: typography.body,
    fontSize: typography.size.bodySmall,
    lineHeight: typography.lineHeight.bodySmall,
    fontWeight: '800',
    textAlign: 'center',
  },
});
