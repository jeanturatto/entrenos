import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { radii, spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/design-system/theme-provider';

export type NoticeTone = 'error' | 'success' | 'warning' | 'info';

type InlineNoticeProps = PropsWithChildren<{
  tone: NoticeTone;
  title?: string;
}>;

export function InlineNotice({ tone, title, children }: InlineNoticeProps) {
  const { colors } = useAppTheme();
  const color = colors[tone];

  return (
    <View
      accessibilityRole={tone === 'error' ? 'alert' : undefined}
      style={[styles.notice, { backgroundColor: `${color}16`, borderColor: `${color}55` }]}
    >
      {title ? (
        <Text selectable style={[styles.title, { color }]}>
          {title}
        </Text>
      ) : null}
      <Text selectable accessibilityLiveRegion="polite" style={[styles.text, { color }]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radii.md,
    borderCurve: 'continuous',
    gap: spacing.xs,
  },
  title: {
    fontFamily: typography.body,
    fontSize: typography.size.bodySmall,
    lineHeight: typography.lineHeight.bodySmall,
    fontWeight: '800',
  },
  text: {
    fontFamily: typography.body,
    fontSize: typography.size.bodySmall,
    lineHeight: typography.lineHeight.bodySmall,
    fontWeight: '600',
  },
});
