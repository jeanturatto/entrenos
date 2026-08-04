import type { PropsWithChildren, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  useColorScheme,
} from 'react-native';

import { BrandMark } from '@/components/brand-mark';
import { maxContentWidth, palette, radii, spacing, typography } from '@/constants/theme';

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
  const colors = useColorScheme() === 'dark' ? palette.dark : palette.light;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.pageContent}
    >
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
  const colors = useColorScheme() === 'dark' ? palette.dark : palette.light;

  return (
    <View style={styles.field}>
      <Text selectable style={[styles.label, { color: colors.text }]}>
        {label}
      </Text>
      <TextInput
        {...props}
        accessibilityLabel={props.accessibilityLabel ?? label}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.brand}
        style={[
          styles.input,
          { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
          style,
        ]}
      />
      {hint ? (
        <Text selectable style={[styles.hint, { color: colors.textMuted }]}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

export function PrimaryButton({ label, onPress, pending, disabled }: PrimaryButtonProps) {
  const colors = useColorScheme() === 'dark' ? palette.dark : palette.light;
  const isDisabled = pending || disabled;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ busy: pending, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        { backgroundColor: colors.brandStrong, opacity: isDisabled ? 0.5 : pressed ? 0.84 : 1 },
      ]}
    >
      {pending ? <ActivityIndicator color={colors.onBrand} /> : null}
      <Text style={[styles.primaryButtonText, { color: colors.onBrand }]}>{label}</Text>
    </Pressable>
  );
}

export function InlineNotice({ tone, children }: PropsWithChildren<{ tone: 'error' | 'success' }>) {
  const colors = useColorScheme() === 'dark' ? palette.dark : palette.light;
  const color = tone === 'error' ? colors.error : colors.success;

  return (
    <View style={[styles.notice, { backgroundColor: `${color}16`, borderColor: `${color}55` }]}>
      <Text selectable accessibilityLiveRegion="polite" style={[styles.noticeText, { color }]}>
        {children}
      </Text>
    </View>
  );
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
  field: { gap: spacing.sm },
  label: { fontSize: 14, fontWeight: '700' },
  input: {
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.md,
    borderCurve: 'continuous',
    fontSize: 16,
  },
  hint: { fontSize: 12, lineHeight: 18 },
  primaryButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    borderCurve: 'continuous',
  },
  primaryButtonText: { fontSize: 16, fontWeight: '800' },
  notice: {
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.md,
    borderCurve: 'continuous',
  },
  noticeText: { fontSize: 14, lineHeight: 21, fontWeight: '600' },
  footer: { width: '100%', maxWidth: 560, alignItems: 'center' },
});
