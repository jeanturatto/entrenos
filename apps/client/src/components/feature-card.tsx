import { StyleSheet, Text, View } from 'react-native';

import type { AppPalette } from '@/constants/theme';
import { radii, spacing, typography } from '@/constants/theme';

type FeatureCardProps = {
  symbol: string;
  title: string;
  description: string;
  colors: AppPalette;
};

export function FeatureCard({ symbol, title, description, colors }: FeatureCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.symbol, { color: colors.accent }]}>{symbol}</Text>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: 250,
    flexBasis: 310,
    flexGrow: 1,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  symbol: { fontSize: 12, fontWeight: '800', letterSpacing: 1.2 },
  title: { fontFamily: typography.display, fontSize: 22, fontWeight: '700' },
  description: { fontSize: 15, lineHeight: 23 },
});
