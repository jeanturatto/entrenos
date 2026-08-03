import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { FeatureCard } from '@/components/feature-card';
import { maxContentWidth, palette, radii, spacing, typography } from '@/constants/theme';

export default function HomeScreen() {
  const colors = useColorScheme() === 'dark' ? palette.dark : palette.light;

  return (
    <View style={[styles.page, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.brandRow}>
            <BrandMark color={colors.brand} />
            <Text style={[styles.wordmark, { color: colors.text }]}>EntreNós</Text>
          </View>

          <View style={styles.hero}>
            <View
              style={[
                styles.eyebrow,
                { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
              ]}
            >
              <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.eyebrowText, { color: colors.textMuted }]}>FUNDAÇÃO 0.1</Text>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>
              A vida a dois, organizada com respeito.
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Um espaço para combinar planos, dividir responsabilidades e preservar o que é pessoal
              — sempre com consentimento claro.
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

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Conhecer os princípios do EntreNós"
            onPress={() => router.push('/principles')}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.brandStrong, opacity: pressed ? 0.86 : 1 },
            ]}
          >
            <Text style={[styles.primaryButtonText, { color: colors.onBrand }]}>
              Conhecer os princípios
            </Text>
            <Text accessible={false} style={[styles.arrow, { color: colors.onBrand }]}>
              →
            </Text>
          </Pressable>

          <Text style={[styles.platforms, { color: colors.textMuted }]}>Android · iOS · Web</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  safeArea: { flex: 1 },
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: maxContentWidth,
    minHeight: '100%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.xl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  wordmark: {
    fontFamily: typography.display,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  hero: {
    paddingTop: spacing.xxl,
    gap: spacing.md,
  },
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
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: radii.pill,
  },
  eyebrowText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.3,
  },
  title: {
    maxWidth: 640,
    fontFamily: typography.display,
    fontSize: 48,
    lineHeight: 54,
    fontWeight: '700',
    letterSpacing: -1.7,
  },
  subtitle: {
    maxWidth: 610,
    fontFamily: typography.body,
    fontSize: 18,
    lineHeight: 29,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  primaryButton: {
    minHeight: 54,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  arrow: {
    fontSize: 22,
    lineHeight: 24,
  },
  platforms: {
    marginTop: 'auto',
    paddingTop: spacing.lg,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.1,
  },
});
