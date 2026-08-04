import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { BrandMark } from '@/components/brand-mark';
import { layout, radii, spacing, typography } from '@/constants/theme';
import { AppButton } from '@/design-system/app-button';
import { AppCard } from '@/design-system/app-card';
import { FeedbackState } from '@/design-system/feedback-state';
import { InlineNotice } from '@/design-system/inline-notice';
import { ScreenShell } from '@/design-system/screen-shell';
import { useAppTheme } from '@/design-system/theme-provider';

type PrototypeArea = 'inicio' | 'calendario' | 'organizacao' | 'nos';

const areas: readonly { value: PrototypeArea; label: string; shortLabel: string }[] = [
  { value: 'inicio', label: 'Visão geral', shortLabel: 'Início' },
  { value: 'calendario', label: 'Calendário compartilhado', shortLabel: 'Calendário' },
  { value: 'organizacao', label: 'Organização da casa', shortLabel: 'Organização' },
  { value: 'nos', label: 'Espaço do casal', shortLabel: 'Nós' },
];

export default function PrototypeScreen() {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ area?: string }>();
  const area = areas.some((item) => item.value === params.area)
    ? (params.area as PrototypeArea)
    : 'inicio';
  const compact = width < layout.compactBreakpoint;

  const selectArea = (nextArea: PrototypeArea) => {
    router.setParams({ area: nextArea });
  };

  const openAction = (kind: string) => {
    router.push(`/prototype-action?kind=${kind}`);
  };

  return (
    <ScreenShell>
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <BrandMark compact />
          <Text selectable style={[styles.wordmark, { color: colors.text }]}>
            EntreNós
          </Text>
        </View>
        <View style={styles.topActions}>
          <AppButton
            label="Sistema visual"
            variant="ghost"
            onPress={() => router.push('/design-system')}
          />
          <AppButton
            label="Sair do protótipo"
            variant="secondary"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          />
        </View>
      </View>

      <View style={styles.hero}>
        <Text selectable style={[styles.kicker, { color: colors.accent }]}>
          ETAPA 2 · PROTÓTIPO NAVEGÁVEL
        </Text>
        <Text
          selectable
          style={[styles.display, compact ? styles.compactDisplay : null, { color: colors.text }]}
        >
          Experimente a estrutura antes das funcionalidades completas.
        </Text>
        <Text selectable style={[styles.lead, { color: colors.textMuted }]}>
          Este fluxo valida organização, linguagem, responsividade e consentimento. Os dados ainda
          não são gravados no banco nesta etapa.
        </Text>
      </View>

      <InlineNotice tone="info" title="Ambiente seguro de validação">
        Você pode navegar e concluir os exemplos. O resultado fica somente nesta tela e desaparece
        ao sair.
      </InlineNotice>

      <View
        accessibilityRole="tablist"
        accessibilityLabel="Áreas do protótipo"
        style={[
          styles.navigation,
          { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
        ]}
      >
        {areas.map((item) => {
          const selected = area === item.value;

          return (
            <AppButton
              key={item.value}
              label={compact ? item.shortLabel : item.label}
              variant={selected ? 'primary' : 'ghost'}
              accessibilityRole="tab"
              selected={selected}
              onPress={() => selectArea(item.value)}
              style={styles.navigationButton}
            />
          );
        })}
      </View>

      <View accessibilityLiveRegion="polite" style={styles.areaContent}>
        {area === 'inicio' ? <HomeArea onAction={openAction} /> : null}
        {area === 'calendario' ? <CalendarArea onAction={openAction} /> : null}
        {area === 'organizacao' ? <OrganizationArea onAction={openAction} /> : null}
        {area === 'nos' ? <CoupleArea onAction={openAction} /> : null}
      </View>
    </ScreenShell>
  );
}

function AreaHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.areaHeader}>
      <Text selectable style={[styles.kicker, { color: colors.accent }]}>
        {eyebrow}
      </Text>
      <Text selectable style={[styles.areaTitle, { color: colors.text }]}>
        {title}
      </Text>
      <Text selectable style={[styles.areaDescription, { color: colors.textMuted }]}>
        {description}
      </Text>
    </View>
  );
}

function HomeArea({ onAction }: { onAction: (kind: string) => void }) {
  const { colors } = useAppTheme();

  return (
    <>
      <AreaHeader
        eyebrow="VISÃO GERAL"
        title="O que importa, sem ruído."
        description="A página inicial resume compromissos conjuntos e preserva o conteúdo pessoal de cada pessoa."
      />
      <View style={styles.grid}>
        <AppCard tone="accent" style={styles.wideCard}>
          <Text selectable style={[styles.cardKicker, { color: colors.brand }]}>
            PRÓXIMO PASSO
          </Text>
          <Text selectable style={[styles.cardTitle, { color: colors.text }]}>
            Criar um combinado
          </Text>
          <Text selectable style={[styles.cardBody, { color: colors.textMuted }]}>
            Uma proposta só vira compromisso compartilhado depois da resposta da outra pessoa.
          </Text>
          <AppButton label="Simular nova proposta" onPress={() => onAction('proposal')} />
        </AppCard>
        <AppCard style={styles.gridCard}>
          <Text selectable style={[styles.cardKicker, { color: colors.success }]}>
            PRIVACIDADE
          </Text>
          <Text selectable style={[styles.cardTitle, { color: colors.text }]}>
            Você escolhe o que aparece
          </Text>
          <Text selectable style={[styles.cardBody, { color: colors.textMuted }]}>
            Pessoal, compartilhado ou apenas ocupado: cada item nasce com uma regra visível.
          </Text>
        </AppCard>
      </View>
      <FeedbackState
        tone="empty"
        title="Nenhum combinado para hoje"
        description="Quando uma proposta for aceita, ela aparecerá aqui com responsável e horário."
        actionLabel="Criar proposta"
        onAction={() => onAction('proposal')}
      />
    </>
  );
}

function CalendarArea({ onAction }: { onAction: (kind: string) => void }) {
  const { colors } = useAppTheme();

  return (
    <>
      <AreaHeader
        eyebrow="CALENDÁRIO"
        title="Disponibilidade sem vigilância."
        description="Eventos pessoais podem aparecer apenas como ocupados. Detalhes compartilhados exigem uma escolha explícita."
      />
      <FeedbackState
        tone="empty"
        title="O calendário conjunto está livre"
        description="Crie uma proposta de compromisso para validar o fluxo de consentimento."
        actionLabel="Propor compromisso"
        onAction={() => onAction('calendar')}
      />
      <AppCard tone="muted">
        <Text selectable style={[styles.cardTitle, { color: colors.text }]}>
          Como um compromisso nasce
        </Text>
        <Text selectable style={[styles.cardBody, { color: colors.textMuted }]}>
          Proposta → resposta → confirmação → histórico. Uma recusa não revela informações além do
          necessário e nenhuma etapa acontece silenciosamente.
        </Text>
      </AppCard>
    </>
  );
}

function OrganizationArea({ onAction }: { onAction: (kind: string) => void }) {
  const { colors } = useAppTheme();
  const cards = [
    {
      kicker: 'TAREFAS',
      title: 'Responsabilidade visível',
      body: 'Cada tarefa mostra responsável, prazo e alterações sem criar competição entre o casal.',
      kind: 'task',
      action: 'Simular tarefa',
    },
    {
      kicker: 'LISTAS',
      title: 'Compras sem duplicidade',
      body: 'Itens conjuntos ficam sincronizados; anotações pessoais continuam privadas.',
      kind: 'list',
      action: 'Simular item',
    },
    {
      kicker: 'FINANÇAS',
      title: 'Compartilhar por escolha',
      body: 'O que é pessoal não se torna visível apenas por existir no mesmo aplicativo.',
      kind: 'expense',
      action: 'Simular gasto',
    },
  ] as const;

  return (
    <>
      <AreaHeader
        eyebrow="ORGANIZAÇÃO"
        title="Dividir tarefas, não a autonomia."
        description="A organização conjunta deixa responsáveis claros sem transformar o aplicativo em instrumento de cobrança."
      />
      <View style={styles.grid}>
        {cards.map((card) => (
          <AppCard key={card.kind} style={styles.gridCard}>
            <Text selectable style={[styles.cardKicker, { color: colors.accent }]}>
              {card.kicker}
            </Text>
            <Text selectable style={[styles.cardTitle, { color: colors.text }]}>
              {card.title}
            </Text>
            <Text selectable style={[styles.cardBody, { color: colors.textMuted }]}>
              {card.body}
            </Text>
            <AppButton
              label={card.action}
              variant="secondary"
              onPress={() => onAction(card.kind)}
            />
          </AppCard>
        ))}
      </View>
    </>
  );
}

function CoupleArea({ onAction }: { onAction: (kind: string) => void }) {
  const { colors } = useAppTheme();

  return (
    <>
      <AreaHeader
        eyebrow="NÓS"
        title="Um espaço conjunto com direitos iguais."
        description="O vínculo nasce por convite, confirmação e aceite. As duas pessoas mantêm os mesmos direitos básicos."
      />
      <View style={styles.grid}>
        <AppCard tone="accent" style={styles.wideCard}>
          <Text selectable style={[styles.cardKicker, { color: colors.brand }]}>
            CONVITE
          </Text>
          <Text selectable style={[styles.cardTitle, { color: colors.text }]}>
            Conectar quando os dois quiserem
          </Text>
          <Text selectable style={[styles.cardBody, { color: colors.textMuted }]}>
            O convite pode ser recusado ou expirar. Até o aceite, nenhuma informação pessoal é
            compartilhada.
          </Text>
          <AppButton label="Simular convite" onPress={() => onAction('invite')} />
        </AppCard>
        <AppCard style={styles.gridCard}>
          <Text selectable style={[styles.cardKicker, { color: colors.success }]}>
            IGUALDADE
          </Text>
          <Text selectable style={[styles.cardTitle, { color: colors.text }]}>
            Sem conta principal
          </Text>
          <Text selectable style={[styles.cardBody, { color: colors.textMuted }]}>
            Nenhum membro ganha poder permanente sobre a conta ou os dados da outra pessoa.
          </Text>
        </AppCard>
      </View>
      <InlineNotice tone="warning" title="Antes de compartilhar">
        O aplicativo sempre deve explicar o que ficará visível, para quem e como desfazer a escolha.
      </InlineNotice>
    </>
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
  topActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
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
  navigation: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.lg,
    borderCurve: 'continuous',
    gap: spacing.sm,
  },
  navigationButton: { flexGrow: 1 },
  areaContent: { gap: spacing.xl, paddingBottom: spacing.xxl },
  areaHeader: { maxWidth: layout.maxReadingWidth, gap: spacing.sm },
  areaTitle: {
    fontFamily: typography.display,
    fontSize: typography.size.title,
    lineHeight: typography.lineHeight.title,
    fontWeight: '700',
  },
  areaDescription: { fontSize: 16, lineHeight: 25 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  gridCard: { minWidth: 250, flexBasis: 300, flexGrow: 1 },
  wideCard: { minWidth: 280, flexBasis: 460, flexGrow: 2 },
  cardKicker: { fontSize: 11, lineHeight: 17, fontWeight: '800', letterSpacing: 1.2 },
  cardTitle: { fontFamily: typography.display, fontSize: 23, lineHeight: 29, fontWeight: '700' },
  cardBody: { fontSize: 15, lineHeight: 23 },
});
