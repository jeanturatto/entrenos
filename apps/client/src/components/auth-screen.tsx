import type { PropsWithChildren, ReactNode } from 'react';
import Head from 'expo-router/head';
import { ScrollView, StyleSheet, Text, type TextInputProps, View } from 'react-native';

import { BrandMark } from '@/components/brand-mark';
import { maxContentWidth, radii, spacing, typography } from '@/constants/theme';
import { AppButton } from '@/design-system/app-button';
import { AppField } from '@/design-system/app-field';
import { InlineNotice as Notice } from '@/design-system/inline-notice';
import { useAppTheme } from '@/design-system/theme-provider';

type AuthScreenProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
  footer?: ReactNode;
}>;

type FormFieldProps = TextInputProps & {
  label: string;
  hint?: string;
};

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  pending?: boolean;
  disabled?: boolean;
};

export function AuthScreen({ eyebrow, title, description, footer, children }: AuthScreenProps) {
  const { colors } = useAppTheme();

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.pageContent}
    >
      <Head>
        <title>{`${title} · EntreNós`}</title>
        <meta name="description" content={description} />
      </Head>

      <View style={styles.brandRow}>
        <BrandMark compact />
        <Text selectable style={[styles.wordmark, { color: colors.text }]}>
          EntreNós
        </Text>
      </View>

      <View style={styles.intro}>
        <Text selectable style={[styles.eyebrow, { color: colors.accent }]}>
          {eyebrow}
        </Text>
        <Text selectable style={[styles.title, { color: colors.text }]}>
          {title}
        </Text>
        <Text selectable style={[styles.description, { color: colors.textMuted }]}>
          {description}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {children}
      </View>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </ScrollView>
  );
}

export function FormField({ label, hint, style, ...props }: FormFieldProps) {
  return <AppField {...props} label={label} hint={hint} style={style} />;
}

export function PrimaryButton({ label, onPress, pending, disabled }: PrimaryButtonProps) {
  return (
    <AppButton label={label} onPress={onPress} pending={pending} disabled={disabled} fullWidth />
  );
}

export function InlineNotice({ tone, children }: PropsWithChildren<{ tone: 'error' | 'success' }>) {
  return <Notice tone={tone}>{children}</Notice>;
}

export const authFormStyles = StyleSheet.create({
  form: { gap: spacing.md },
  actions: { gap: spacing.sm, paddingTop: spacing.sm },
  linkRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.xs },
  linkText: { fontSize: 14, fontWeight: '700' },
  supportingText: { fontSize: 14, lineHeight: 21 },
});

const styles = StyleSheet.create({
  pageContent: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: maxContentWidth,
    minHeight: '100%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.xl,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  wordmark: {
    fontFamily: typography.display,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  intro: { maxWidth: 560, gap: spacing.sm, paddingTop: spacing.lg },
  eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 1.4 },
  title: {
    fontFamily: typography.display,
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '700',
    letterSpacing: -1.1,
  },
  description: { fontSize: 16, lineHeight: 25 },
  card: {
    width: '100%',
    maxWidth: 560,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.lg,
    borderCurve: 'continuous',
    gap: spacing.md,
    boxShadow: '0 12px 30px rgba(36, 33, 38, 0.08)',
  },
  footer: { width: '100%', maxWidth: 560, alignItems: 'center' },
});
