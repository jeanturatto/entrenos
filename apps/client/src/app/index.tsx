import { router } from 'expo-router';
import Head from 'expo-router/head';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { InlineNotice } from '@/components/auth-screen';
import { BrandMark } from '@/components/brand-mark';
import { FeatureCard } from '@/components/feature-card';
import { layout, radii, spacing, typography } from '@/constants/theme';
import { AppButton } from '@/design-system/app-button';
import { AppCard } from '@/design-system/app-card';
import { ThemeModeControl } from '@/design-system/theme-mode-control';
import { useAppTheme } from '@/design-system/theme-provider';
import { useAuth } from '@/providers/auth-provider';

const principles = [
  'Sua conta é individual e continua sendo sua.',
  'Compartilhar exige uma escolha clara e reversível.',
  'As duas pessoas têm os mesmos direitos básicos.',
] as const;

const firstSteps = [
  {
    number: '01',
    title: 'Crie sua identidade',
    description: 'Comece com nome, e-mail e uma senha forte. A conta pertence somente a você.',
  },
  {
    number: '02',
    title: 'Conheça as regras',
    description: 'Antes de compartilhar, entenda o que ficará visível e como desfazer a escolha.',
  },
  {
    number: '03',
    title: 'Construa o espaço juntos',
    description:
      'Depois do convite, vocês já podem usar agenda, tarefas e compras no mesmo espaço.',
  },
] as const;

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const { session, isLoading, linkError, clearLinkError } = useAuth();
  const compact = width < layout.compactBreakpoint;
  const wide = width >= layout.wideBreakpoint;

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
      <Head>
        <title>EntreNós — a vida a dois, organizada com respeito</title>
        <meta
          name="description"
          content="Um espaço privado para casais combinarem planos e responsabilidades com consentimento, igualdade e transparência."
        />
        <meta name="theme-color" content={colors.background} />
        <meta property="og:title" content="EntreNós" />
        <meta
          property="og:description"
          content="Organização da vida a dois sem abrir mão da individualidade."
        />
      </Head>

      <View style={styles.header}>
        <View style={styles.brandRow}>
          <BrandMark />
          <Text selectable style={[styles.wordmark, { color: colors.text }]}>
            EntreNós
          </Text>
        </View>

        <View style={styles.headerActions}>
          <AppButton
            label="Princípios"
            variant="ghost"
            onPress={() => router.push('/principles')}
          />
          {!session ? (
            <AppButton label="Entrar" variant="secondary" onPress={() => router.push('/sign-in')} />
          ) : null}
          <AppButton
            label={session ? 'Abrir meu espaço' : 'Começar'}
            disabled={isLoading}
            onPress={openPrimaryRoute}
          />
        </View>
      </View>

      {linkError ? <InlineNotice tone="error">{linkError}</InlineNotice> : null}

      <View style={[styles.hero, wide ? styles.heroWide : null]}>
        <View style={styles.heroCopy}>
          <View
            style={[
              styles.badge,
              { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
            ]}
          >
            <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
            <Text selectable style={[styles.badgeText, { color: colors.textMuted }]}>
              ACESSO ANTECIPADO DISPONÍVEL
            </Text>
          </View>

          <Text
            selectable
            style={[styles.title, compact ? styles.compactTitle : null, { color: colors.text }]}
          >
            A vida a dois, organizada com respeito.
          </Text>
          <Text selectable style={[styles.subtitle, { color: colors.textMuted }]}>
            Um espaço para combinar planos e responsabilidades sem transformar intimidade em
            vigilância. Cada pessoa mantém sua identidade, seus limites e sua voz.
          </Text>

          <View style={styles.heroActions}>
            <AppButton
              label={session ? 'Continuar no meu espaço' : 'Criar minha conta'}
              disabled={isLoading}
              fullWidth={compact}
              onPress={openPrimaryRoute}
              accessibilityHint="Abre o próximo passo seguro da sua conta"
            />
            {!session ? (
              <AppButton
                label="Já tenho uma conta"
                variant="secondary"
                fullWidth={compact}
                onPress={() => router.push('/sign-in')}
              />
            ) : null}
          </View>

          <Text selectable style={[styles.supportingCopy, { color: colors.textMuted }]}>
            Comece pela sua conta individual. Nenhum vínculo é criado sem o aceite das duas pessoas.
          </Text>
        </View>

        <AppCard tone="accent" style={styles.previewCard}>
          <Text selectable style={[styles.cardKicker, { color: colors.brand }]}>
            SEU ESPAÇO COMEÇA POR VOCÊ
          </Text>
          <Text selectable style={[styles.previewTitle, { color: colors.text }]}>
            Privacidade por padrão.
          </Text>
          <Text selectable style={[styles.previewBody, { color: colors.textMuted }]}>
            A experiência foi desenhada para explicar cada escolha antes que qualquer informação
            seja compartilhada.
          </Text>

          <View style={styles.principleList}>
            {principles.map((principle, index) => (
              <View key={principle} style={styles.principleRow}>
                <View style={[styles.principleNumber, { backgroundColor: colors.brandStrong }]}>
                  <Text
                    accessible={false}
                    style={[styles.principleNumberText, { color: colors.onBrand }]}
                  >
                    {index + 1}
                  </Text>
                </View>
                <Text selectable style={[styles.principleText, { color: colors.text }]}>
                  {principle}
                </Text>
              </View>
            ))}
          </View>
        </AppCard>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text selectable style={[styles.eyebrow, { color: colors.accent }]}>
            PENSADO PARA DUAS PESSOAS INTEIRAS
          </Text>
          <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>
            Organização sem perder a individualidade.
          </Text>
          <Text selectable style={[styles.sectionDescription, { color: colors.textMuted }]}>
            O EntreNós nasce de quatro compromissos: privacidade, consentimento, igualdade e
            transparência.
          </Text>
        </View>

        <View style={styles.features}>
          <FeatureCard
            symbol="01 · PRIVACIDADE"
            title="O pessoal continua pessoal"
            description="Você decide o que pode ser compartilhado e o que aparece apenas como indisponível."
          />
          <FeatureCard
            symbol="02 · CONSENTIMENTO"
            title="Decisões sem suposições"
            description="Propostas conjuntas precisam de resposta clara antes de virarem compromisso."
          />
          <FeatureCard
            symbol="03 · IGUALDADE"
            title="Sem conta principal"
            description="Nenhuma pessoa ganha controle permanente sobre a conta ou os dados da outra."
          />
        </View>
      </View>

      <AppCard
        tone="muted"
        style={[styles.principlesCard, wide ? styles.principlesCardWide : null]}
      >
        <View style={styles.principlesCopy}>
          <Text selectable style={[styles.eyebrow, { color: colors.accent }]}>
            UM ACORDO ANTES DA TECNOLOGIA
          </Text>
          <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>
            Segurança também é compreender o que acontece.
          </Text>
          <Text selectable style={[styles.sectionDescription, { color: colors.textMuted }]}>
            Linguagem simples, histórico de mudanças e permissões visíveis fazem parte do produto —
            não são letras pequenas.
          </Text>
        </View>
        <AppButton
          label="Conhecer nossos princípios"
          variant="secondary"
          onPress={() => router.push('/principles')}
        />
      </AppCard>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text selectable style={[styles.eyebrow, { color: colors.accent }]}>
            COMEÇO TRANQUILO
          </Text>
          <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>
            Três passos, sem atalhos escondidos.
          </Text>
        </View>

        <View style={styles.steps}>
          {firstSteps.map((step) => (
            <AppCard key={step.number} style={styles.stepCard}>
              <Text selectable style={[styles.stepNumber, { color: colors.accent }]}>
                {step.number}
              </Text>
              <Text selectable style={[styles.stepTitle, { color: colors.text }]}>
                {step.title}
              </Text>
              <Text selectable style={[styles.stepDescription, { color: colors.textMuted }]}>
                {step.description}
              </Text>
            </AppCard>
          ))}
        </View>
      </View>

      <AppCard tone="accent" style={styles.finalCta}>
        <View style={styles.finalCopy}>
          <Text selectable style={[styles.eyebrow, { color: colors.brand }]}>
            PRONTO PARA COMEÇAR?
          </Text>
          <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>
            Crie um espaço que respeita vocês dois.
          </Text>
          <Text selectable style={[styles.sectionDescription, { color: colors.textMuted }]}>
            Crie sua conta gratuitamente e comece a organizar uma rotina real a dois.
          </Text>
        </View>
        <AppButton
          label={session ? 'Abrir meu espaço' : 'Criar minha conta'}
          disabled={isLoading}
          onPress={openPrimaryRoute}
        />
      </AppCard>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={styles.footerBrand}>
          <View style={styles.brandRow}>
            <BrandMark compact />
            <Text selectable style={[styles.footerWordmark, { color: colors.text }]}>
              EntreNós
            </Text>
          </View>
          <Text selectable style={[styles.footerCopy, { color: colors.textMuted }]}>
            Feito para cuidar do vínculo e de cada pessoa.
          </Text>
        </View>
        <View style={styles.footerTheme}>
          <Text selectable style={[styles.themeLabel, { color: colors.textMuted }]}>
            APARÊNCIA
          </Text>
          <ThemeModeControl />
        </View>
        <Text selectable style={[styles.copyright, { color: colors.textMuted }]}>
          © 2026 EntreNós · Android · iOS · Web
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: layout.maxContentWidth,
    minHeight: '100%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  wordmark: {
    fontFamily: typography.display,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  hero: { gap: spacing.xl, paddingVertical: spacing.xl },
  heroWide: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxl },
  heroCopy: { minWidth: 0, flex: 1, flexBasis: 520, gap: spacing.lg },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.pill,
  },
  statusDot: { width: 7, height: 7, borderRadius: radii.pill },
  badgeText: { fontSize: 11, lineHeight: 16, fontWeight: '800', letterSpacing: 1.1 },
  title: {
    maxWidth: 680,
    fontFamily: typography.display,
    fontSize: 56,
    lineHeight: 61,
    fontWeight: '700',
    letterSpacing: -2,
  },
  compactTitle: { fontSize: 40, lineHeight: 46, letterSpacing: -1.2 },
  subtitle: { maxWidth: 650, fontSize: 19, lineHeight: 30 },
  heroActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  supportingCopy: { maxWidth: 620, fontSize: 13, lineHeight: 20 },
  previewCard: { minWidth: 280, flex: 1, flexBasis: 380, padding: spacing.xl },
  cardKicker: { fontSize: 11, lineHeight: 17, fontWeight: '800', letterSpacing: 1.15 },
  previewTitle: { fontFamily: typography.display, fontSize: 32, lineHeight: 38, fontWeight: '700' },
  previewBody: { fontSize: 15, lineHeight: 24 },
  principleList: { gap: spacing.md, paddingTop: spacing.sm },
  principleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  principleNumber: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
  principleNumberText: { fontSize: 12, fontWeight: '800' },
  principleText: { minWidth: 0, flex: 1, fontSize: 14, lineHeight: 21, fontWeight: '700' },
  section: { gap: spacing.xl },
  sectionHeader: { maxWidth: layout.maxReadingWidth, gap: spacing.sm },
  eyebrow: { fontSize: 12, lineHeight: 18, fontWeight: '800', letterSpacing: 1.3 },
  sectionTitle: {
    fontFamily: typography.display,
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  sectionDescription: { fontSize: 16, lineHeight: 25 },
  features: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  principlesCard: { alignItems: 'flex-start', padding: spacing.xl },
  principlesCardWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  principlesCopy: { minWidth: 0, flex: 1, maxWidth: layout.maxReadingWidth, gap: spacing.sm },
  steps: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  stepCard: { minWidth: 250, flexBasis: 300, flexGrow: 1 },
  stepNumber: { fontSize: 12, lineHeight: 18, fontWeight: '800', letterSpacing: 1.1 },
  stepTitle: { fontFamily: typography.display, fontSize: 22, lineHeight: 28, fontWeight: '700' },
  stepDescription: { fontSize: 15, lineHeight: 23 },
  finalCta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.xl,
    gap: spacing.xl,
  },
  finalCopy: { minWidth: 260, flex: 1, maxWidth: 680, gap: spacing.sm },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.xl,
  },
  footerBrand: { gap: spacing.sm },
  footerWordmark: { fontFamily: typography.display, fontSize: 20, fontWeight: '700' },
  footerCopy: { fontSize: 13, lineHeight: 20 },
  footerTheme: { gap: spacing.sm },
  themeLabel: { fontSize: 10, lineHeight: 15, fontWeight: '800', letterSpacing: 1.2 },
  copyright: { width: '100%', fontSize: 12, lineHeight: 18 },
});
