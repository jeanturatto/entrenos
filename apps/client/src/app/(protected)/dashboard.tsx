import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router, type Href } from 'expo-router';
import Head from 'expo-router/head';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { radii, spacing } from '@/constants/theme';
import { AppButton } from '@/design-system/app-button';
import { AppCard } from '@/design-system/app-card';
import { AppScaffold } from '@/design-system/app-scaffold';
import { InlineNotice } from '@/design-system/inline-notice';
import { PageHeader } from '@/design-system/page-header';
import { useAppTheme } from '@/design-system/theme-provider';
import {
  getSpaceOverview,
  listCalendarEvents,
  listSharedItems,
  type CalendarEvent,
  type SharedItem,
  type SpaceOverview,
} from '@/features/core/api';
import { formatDateTime } from '@/features/core/date-time';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

type Profile = { display_name: string };

function MetricCard({
  label,
  value,
  helper,
  color,
  href,
}: {
  label: string;
  value: number | string;
  helper: string;
  color: string;
  href: Href;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => router.push(href)}
      style={({ pressed }) => [
        styles.metricCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.72 : 1,
          boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
        },
      ]}
    >
      <View style={[styles.metricAccent, { backgroundColor: color }]} />
      <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{label.toUpperCase()}</Text>
      <Text selectable style={[styles.metricValue, { color: colors.text }]}>
        {value}
      </Text>
      <Text style={[styles.metricHelper, { color: colors.textMuted }]}>{helper}</Text>
    </Pressable>
  );
}

function QuickAction({
  icon,
  title,
  helper,
  href,
}: {
  icon: string;
  title: string;
  helper: string;
  href: Href;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(href)}
      style={({ pressed }) => [
        styles.quickAction,
        { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.quickIcon, { backgroundColor: `${colors.brand}12` }]}>
        <Text style={[styles.quickGlyph, { color: colors.brand }]}>{icon}</Text>
      </View>
      <View style={styles.grow}>
        <Text style={[styles.quickTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.quickHelper, { color: colors.textMuted }]}>{helper}</Text>
      </View>
      <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
    </Pressable>
  );
}

function UpcomingEvent({ event }: { event: CalendarEvent }) {
  const { colors } = useAppTheme();
  const color =
    event.status === 'proposed'
      ? colors.calendarProposal
      : event.visibility === 'full'
        ? colors.calendarShared
        : event.owned_by_me
          ? colors.calendarMine
          : colors.calendarPartner;
  return (
    <Pressable
      onPress={() => router.push('/calendar')}
      style={({ pressed }) => [
        styles.eventRow,
        { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.eventStripe, { backgroundColor: color }]} />
      <View style={styles.eventDateBlock}>
        <Text style={[styles.eventDay, { color: colors.text }]}>
          {new Date(event.starts_at).getDate()}
        </Text>
        <Text style={[styles.eventMonth, { color: colors.textMuted }]}>
          {new Intl.DateTimeFormat('pt-BR', { month: 'short' })
            .format(new Date(event.starts_at))
            .replace('.', '')
            .toUpperCase()}
        </Text>
      </View>
      <View style={styles.grow}>
        <Text numberOfLines={1} style={[styles.eventTitle, { color: colors.text }]}>
          {event.event_title}
        </Text>
        <Text style={[styles.eventMeta, { color: colors.textMuted }]}>
          {formatDateTime(event.starts_at)} ·{' '}
          {event.visibility === 'full' ? 'Casal' : event.owned_by_me ? 'Você' : event.owner_name}
        </Text>
      </View>
      {event.status === 'proposed' ? (
        <Text style={[styles.pendingBadge, { color: colors.calendarProposal }]}>RESPONDER</Text>
      ) : null}
    </Pressable>
  );
}

function OpenItem({ item }: { item: SharedItem }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={() => router.push('/organize')}
      style={({ pressed }) => [
        styles.itemRow,
        { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.itemCheck, { borderColor: colors.border }]} />
      <View style={styles.grow}>
        <Text numberOfLines={1} style={[styles.itemTitle, { color: colors.text }]}>
          {item.item_title}
        </Text>
        <Text style={[styles.itemMeta, { color: colors.textMuted }]}>
          {item.list_kind === 'tasks'
            ? item.assigned_name
              ? `Responsável: ${item.assigned_name}`
              : 'Sem responsável'
            : item.quantity
              ? `Quantidade: ${item.quantity}`
              : 'Lista de compras'}
        </Text>
      </View>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await getSupabaseClient()
        .from('profiles')
        .select('display_name')
        .eq('id', user!.id)
        .single<Profile>();
      if (error) throw error;
      return data;
    },
  });
  const spaceQuery = useQuery<SpaceOverview | null>({
    queryKey: ['space', user?.id],
    enabled: Boolean(user),
    queryFn: () => getSpaceOverview(user!.id),
  });
  const hasSpace = Boolean(spaceQuery.data);
  const eventsQuery = useQuery({
    queryKey: ['calendar', 'dashboard'],
    enabled: hasSpace,
    refetchInterval: 15_000,
    queryFn: () => {
      const now = new Date();
      const future = new Date(now);
      future.setDate(future.getDate() + 30);
      return listCalendarEvents(now, future);
    },
  });
  const itemsQuery = useQuery({
    queryKey: ['shared-items'],
    enabled: hasSpace,
    refetchInterval: 15_000,
    queryFn: listSharedItems,
  });

  const signOut = async () => {
    const { error } = await getSupabaseClient().auth.signOut();
    if (!error) {
      queryClient.clear();
      router.replace('/');
    }
  };

  const openTasks =
    itemsQuery.data?.filter((item) => item.list_kind === 'tasks' && item.status === 'open') ?? [];
  const openShopping =
    itemsQuery.data?.filter((item) => item.list_kind === 'shopping' && item.status === 'open') ??
    [];
  const pendingEvents = eventsQuery.data?.filter((event) => event.status === 'proposed') ?? [];
  const upcomingEvents = eventsQuery.data?.slice(0, 4) ?? [];
  const greetingName = profileQuery.data?.display_name?.split(' ')[0] ?? 'você';
  const todayLabel = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <AppScaffold active="dashboard">
      <Head>
        <title>Início · EntreNós</title>
        <meta name="description" content="Organize a vida a dois no EntreNós." />
      </Head>
      <PageHeader
        eyebrow={todayLabel}
        title={profileQuery.isPending ? 'Organizando seu dia…' : `Olá, ${greetingName}`}
        subtitle={
          hasSpace
            ? `${spaceQuery.data?.name} em um só lugar: agenda, responsabilidades e compras.`
            : 'Conecte as duas contas para começar a organizar a rotina em conjunto.'
        }
        action={
          <AppButton
            label="+ Novo compromisso"
            disabled={!hasSpace}
            onPress={() => router.push('/event-new')}
          />
        }
      />

      {spaceQuery.error ? (
        <InlineNotice tone="error">
          Não foi possível consultar seu espaço. Tente atualizar.
        </InlineNotice>
      ) : null}
      {!hasSpace && !spaceQuery.isPending ? (
        <AppCard tone="accent" style={styles.connectionCard}>
          <View style={styles.grow}>
            <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>
              Conecte o casal
            </Text>
            <Text selectable style={[styles.sectionBody, { color: colors.textMuted }]}>
              Uma pessoa cria o espaço e envia o código; a outra entra com ele. Depois disso, os
              dados aparecem para os dois.
            </Text>
          </View>
          <AppButton label="Criar ou entrar no espaço" onPress={() => router.push('/space')} />
        </AppCard>
      ) : null}

      {hasSpace ? (
        <>
          <View style={styles.metricsGrid}>
            <MetricCard
              label="Próximos eventos"
              value={eventsQuery.isPending ? '—' : (eventsQuery.data?.length ?? 0)}
              helper="nos próximos 30 dias"
              color={colors.calendarShared}
              href="/calendar"
            />
            <MetricCard
              label="Aguardando resposta"
              value={eventsQuery.isPending ? '—' : pendingEvents.length}
              helper={pendingEvents.length === 1 ? 'proposta pendente' : 'propostas pendentes'}
              color={colors.calendarProposal}
              href="/calendar"
            />
            <MetricCard
              label="Tarefas abertas"
              value={itemsQuery.isPending ? '—' : openTasks.length}
              helper="responsabilidades do casal"
              color={colors.calendarMine}
              href="/organize"
            />
            <MetricCard
              label="Lista de compras"
              value={itemsQuery.isPending ? '—' : openShopping.length}
              helper="itens ainda necessários"
              color={colors.calendarPartner}
              href="/organize"
            />
          </View>

          <View style={styles.mainGrid}>
            <AppCard style={styles.primaryPanel}>
              <View style={styles.sectionHeading}>
                <View>
                  <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>
                    Próximos compromissos
                  </Text>
                  <Text style={[styles.sectionMeta, { color: colors.textMuted }]}>
                    A agenda mais próxima de vocês
                  </Text>
                </View>
                <AppButton
                  label="Ver calendário"
                  variant="ghost"
                  onPress={() => router.push('/calendar')}
                />
              </View>
              {eventsQuery.isPending ? <ActivityIndicator color={colors.brand} /> : null}
              {!eventsQuery.isPending && upcomingEvents.length === 0 ? (
                <View style={styles.emptyBlock}>
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>Agenda livre</Text>
                  <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
                    Nenhum compromisso nos próximos 30 dias.
                  </Text>
                </View>
              ) : null}
              {upcomingEvents.map((event) => (
                <UpcomingEvent key={event.event_id} event={event} />
              ))}
            </AppCard>

            <AppCard style={styles.quickPanel}>
              <View>
                <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>
                  Ações rápidas
                </Text>
                <Text style={[styles.sectionMeta, { color: colors.textMuted }]}>
                  Tudo em poucos toques
                </Text>
              </View>
              <QuickAction
                icon="+"
                title="Novo compromisso"
                helper="Pessoal, privado ou do casal"
                href="/event-new"
              />
              <QuickAction
                icon="✓"
                title="Adicionar tarefa"
                helper="Defina responsável e prazo"
                href="/organize"
              />
              <QuickAction
                icon="▣"
                title="Adicionar compra"
                helper="Atualize a lista compartilhada"
                href="/organize"
              />
              <QuickAction
                icon="♡"
                title="Gerenciar o casal"
                helper="Pessoas, convite e segurança"
                href="/space"
              />
            </AppCard>
          </View>

          <AppCard>
            <View style={styles.sectionHeading}>
              <View>
                <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>
                  Organização de hoje
                </Text>
                <Text style={[styles.sectionMeta, { color: colors.textMuted }]}>
                  O que ainda precisa de atenção
                </Text>
              </View>
              <AppButton
                label="Abrir listas"
                variant="ghost"
                onPress={() => router.push('/organize')}
              />
            </View>
            <View style={styles.itemColumns}>
              <View style={styles.itemColumn}>
                <Text style={[styles.columnLabel, { color: colors.textMuted }]}>TAREFAS</Text>
                {openTasks.slice(0, 3).map((item) => (
                  <OpenItem key={item.item_id} item={item} />
                ))}
                {openTasks.length === 0 ? (
                  <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
                    Tudo em dia por aqui.
                  </Text>
                ) : null}
              </View>
              <View style={styles.itemColumn}>
                <Text style={[styles.columnLabel, { color: colors.textMuted }]}>COMPRAS</Text>
                {openShopping.slice(0, 3).map((item) => (
                  <OpenItem key={item.item_id} item={item} />
                ))}
                {openShopping.length === 0 ? (
                  <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
                    Lista de compras vazia.
                  </Text>
                ) : null}
              </View>
            </View>
          </AppCard>
        </>
      ) : null}

      <View style={[styles.accountBar, { borderColor: colors.border }]}>
        <Text selectable style={[styles.email, { color: colors.textMuted }]}>
          {user?.email}
        </Text>
        <View style={styles.accountActions}>
          <AppButton
            label="Atualizar"
            variant="ghost"
            onPress={() => void queryClient.invalidateQueries()}
          />
          <AppButton label="Sair" variant="secondary" onPress={() => void signOut()} />
        </View>
      </View>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  grow: { flex: 1, minWidth: 0 },
  connectionCard: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  metricCard: {
    minHeight: 154,
    flexGrow: 1,
    flexBasis: 210,
    minWidth: 200,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.md,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  metricAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  metricLabel: { fontSize: 10, lineHeight: 16, fontWeight: '900', letterSpacing: 0.8 },
  metricValue: {
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    marginTop: 6,
  },
  metricHelper: { fontSize: 12, lineHeight: 18 },
  mainGrid: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch', gap: spacing.md },
  primaryPanel: { flexGrow: 2, flexBasis: 570, minWidth: 300 },
  quickPanel: { flexGrow: 1, flexBasis: 320, minWidth: 280 },
  sectionHeading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sectionTitle: { fontSize: 19, lineHeight: 25, fontWeight: '800' },
  sectionBody: { maxWidth: 680, fontSize: 14, lineHeight: 22, marginTop: 4 },
  sectionMeta: { fontSize: 12, lineHeight: 18, marginTop: 3 },
  eventRow: {
    minHeight: 72,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  eventStripe: { width: 4, alignSelf: 'stretch', borderRadius: 2 },
  eventDateBlock: { width: 44, alignItems: 'center' },
  eventDay: { fontSize: 22, lineHeight: 26, fontWeight: '800', fontVariant: ['tabular-nums'] },
  eventMonth: { fontSize: 9, lineHeight: 14, fontWeight: '900', letterSpacing: 0.6 },
  eventTitle: { fontSize: 14, lineHeight: 20, fontWeight: '800' },
  eventMeta: { fontSize: 11, lineHeight: 17, marginTop: 2 },
  pendingBadge: { fontSize: 9, lineHeight: 15, fontWeight: '900', letterSpacing: 0.5 },
  quickAction: {
    minHeight: 66,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  quickIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickGlyph: { fontSize: 18, fontWeight: '900' },
  quickTitle: { fontSize: 13, lineHeight: 19, fontWeight: '800' },
  quickHelper: { fontSize: 11, lineHeight: 16 },
  chevron: { fontSize: 24, fontWeight: '500' },
  itemColumns: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl },
  itemColumn: { flexGrow: 1, flexBasis: 360, minWidth: 260, gap: spacing.xs },
  columnLabel: { fontSize: 10, lineHeight: 16, fontWeight: '900', letterSpacing: 0.8 },
  itemRow: {
    minHeight: 54,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  itemCheck: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5 },
  itemTitle: { fontSize: 13, lineHeight: 19, fontWeight: '700' },
  itemMeta: { fontSize: 10, lineHeight: 15 },
  emptyBlock: { minHeight: 150, alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  emptyTitle: { fontSize: 16, fontWeight: '800' },
  emptyBody: { fontSize: 13, lineHeight: 20 },
  accountBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  accountActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  email: { fontSize: 12 },
});
