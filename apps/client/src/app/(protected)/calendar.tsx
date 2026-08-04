import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import Head from 'expo-router/head';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { radii, spacing } from '@/constants/theme';
import { AppButton } from '@/design-system/app-button';
import { AppCard } from '@/design-system/app-card';
import { AppScaffold } from '@/design-system/app-scaffold';
import { InlineNotice } from '@/design-system/inline-notice';
import { PageHeader } from '@/design-system/page-header';
import { useAppTheme } from '@/design-system/theme-provider';
import {
  AgendaList,
  DayCalendar,
  MonthCalendar,
  WeekCalendar,
} from '@/features/calendar/calendar-views';
import {
  addDays,
  addMonths,
  eventsForDay,
  formatDayHeading,
  formatEventTime,
  formatMonthTitle,
  getCalendarRange,
  getWeekDays,
  type CalendarViewMode,
} from '@/features/calendar/calendar-utils';
import {
  cancelCalendarEvent,
  getFriendlyCoreError,
  getSpaceOverview,
  listCalendarEvents,
  respondCalendarEvent,
  type CalendarEvent,
  type EventResponse,
  type EventVisibility,
} from '@/features/core/api';
import { useAuth } from '@/providers/auth-provider';

type CalendarFilter = 'all' | 'mine' | 'partner' | 'shared' | 'pending';

const responseLabel: Record<EventResponse, string> = {
  pending: 'Aguardando',
  accepted: 'Aceito',
  declined: 'Recusado',
  maybe: 'Talvez',
};

const visibilityLabel: Record<EventVisibility, string> = {
  private: 'Somente eu',
  busy_only: 'Apenas ocupado',
  title_only: 'Título visível',
  full: 'Compartilhado',
};

const views: { key: CalendarViewMode; label: string }[] = [
  { key: 'month', label: 'Mês' },
  { key: 'week', label: 'Semana' },
  { key: 'day', label: 'Dia' },
  { key: 'agenda', label: 'Agenda' },
];

const filters: { key: CalendarFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'mine', label: 'Meus' },
  { key: 'partner', label: 'Do par' },
  { key: 'shared', label: 'Do casal' },
  { key: 'pending', label: 'Pendentes' },
];

function SmallControl({
  label,
  active,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.smallControl,
        {
          backgroundColor: active ? `${colors.brand}15` : colors.surface,
          borderColor: active ? colors.brand : colors.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text style={[styles.smallControlLabel, { color: active ? colors.brand : colors.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function EventDetail({
  event,
  pending,
  onRespond,
  onCancel,
}: {
  event: CalendarEvent;
  pending: boolean;
  onRespond: (response: Exclude<EventResponse, 'pending'>) => void;
  onCancel: () => void;
}) {
  const { colors } = useAppTheme();
  const eventColor =
    event.status === 'proposed'
      ? colors.calendarProposal
      : event.visibility === 'full'
        ? colors.calendarShared
        : event.owned_by_me
          ? colors.calendarMine
          : colors.calendarPartner;

  return (
    <View style={styles.detailContent}>
      <View style={styles.detailHeading}>
        <View style={[styles.detailColor, { backgroundColor: eventColor }]} />
        <View style={styles.grow}>
          <Text selectable style={[styles.detailTitle, { color: colors.text }]}>
            {event.event_title}
          </Text>
          <Text selectable style={[styles.detailTime, { color: colors.textMuted }]}>
            {formatEventTime(event.starts_at)} – {formatEventTime(event.ends_at)}
          </Text>
        </View>
      </View>

      <View style={styles.detailBadges}>
        <Text
          style={[
            styles.detailBadge,
            { color: event.status === 'confirmed' ? colors.success : colors.warning },
          ]}
        >
          {event.status === 'confirmed' ? 'CONFIRMADO' : 'AGUARDANDO RESPOSTA'}
        </Text>
        <Text style={[styles.detailBadge, { color: colors.textMuted }]}>
          {visibilityLabel[event.visibility].toUpperCase()}
        </Text>
      </View>

      {event.event_description ? (
        <Text selectable style={[styles.detailBody, { color: colors.textMuted }]}>
          {event.event_description}
        </Text>
      ) : null}
      {event.event_location ? (
        <View style={[styles.detailRow, { borderColor: colors.border }]}>
          <Text style={[styles.detailIcon, { color: colors.brand }]}>⌖</Text>
          <Text selectable style={[styles.detailBody, { color: colors.text }]}>
            {event.event_location}
          </Text>
        </View>
      ) : null}
      <View style={[styles.detailRow, { borderColor: colors.border }]}>
        <Text style={[styles.detailIcon, { color: colors.brand }]}>◎</Text>
        <View style={styles.grow}>
          <Text selectable style={[styles.detailBodyStrong, { color: colors.text }]}>
            {event.owned_by_me ? 'Criado por você' : `Criado por ${event.owner_name}`}
          </Text>
          {event.visibility === 'full' ? (
            <Text selectable style={[styles.detailMeta, { color: colors.textMuted }]}>
              Você: {responseLabel[event.my_response]} · Par:{' '}
              {responseLabel[event.partner_response]}
            </Text>
          ) : null}
        </View>
      </View>

      {event.visibility === 'full' && !event.owned_by_me ? (
        <View style={styles.responseBlock}>
          <Text style={[styles.responseTitle, { color: colors.text }]}>Sua resposta</Text>
          <View style={styles.detailActions}>
            <AppButton label="Aceitar" pending={pending} onPress={() => onRespond('accepted')} />
            <AppButton
              label="Talvez"
              variant="secondary"
              disabled={pending}
              onPress={() => onRespond('maybe')}
            />
            <AppButton
              label="Recusar"
              variant="ghost"
              disabled={pending}
              onPress={() => onRespond('declined')}
            />
          </View>
        </View>
      ) : null}
      {event.owned_by_me ? (
        <AppButton
          label="Cancelar compromisso"
          variant="danger"
          pending={pending}
          onPress={onCancel}
        />
      ) : null}
    </View>
  );
}

export default function CalendarScreen() {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const compact = width < 720;
  const detailsBeside = width >= 1180;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [view, setView] = useState<CalendarViewMode>('month');
  const [filter, setFilter] = useState<CalendarFilter>('all');
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedEventId, setSelectedEventId] = useState<string>();
  const range = useMemo(() => getCalendarRange(view, cursor), [cursor, view]);

  const spaceQuery = useQuery({
    queryKey: ['space', user?.id],
    enabled: Boolean(user),
    queryFn: () => getSpaceOverview(user!.id),
  });
  const eventsQuery = useQuery({
    queryKey: ['calendar', view, range.from.toISOString(), range.to.toISOString()],
    enabled: Boolean(spaceQuery.data),
    refetchInterval: 15_000,
    queryFn: () => listCalendarEvents(range.from, range.to),
  });
  const respondMutation = useMutation({
    mutationFn: ({
      event,
      response,
    }: {
      event: CalendarEvent;
      response: Exclude<EventResponse, 'pending'>;
    }) => respondCalendarEvent(event.event_id, response),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['calendar'] }),
  });
  const cancelMutation = useMutation({
    mutationFn: (event: CalendarEvent) => cancelCalendarEvent(event.event_id, event.version),
    onSuccess: async () => {
      setSelectedEventId(undefined);
      await queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
    onError: () => queryClient.invalidateQueries({ queryKey: ['calendar'] }),
  });

  const events = useMemo(() => {
    const source = eventsQuery.data ?? [];
    if (filter === 'mine')
      return source.filter((event) => event.owned_by_me && event.visibility !== 'full');
    if (filter === 'partner')
      return source.filter((event) => !event.owned_by_me && event.visibility !== 'full');
    if (filter === 'shared') return source.filter((event) => event.visibility === 'full');
    if (filter === 'pending') return source.filter((event) => event.status === 'proposed');
    return source;
  }, [eventsQuery.data, filter]);
  const selectedEvent = eventsQuery.data?.find((event) => event.event_id === selectedEventId);
  const selectedDayEvents = eventsForDay(events, selectedDate);
  const partnerName = spaceQuery.data?.members.find((member) => !member.isMe)?.displayName;
  const activeError = eventsQuery.error ?? respondMutation.error ?? cancelMutation.error;

  const move = (direction: -1 | 1) => {
    const next =
      view === 'month'
        ? addMonths(cursor, direction)
        : view === 'week'
          ? addDays(cursor, direction * 7)
          : view === 'agenda'
            ? addDays(cursor, direction * 30)
            : addDays(cursor, direction);
    setCursor(next);
    setSelectedDate(next);
    setSelectedEventId(undefined);
  };

  const title =
    view === 'month'
      ? formatMonthTitle(cursor)
      : view === 'week'
        ? `${formatDayHeading(getWeekDays(cursor)[0])} – ${formatDayHeading(getWeekDays(cursor)[6])}`
        : view === 'agenda'
          ? 'Próximos 90 dias'
          : formatDayHeading(cursor);

  const viewProps = {
    events,
    cursor,
    selectedDate,
    selectedEventId,
    compact,
    partnerName,
    onSelectDate: (date: Date) => {
      setSelectedDate(date);
      if (view === 'day') setCursor(date);
    },
    onSelectEvent: (event: CalendarEvent) => {
      setSelectedEventId(event.event_id);
      setSelectedDate(new Date(event.starts_at));
    },
  };

  return (
    <AppScaffold active="calendar" fullWidth>
      <Head>
        <title>Calendário · EntreNós</title>
      </Head>
      <PageHeader
        eyebrow="Calendário do casal"
        title="Nossa agenda"
        subtitle="Visualize compromissos pessoais, do seu par e compartilhados sem abrir mão da privacidade."
        action={
          <AppButton
            label="+ Novo compromisso"
            disabled={!spaceQuery.data}
            onPress={() => router.push('/event-new')}
          />
        }
      />

      {activeError ? (
        <InlineNotice tone="error">{getFriendlyCoreError(activeError)}</InlineNotice>
      ) : null}
      {!spaceQuery.data && !spaceQuery.isPending ? (
        <AppCard tone="accent">
          <Text selectable style={[styles.emptyTitle, { color: colors.text }]}>
            Conecte as duas contas para abrir a agenda
          </Text>
          <Text selectable style={[styles.emptyBody, { color: colors.textMuted }]}>
            O calendário compartilhado é liberado depois que o casal entra no mesmo espaço.
          </Text>
          <AppButton label="Conectar o casal" onPress={() => router.push('/space')} />
        </AppCard>
      ) : null}

      {spaceQuery.data ? (
        <>
          <View
            style={[
              styles.toolbar,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.dateNavigation}>
              <SmallControl
                label="Hoje"
                onPress={() => {
                  const today = new Date();
                  setCursor(today);
                  setSelectedDate(today);
                }}
              />
              <SmallControl
                label="‹"
                accessibilityLabel="Período anterior"
                onPress={() => move(-1)}
              />
              <SmallControl
                label="›"
                accessibilityLabel="Próximo período"
                onPress={() => move(1)}
              />
              <Text
                selectable
                numberOfLines={compact ? 2 : 1}
                style={[styles.periodTitle, { color: colors.text }]}
              >
                {title}
              </Text>
            </View>
            <View accessibilityRole="tablist" style={styles.viewSwitch}>
              {views.map((option) => (
                <SmallControl
                  key={option.key}
                  label={option.label}
                  active={view === option.key}
                  onPress={() => {
                    setView(option.key);
                    if (option.key === 'day') setCursor(selectedDate);
                  }}
                />
              ))}
            </View>
          </View>

          <View style={styles.filterRow}>
            <View style={styles.filters}>
              {filters.map((option) => (
                <SmallControl
                  key={option.key}
                  label={option.label}
                  active={filter === option.key}
                  onPress={() => setFilter(option.key)}
                />
              ))}
            </View>
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.calendarMine }]} />
                <Text style={[styles.legendText, { color: colors.textMuted }]}>Você</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.calendarPartner }]} />
                <Text style={[styles.legendText, { color: colors.textMuted }]}>Par</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.calendarShared }]} />
                <Text style={[styles.legendText, { color: colors.textMuted }]}>Casal</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.calendarProposal }]} />
                <Text style={[styles.legendText, { color: colors.textMuted }]}>Proposta</Text>
              </View>
            </View>
          </View>

          {eventsQuery.isPending ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.brand} />
              <Text style={{ color: colors.textMuted }}>Carregando agenda…</Text>
            </View>
          ) : (
            <View style={[styles.workspace, detailsBeside ? styles.workspaceWide : null]}>
              <View style={styles.calendarArea}>
                {view === 'month' ? <MonthCalendar {...viewProps} /> : null}
                {view === 'week' ? <WeekCalendar {...viewProps} /> : null}
                {view === 'day' ? <DayCalendar {...viewProps} /> : null}
                {view === 'agenda' ? <AgendaList {...viewProps} /> : null}
                {compact && view === 'month' ? (
                  <AppCard style={styles.mobileDayCard}>
                    <Text selectable style={[styles.dayCardTitle, { color: colors.text }]}>
                      {formatDayHeading(selectedDate)}
                    </Text>
                    {selectedDayEvents.length === 0 ? (
                      <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
                        Nenhum compromisso neste dia.
                      </Text>
                    ) : (
                      selectedDayEvents.map((event) => (
                        <Pressable
                          key={event.event_id}
                          onPress={() => setSelectedEventId(event.event_id)}
                          style={[styles.mobileEventRow, { borderColor: colors.border }]}
                        >
                          <Text style={[styles.mobileEventTime, { color: colors.brand }]}>
                            {formatEventTime(event.starts_at)}
                          </Text>
                          <View style={styles.grow}>
                            <Text style={[styles.mobileEventTitle, { color: colors.text }]}>
                              {event.event_title}
                            </Text>
                            <Text style={[styles.detailMeta, { color: colors.textMuted }]}>
                              {event.owned_by_me
                                ? 'Você'
                                : event.visibility === 'full'
                                  ? 'Casal'
                                  : (partnerName ?? 'Seu par')}
                            </Text>
                          </View>
                        </Pressable>
                      ))
                    )}
                  </AppCard>
                ) : null}
              </View>

              <View
                style={[
                  styles.detailPanel,
                  detailsBeside ? styles.detailPanelWide : null,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                {selectedEvent ? (
                  <EventDetail
                    event={selectedEvent}
                    pending={respondMutation.isPending || cancelMutation.isPending}
                    onRespond={(response) =>
                      respondMutation.mutate({ event: selectedEvent, response })
                    }
                    onCancel={() => cancelMutation.mutate(selectedEvent)}
                  />
                ) : (
                  <View style={styles.daySummary}>
                    <Text selectable style={[styles.dayCardTitle, { color: colors.text }]}>
                      {formatDayHeading(selectedDate)}
                    </Text>
                    <Text style={[styles.detailMeta, { color: colors.textMuted }]}>
                      {selectedDayEvents.length === 0
                        ? 'Dia livre para vocês.'
                        : `${selectedDayEvents.length} compromisso${selectedDayEvents.length === 1 ? '' : 's'}`}
                    </Text>
                    {selectedDayEvents.slice(0, 6).map((event) => (
                      <Pressable
                        key={event.event_id}
                        onPress={() => setSelectedEventId(event.event_id)}
                        style={[styles.summaryEvent, { borderColor: colors.border }]}
                      >
                        <View
                          style={[
                            styles.summaryEventDot,
                            {
                              backgroundColor:
                                event.status === 'proposed'
                                  ? colors.calendarProposal
                                  : event.visibility === 'full'
                                    ? colors.calendarShared
                                    : event.owned_by_me
                                      ? colors.calendarMine
                                      : colors.calendarPartner,
                            },
                          ]}
                        />
                        <View style={styles.grow}>
                          <Text
                            numberOfLines={1}
                            style={[styles.summaryEventTitle, { color: colors.text }]}
                          >
                            {event.event_title}
                          </Text>
                          <Text style={[styles.detailMeta, { color: colors.textMuted }]}>
                            {formatEventTime(event.starts_at)}–{formatEventTime(event.ends_at)}
                          </Text>
                        </View>
                      </Pressable>
                    ))}
                    <AppButton
                      label="Criar neste dia"
                      variant="secondary"
                      onPress={() => router.push('/event-new')}
                    />
                  </View>
                )}
              </View>
            </View>
          )}
        </>
      ) : null}
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  dateNavigation: {
    flexGrow: 1,
    flexBasis: 420,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  smallControl: {
    minHeight: 38,
    minWidth: 38,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallControlLabel: { fontSize: 12, fontWeight: '800' },
  periodTitle: {
    flexGrow: 1,
    flexBasis: 180,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    paddingLeft: spacing.xs,
  },
  viewSwitch: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontWeight: '700' },
  workspace: { gap: spacing.lg },
  workspaceWide: { flexDirection: 'row', alignItems: 'flex-start' },
  calendarArea: { flex: 1, minWidth: 0, gap: spacing.md },
  detailPanel: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  detailPanelWide: { width: 330 },
  detailContent: { gap: spacing.lg },
  detailHeading: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  detailColor: { width: 12, height: 12, borderRadius: 6, marginTop: 6 },
  grow: { flex: 1, minWidth: 0 },
  detailTitle: { fontSize: 21, lineHeight: 27, fontWeight: '800' },
  detailTime: { fontSize: 13, lineHeight: 20, marginTop: 3, fontVariant: ['tabular-nums'] },
  detailBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  detailBadge: { fontSize: 10, lineHeight: 16, fontWeight: '900', letterSpacing: 0.5 },
  detailBody: { fontSize: 14, lineHeight: 22 },
  detailBodyStrong: { fontSize: 14, lineHeight: 21, fontWeight: '700' },
  detailMeta: { fontSize: 11, lineHeight: 17 },
  detailRow: {
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  detailIcon: { width: 20, fontSize: 17, fontWeight: '900' },
  responseBlock: { gap: spacing.sm },
  responseTitle: { fontSize: 13, fontWeight: '800' },
  detailActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  daySummary: { gap: spacing.md },
  dayCardTitle: { fontSize: 17, lineHeight: 23, fontWeight: '800' },
  summaryEvent: {
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  summaryEventDot: { width: 9, height: 9, borderRadius: 5 },
  summaryEventTitle: { fontSize: 13, lineHeight: 19, fontWeight: '800' },
  mobileDayCard: { marginTop: spacing.sm },
  mobileEventRow: {
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.md,
  },
  mobileEventTime: { width: 44, fontSize: 12, fontWeight: '900', fontVariant: ['tabular-nums'] },
  mobileEventTitle: { fontSize: 14, fontWeight: '800' },
  loading: { minHeight: 260, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  emptyTitle: { fontSize: 20, lineHeight: 26, fontWeight: '800' },
  emptyBody: { fontSize: 14, lineHeight: 22 },
});
