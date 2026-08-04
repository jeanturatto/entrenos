import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { InlineNotice } from '@/components/auth-screen';
import { BrandMark } from '@/components/brand-mark';
import { FeatureCard } from '@/components/feature-card';
import { maxContentWidth, radii, spacing, typography } from '@/constants/theme';
import { AppButton } from '@/design-system/app-button';
import { useAppTheme } from '@/design-system/theme-provider';
import { useAuth } from '@/providers/auth-provider';

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
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

        <Text
          selectable
          style={[styles.title, width < 520 ? styles.compactTitle : null, { color: colors.text }]}
        >
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
        />
        <FeatureCard
          symbol="02"
          title="Decisões sem suposições"
          description="Compromissos conjuntos passam por proposta, resposta e histórico transparente."
        />
      </View>

      <View style={styles.actions}>
        <AppButton
          label={session ? 'Abrir meu espaço' : 'Criar minha conta'}
          disabled={isLoading}
          onPress={openPrimaryRoute}
          accessibilityHint="Abre o próximo passo seguro da sua conta"
        />

        {!session ? (
          <AppButton
            label="Já tenho conta"
            variant="secondary"
            onPress={() => router.push('/sign-in')}
          />
        ) : null}

        <AppButton
          label="Explorar protótipo"
          variant="secondary"
          onPress={() => router.push('/prototype')}
        />

        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Conhecer os princípios do EntreNós"
          onPress={() => router.push('/principles')}
          style={({ pressed }) => [{ padding: 12, opacity: pressed ? 0.62 : 1 }]}
        >
          <Text style={[styles.textLink, { color: colors.brand }]}>Conhecer os princípios</Text>
        </Pressable>

        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Conhecer o sistema visual do EntreNós"
          onPress={() => router.push('/design-system')}
          style={({ pressed }) => [{ padding: 12, opacity: pressed ? 0.62 : 1 }]}
        >
          <Text style={[styles.textLink, { color: colors.brand }]}>Ver sistema visual</Text>
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
  compactTitle: { fontSize: 38, lineHeight: 44, letterSpacing: -1.1 },
  subtitle: { maxWidth: 610, fontFamily: typography.body, fontSize: 18, lineHeight: 29 },
  features: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  textLink: { fontSize: 14, fontWeight: '700' },
  platforms: {
    marginTop: 'auto',
    paddingTop: spacing.lg,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.1,
  },
});
