import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { radii, spacing, typography } from '@/constants/theme';
import { AppButton, type AppButtonVariant } from '@/design-system/app-button';
import { useAppTheme } from '@/design-system/theme-provider';

export type FeedbackTone = 'empty' | 'loading' | 'error' | 'success' | 'info';

type FeedbackStateProps = {
  tone: FeedbackTone;
  title: string;
  description: string;
  actionLabel?: string;
  actionVariant?: AppButtonVariant;
  onAction?: () => void;
};

const symbols: Record<Exclude<FeedbackTone, 'loading'>, string> = {
  empty: '○',
  error: '!',
  success: '✓',
  info: 'i',
};

export function FeedbackState({
  tone,
  title,
  description,
  actionLabel,
  actionVariant = tone === 'error' ? 'secondary' : 'primary',
  onAction,
}: FeedbackStateProps) {
  const { colors } = useAppTheme();
  const color =
    tone === 'error'
      ? colors.error
      : tone === 'success'
        ? colors.success
        : tone === 'info'
          ? colors.info
          : colors.brand;

  return (
    <View
      accessibilityRole={tone === 'error' ? 'alert' : undefined}
      accessibilityLiveRegion={tone === 'loading' ? 'polite' : 'none'}
      style={[
        styles.container,
        { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
      ]}
    >
      {tone === 'loading' ? (
        <ActivityIndicator color={color} size="large" />
      ) : (
        <View
          aria-hidden
          style={[styles.symbol, { backgroundColor: `${color}18`, borderColor: `${color}55` }]}
        >
          <Text aria-hidden style={[styles.symbolText, { color }]}>
            {symbols[tone]}
          </Text>
        </View>
      )}
      <View style={styles.copy}>
        <Text selectable style={[styles.title, { color: colors.text }]}>
          {title}
        </Text>
        <Text selectable style={[styles.description, { color: colors.textMuted }]}>
          {description}
        </Text>
      </View>
      {actionLabel && onAction && tone !== 'loading' ? (
        <AppButton label={actionLabel} variant={actionVariant} onPress={onAction} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.lg,
    borderCurve: 'continuous',
    gap: spacing.md,
  },
  symbol: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radii.pill,
  },
  symbolText: { fontSize: 24, lineHeight: 28, fontWeight: '800' },
  copy: { maxWidth: 520, alignItems: 'center', gap: spacing.sm },
  title: {
    fontFamily: typography.display,
    fontSize: typography.size.titleSmall,
    lineHeight: typography.lineHeight.titleSmall,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    fontFamily: typography.body,
    fontSize: typography.size.bodySmall,
    lineHeight: typography.lineHeight.bodySmall,
    textAlign: 'center',
  },
});
