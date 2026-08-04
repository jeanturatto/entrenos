import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { BrandMark } from '@/components/brand-mark';
import { FeatureCard } from '@/components/feature-card';
import { InlineNotice } from '@/components/auth-screen';
import { maxContentWidth, palette, radii, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';

export default function HomeScreen() {
  const colors = useColorScheme() === 'dark' ? palette.dark : palette.light;
  const { session, isLoading, linkError, clearLinkError } = useAuth();

  const openPrimaryRoute = () => {
    clearLinkError();
    router.push(session ? '/dashboard' : '/sign-up');
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.brandRow}>
        <BrandMark />
        <Text selectable style={[styles.wordmark, { color: colors.text }]}>
          EntreNós
        </Text>
      </View>

      {linkError ? <InlineNotice tone="error">{linkError}</InlineNotice> : null}

      <View style={styles.hero}>
        <View
          style={[
            styles.eyebrow,
            { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
          ]}
        >
          <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
          <Text selectable style={[styles.eyebrowText, { color: colors.textMuted }]}>
            IDENTIDADE SEGURA
          </Text>
        </View>

        <Text selectable style={[styles.title, { color: colors.text }]}>
          A vida a dois, organizada com respeito.
        </Text>
        <Text selectable style={[styles.subtitle, { color: colors.textMuted }]}>
          Um espaço para combinar planos, dividir responsabilidades e preservar o que é pessoal —
          sempre com consentimento claro.
        </Text>
      </View>

      <View style={styles.features}>
        <FeatureCard
          symbol="01"
          title="Privacidade de verdade"
          description="Você decide o que é pessoal, compartilhado ou aparece apenas como ocupado."
          colors={colors}
        />
        <FeatureCard
          symbol="02"
          title="Decisões sem suposições"
          description="Compromissos conjuntos passam por proposta, resposta e histórico transparente."
          colors={colors}
        />
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={session ? 'Abrir área protegida' : 'Criar conta'}
          disabled={isLoading}
          onPress={openPrimaryRoute}
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: colors.brandStrong, opacity: isLoading ? 0.5 : pressed ? 0.86 : 1 },
          ]}
        >
          <Text style={[styles.primaryButtonText, { color: colors.onBrand }]}>
            {session ? 'Abrir meu espaço' : 'Criar minha conta'}
          </Text>
          <Text accessible={false} style={[styles.arrow, { color: colors.onBrand }]}>
            →
          </Text>
        </Pressable>

        {!session ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Entrar em uma conta existente"
            onPress={() => router.push('/sign-in')}
            style={({ pressed }) => [
              styles.secondaryButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.72 : 1,
              },
            ]}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Já tenho conta</Text>
          </Pressable>
        ) : null}

        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Conhecer os princípios do EntreNós"
          onPress={() => router.push('/principles')}
          style={({ pressed }) => [{ padding: 12, opacity: pressed ? 0.62 : 1 }]}
        >
          <Text style={[styles.textLink, { color: colors.brand }]}>Conhecer os princípios</Text>
        </Pressable>
      </View>

      <Text selectable style={[styles.platforms, { color: colors.textMuted }]}>
        Android · iOS · Web
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
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
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  hero: { paddingTop: spacing.xxl, gap: spacing.md },
  eyebrow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statusDot: { width: 7, height: 7, borderRadius: radii.pill },
  eyebrowText: { fontSize: 11, fontWeight: '700', letterSpacing: 1.3 },
  title: {
    maxWidth: 640,
    fontFamily: typography.display,
    fontSize: 48,
    lineHeight: 54,
    fontWeight: '700',
    letterSpacing: -1.7,
  },
  subtitle: { maxWidth: 610, fontFamily: typography.body, fontSize: 18, lineHeight: 29 },
  features: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  primaryButton: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    borderCurve: 'continuous',
  },
  primaryButtonText: { fontSize: 16, fontWeight: '700' },
  arrow: { fontSize: 22, lineHeight: 24 },
  secondaryButton: {
    minHeight: 54,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.md,
    borderCurve: 'continuous',
  },
  secondaryButtonText: { fontSize: 15, fontWeight: '700' },
  textLink: { fontSize: 14, fontWeight: '700' },
  platforms: {
    marginTop: 'auto',
    paddingTop: spacing.lg,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.1,
  },
});
