import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { ReactNode } from 'react';

import { layout, spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/design-system/theme-provider';

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function PageHeader({ eyebrow, title, subtitle, action }: PageHeaderProps) {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const compact = width < layout.compactBreakpoint;

  return (
    <View style={styles.root}>
      <View style={styles.copy}>
        {eyebrow ? (
          <Text selectable style={[styles.eyebrow, { color: colors.brand }]}>
            {eyebrow.toUpperCase()}
          </Text>
        ) : null}
        <Text
          selectable
          style={[styles.title, compact ? styles.compactTitle : null, { color: colors.text }]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text selectable style={[styles.subtitle, { color: colors.textMuted }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  copy: { flexGrow: 1, flexBasis: 320, gap: spacing.xs },
  eyebrow: { fontSize: 11, lineHeight: 17, fontWeight: '900', letterSpacing: 1.2 },
  title: {
    fontFamily: typography.display,
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '800',
    letterSpacing: -1,
  },
  compactTitle: { fontSize: 29, lineHeight: 35 },
  subtitle: { maxWidth: 720, fontSize: 15, lineHeight: 23 },
  action: { alignItems: 'flex-end' },
});
