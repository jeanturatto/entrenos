import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { BrandMark } from '@/components/brand-mark';
import { layout, radii, spacing, typography, type AppPalette } from '@/constants/theme';
import { AppButton } from '@/design-system/app-button';
import { AppCard } from '@/design-system/app-card';
import { AppField } from '@/design-system/app-field';
import { FeedbackState, type FeedbackTone } from '@/design-system/feedback-state';
import { InlineNotice } from '@/design-system/inline-notice';
import { ScreenShell } from '@/design-system/screen-shell';
import { ThemeModeControl } from '@/design-system/theme-mode-control';
import { useAppTheme } from '@/design-system/theme-provider';

const colorTokens: readonly { key: keyof AppPalette; label: string }[] = [
  { key: 'background', label: 'Fundo' },
  { key: 'surface', label: 'Superfície' },
  { key: 'surfaceMuted', label: 'Superfície suave' },
  { key: 'text', label: 'Texto' },
  { key: 'brand', label: 'Marca' },
  { key: 'accent', label: 'Destaque' },
  { key: 'success', label: 'Sucesso' },
  { key: 'warning', label: 'Atenção' },
  { key: 'error', label: 'Erro' },
  { key: 'info', label: 'Informação' },
];

const feedbackOptions: readonly { value: FeedbackTone; label: string }[] = [
  { value: 'empty', label: 'Vazio' },
  { value: 'loading', label: 'Carregando' },
  { value: 'error', label: 'Erro' },
  { value: 'success', label: 'Sucesso' },
  { value: 'info', label: 'Informação' },
];

const feedbackCopy: Record<FeedbackTone, { title: string; description: string }> = {
  empty: {
    title: 'Nada por aqui ainda',
    description: 'O estado vazio explica o contexto e oferece um próximo passo claro.',
  },
  loading: {
    title: 'Preparando seu espaço',
    description: 'O aplicativo informa que está trabalhando sem bloquear a compreensão da tela.',
  },
  error: {
    title: 'Não foi possível continuar',
    description: 'A mensagem evita culpa, explica o problema e permite tentar novamente.',
  },
  success: {
    title: 'Tudo certo',
    description: 'A confirmação deixa explícito o que acabou de acontecer.',
  },
  info: {
    title: 'Privacidade sob seu controle',
    description: 'Informações importantes aparecem antes da ação, em linguagem direta.',
  },
};

export default function DesignSystemScreen() {
  const { colors, resolvedTheme } = useAppTheme();
  const { width } = useWindowDimensions();
  const [name, setName] = useState('');
  const [feedbackTone, setFeedbackTone] = useState<FeedbackTone>('empty');
  const [notice, setNotice] = useState('Use os controles abaixo para validar cada estado.');
  const compact = width < layout.compactBreakpoint;
  const feedback = feedbackCopy[feedbackTone];

  return (
    <ScreenShell>
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <BrandMark compact />
          <Text selectable style={[styles.wordmark, { color: colors.text }]}>
            EntreNós
          </Text>
        </View>
        <AppButton
          label="Voltar"
          variant="secondary"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        />
      </View>

      <View style={styles.hero}>
        <Text selectable style={[styles.kicker, { color: colors.accent }]}>
          ETAPA 2 · SISTEMA VISUAL
        </Text>
        <Text
          selectable
          style={[styles.display, compact ? styles.compactDisplay : null, { color: colors.text }]}
        >
          Uma linguagem única para cada tela.
        </Text>
        <Text selectable style={[styles.lead, { color: colors.textMuted }]}>
          Este catálogo reúne os elementos que serão reutilizados no celular, tablet e navegador.
          Todos os controles abaixo funcionam e respondem ao tema escolhido.
        </Text>
      </View>

      <Section
        eyebrow="APARÊNCIA"
        title="Tema claro, escuro ou automático"
        description={`Tema exibido agora: ${resolvedTheme === 'dark' ? 'escuro' : 'claro'}.`}
      >
        <ThemeModeControl />
      </Section>

      <Section
        eyebrow="CORES"
        title="Papéis semânticos"
        description="As telas usam a função de cada cor, não valores soltos. Isso mantém contraste e consistência."
      >
        <View style={styles.swatches}>
          {colorTokens.map((token) => (
            <ColorSwatch key={token.key} label={token.label} value={colors[token.key]} />
          ))}
        </View>
      </Section>

      <Section
        eyebrow="TIPOGRAFIA E ESPAÇO"
        title="Hierarquia que respira"
        description="Títulos editoriais orientam; textos de sistema permanecem simples e legíveis."
      >
        <AppCard>
          <Text selectable style={[styles.sampleDisplay, { color: colors.text }]}>
            Vida a dois
          </Text>
          <Text selectable style={[styles.sampleTitle, { color: colors.text }]}>
            Um título de seção
          </Text>
          <Text selectable style={[styles.sampleBody, { color: colors.textMuted }]}>
            Texto corrido com entrelinha confortável para leitura em diferentes tamanhos de tela.
          </Text>
          <View style={styles.tokenRow}>
            {['8', '16', '24', '32', '48'].map((token) => (
              <View
                key={token}
                style={[
                  styles.tokenChip,
                  { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
                ]}
              >
                <Text selectable style={[styles.tokenText, { color: colors.text }]}>
                  {token} px
                </Text>
              </View>
            ))}
          </View>
        </AppCard>
      </Section>

      <Section
        eyebrow="AÇÕES"
        title="Botões e seus estados"
        description="Cada botão tem pelo menos 48 px de altura, rótulo claro e resposta visual ao toque."
      >
        <View style={styles.controlRow}>
          <AppButton label="Primário" onPress={() => setNotice('Ação primária selecionada.')} />
          <AppButton
            label="Secundário"
            variant="secondary"
            onPress={() => setNotice('Ação secundária selecionada.')}
          />
          <AppButton
            label="Discreto"
            variant="ghost"
            onPress={() => setNotice('Ação discreta selecionada.')}
          />
          <AppButton
            label="Destrutivo"
            variant="danger"
            onPress={() => setNotice('Ação destrutiva exige confirmação antes de continuar.')}
          />
          <AppButton label="Indisponível" disabled onPress={() => undefined} />
          <AppButton label="Processando" pending onPress={() => undefined} />
        </View>
        <InlineNotice tone="info">{notice}</InlineNotice>
      </Section>

      <Section
        eyebrow="FORMULÁRIOS"
        title="Campos com orientação e erro explícito"
        description="Rótulos não desaparecem, o foco é visível e mensagens de erro são lidas por tecnologias assistivas."
      >
        <View style={styles.fieldGrid}>
          <AppField
            label="Como quer ser chamado"
            hint="Você pode alterar depois."
            value={name}
            onChangeText={setName}
            placeholder="Seu nome"
            autoCapitalize="words"
          />
          <AppField
            label="Exemplo com erro"
            value="texto incompleto"
            error="Revise este campo antes de continuar."
            editable={false}
          />
        </View>
      </Section>

      <Section
        eyebrow="RETORNO"
        title="Vazio, carregamento, erro e sucesso"
        description="Selecione um estado para inspecionar a mensagem e o próximo passo."
      >
        <View style={styles.controlRow}>
          {feedbackOptions.map((option) => (
            <AppButton
              key={option.value}
              label={option.label}
              variant={feedbackTone === option.value ? 'primary' : 'secondary'}
              onPress={() => setFeedbackTone(option.value)}
            />
          ))}
        </View>
        <FeedbackState
          tone={feedbackTone}
          title={feedback.title}
          description={feedback.description}
          actionLabel={feedbackTone === 'loading' ? undefined : 'Testar próximo passo'}
          onAction={() => setNotice(`Próximo passo do estado “${feedback.title}” acionado.`)}
        />
      </Section>

      <Section
        eyebrow="MODAL"
        title="Decisões sem surpresa"
        description="A camada modal explica impacto e permite sair sem salvar."
      >
        <AppCard tone="accent">
          <Text selectable style={[styles.cardTitle, { color: colors.text }]}>
            Confirmação contextual
          </Text>
          <Text selectable style={[styles.sampleBody, { color: colors.textMuted }]}>
            Abra o exemplo para revisar um fluxo curto, com validação e resultado local.
          </Text>
          <AppButton
            label="Abrir exemplo de modal"
            onPress={() => router.push('/prototype-action?kind=confirmation')}
          />
        </AppCard>
      </Section>

      <AppCard tone="muted">
        <Text selectable style={[styles.cardTitle, { color: colors.text }]}>
          Critérios desta entrega
        </Text>
        <Text selectable style={[styles.sampleBody, { color: colors.textMuted }]}>
          Contraste, leitura por leitor de tela, navegação por teclado, foco visível, alvos de toque
          e adaptação de largura fazem parte da revisão — não são acabamento opcional.
        </Text>
        <AppButton label="Explorar o protótipo" onPress={() => router.push('/prototype')} />
      </AppCard>
    </ScreenShell>
  );
}

type SectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

function Section({ eyebrow, title, description, children }: SectionProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text selectable style={[styles.kicker, { color: colors.accent }]}>
          {eyebrow}
        </Text>
        <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text selectable style={[styles.sectionDescription, { color: colors.textMuted }]}>
          {description}
        </Text>
      </View>
      {children}
    </View>
  );
}

function ColorSwatch({ label, value }: { label: string; value: string }) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.swatch, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.swatchColor, { backgroundColor: value, borderColor: colors.border }]} />
      <View style={styles.swatchCopy}>
        <Text selectable style={[styles.swatchLabel, { color: colors.text }]}>
          {label}
        </Text>
        <Text selectable style={[styles.swatchValue, { color: colors.textMuted }]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  wordmark: { fontFamily: typography.display, fontSize: 20, fontWeight: '700' },
  hero: { maxWidth: layout.maxReadingWidth, gap: spacing.md, paddingVertical: spacing.xl },
  kicker: { fontSize: 12, lineHeight: 18, fontWeight: '800', letterSpacing: 1.35 },
  display: {
    fontFamily: typography.display,
    fontSize: typography.size.display,
    lineHeight: typography.lineHeight.display,
    fontWeight: '700',
    letterSpacing: -1.4,
  },
  compactDisplay: { fontSize: 36, lineHeight: 42, letterSpacing: -1 },
  lead: { fontSize: 18, lineHeight: 29 },
  section: { gap: spacing.lg, paddingVertical: spacing.lg },
  sectionHeader: { maxWidth: layout.maxReadingWidth, gap: spacing.sm },
  sectionTitle: {
    fontFamily: typography.display,
    fontSize: typography.size.title,
    lineHeight: typography.lineHeight.title,
    fontWeight: '700',
  },
  sectionDescription: { fontSize: typography.size.body, lineHeight: typography.lineHeight.body },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  swatch: {
    minWidth: 190,
    flexBasis: 200,
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.md,
    gap: spacing.md,
  },
  swatchColor: {
    width: 48,
    height: 48,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.sm,
  },
  swatchCopy: { flex: 1, gap: spacing.xxs },
  swatchLabel: { fontSize: 14, lineHeight: 20, fontWeight: '700' },
  swatchValue: { fontSize: 12, lineHeight: 18, textTransform: 'uppercase' },
  sampleDisplay: {
    fontFamily: typography.display,
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '700',
  },
  sampleTitle: { fontFamily: typography.display, fontSize: 24, lineHeight: 30, fontWeight: '700' },
  sampleBody: { fontSize: 16, lineHeight: 25 },
  tokenRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tokenChip: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.pill,
  },
  tokenText: { fontSize: 12, fontWeight: '700' },
  controlRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  fieldGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  cardTitle: { fontFamily: typography.display, fontSize: 22, lineHeight: 28, fontWeight: '700' },
});
