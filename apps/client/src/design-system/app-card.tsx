import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { PropsWithChildren } from 'react';

import { radii, spacing } from '@/constants/theme';
import { useAppTheme } from '@/design-system/theme-provider';

type AppCardProps = PropsWithChildren<{
  tone?: 'default' | 'muted' | 'accent';
  style?: StyleProp<ViewStyle>;
}>;

export function AppCard({ children, tone = 'default', style }: AppCardProps) {
  const { colors } = useAppTheme();
  const backgroundColor =
    tone === 'muted'
      ? colors.surfaceMuted
      : tone === 'accent'
        ? `${colors.brand}16`
        : colors.surface;
  const borderColor = tone === 'accent' ? `${colors.brand}55` : colors.border;

  return <View style={[styles.card, { backgroundColor, borderColor }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.lg,
    borderCurve: 'continuous',
    gap: spacing.md,
  },
});
