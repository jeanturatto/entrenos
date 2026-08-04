import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import Head from 'expo-router/head';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { maxContentWidth, spacing, typography } from '@/constants/theme';
import { AppButton } from '@/design-system/app-button';
import { AppCard } from '@/design-system/app-card';
import { InlineNotice } from '@/design-system/inline-notice';
import { useAppTheme } from '@/design-system/theme-provider';
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
import { formatDateTime } from '@/features/core/date-time';
import { useAuth } from '@/providers/auth-provider';

const responseLabel: Record<EventResponse, string> = {
  pending: 'Aguardando',
  accepted: 'Aceito',
  declined: 'Recusado',
  maybe: 'Talvez',
};
const visibilityLabel: Record<EventVisibility, string> = {
  private: 'Privado',
  busy_only: 'Só ocupado',
  title_only: 'Título visível',
  full: 'Compartilhado',
};

export default function CalendarScreen() {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const spaceQuery = useQuery({
    queryKey: ['space', user?.id],
    enabled: Boolean(user),
    queryFn: () => getSpaceOverview(user!.id),
  });
  const eventsQuery = useQuery({
    queryKey: ['calendar', 'full'],
    enabled: Boolean(spaceQuery.data),
    refetchInterval: 15_000,
    queryFn: () => {
      const from = new Date();
      from.setDate(from.getDate() - 30);
      const to = new Date();
      to.setDate(to.getDate() + 180);
      return listCalendarEvents(from, to);
    },
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['calendar'] }),
    onError: () => queryClient.invalidateQueries({ queryKey: ['calendar'] }),
  });
  const activeError = eventsQuery.error ?? respondMutation.error ?? cancelMutation.error;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <Head>
        <title>Agenda · EntreNós</title>
      </Head>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text selectable style={[styles.kicker, { color: colors.accent }]}>
            AGENDA DO CASAL
          </Text>
          <Text selectable style={[styles.title, { color: colors.text }]}>
            Compromissos e propostas
          </Text>
          <Text selectable style={[styles.subtitle, { color: colors.textMuted }]}>
            Crie eventos privados ou compartilhados. Propostas compartilhadas só ficam confirmadas
            quando os dois aceitam.
          </Text>
        </View>
        <AppButton
          label="Novo compromisso"
          disabled={!spaceQuery.data}
          onPress={() => router.push('/event-new')}
        />
      </View>

      {activeError ? (
        <InlineNotice tone="error">{getFriendlyCoreError(activeError)}</InlineNotice>
      ) : null}
      {!spaceQuery.data && !spaceQuery.isPending ? (
        <AppCard tone="accent">
          <Text selectable style={[styles.cardTitle, { color: colors.text }]}>
            Conecte o casal primeiro
          </Text>
          <Text selectable style={[styles.body, { color: colors.textMuted }]}>
            A agenda compartilhada é liberada assim que você cria ou entra em um espaço.
          </Text>
          <AppButton label="Ir para conexão" onPress={() => router.push('/space')} />
        </AppCard>
      ) : null}

      {eventsQuery.isPending && spaceQuery.data ? (
        <Text style={[styles.body, { color: colors.textMuted }]}>Carregando agenda…</Text>
      ) : null}
      {eventsQuery.data?.length === 0 ? (
        <AppCard>
          <Text selectable style={[styles.cardTitle, { color: colors.text }]}>
            Agenda livre
          </Text>
          <Text selectable style={[styles.body, { color: colors.textMuted }]}>
            Crie o primeiro compromisso para começar.
          </Text>
        </AppCard>
      ) : null}

      <View style={styles.list}>
        {eventsQuery.data?.map((event) => (
          <AppCard key={event.event_id} tone={event.status === 'proposed' ? 'accent' : 'default'}>
            <View style={styles.cardHeader}>
              <View style={styles.grow}>
                <Text selectable style={[styles.cardTitle, { color: colors.text }]}>
                  {event.event_title}
                </Text>
                <Text selectable style={[styles.date, { color: colors.brand }]}>
                  {formatDateTime(event.starts_at)} → {formatDateTime(event.ends_at)}
                </Text>
              </View>
              <Text
                selectable
                style={[
                  styles.badge,
                  { color: event.status === 'confirmed' ? colors.success : colors.warning },
                ]}
              >
                {event.status === 'confirmed' ? 'CONFIRMADO' : 'PROPOSTA'}
              </Text>
            </View>
            {event.event_description ? (
              <Text selectable style={[styles.body, { color: colors.textMuted }]}>
                {event.event_description}
              </Text>
            ) : null}
            {event.event_location ? (
              <Text selectable style={[styles.body, { color: colors.textMuted }]}>
                Local: {event.event_location}
              </Text>
            ) : null}
            <Text selectable style={[styles.meta, { color: colors.textMuted }]}>
              {event.owned_by_me ? 'Criado por você' : `Criado por ${event.owner_name}`} ·{' '}
              {visibilityLabel[event.visibility]}
            </Text>

            {event.visibility === 'full' ? (
              <View style={styles.responses}>
                <Text selectable style={[styles.body, { color: colors.text }]}>
                  Você: {responseLabel[event.my_response]} · Par:{' '}
                  {responseLabel[event.partner_response]}
                </Text>
                {!event.owned_by_me ? (
                  <View style={styles.actions}>
                    <AppButton
                      label="Aceitar"
                      variant="secondary"
                      pending={respondMutation.isPending}
                      onPress={() => respondMutation.mutate({ event, response: 'accepted' })}
                    />
                    <AppButton
                      label="Talvez"
                      variant="ghost"
                      disabled={respondMutation.isPending}
                      onPress={() => respondMutation.mutate({ event, response: 'maybe' })}
                    />
                    <AppButton
                      label="Recusar"
                      variant="ghost"
                      disabled={respondMutation.isPending}
                      onPress={() => respondMutation.mutate({ event, response: 'declined' })}
                    />
                  </View>
                ) : null}
              </View>
            ) : null}
            {event.owned_by_me ? (
              <AppButton
                label="Cancelar compromisso"
                variant="danger"
                pending={cancelMutation.isPending}
                onPress={() => cancelMutation.mutate(event)}
              />
            ) : null}
          </AppCard>
        ))}
      </View>
      <AppButton
        label="Atualizar agenda"
        variant="ghost"
        disabled={!spaceQuery.data}
        onPress={() => void eventsQuery.refetch()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: maxContentWidth,
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  headerCopy: { gap: spacing.sm, flexGrow: 1, flexBasis: 380 },
  kicker: { fontSize: 12, fontWeight: '800', letterSpacing: 1.3 },
  title: { fontFamily: typography.display, fontSize: 34, lineHeight: 40, fontWeight: '700' },
  subtitle: { maxWidth: 640, fontSize: 16, lineHeight: 25 },
  list: { gap: spacing.md },
  cardHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  grow: { flexGrow: 1, flexBasis: 240, gap: spacing.xs },
  cardTitle: { fontFamily: typography.display, fontSize: 22, fontWeight: '700' },
  date: { fontSize: 14, lineHeight: 21, fontWeight: '700' },
  body: { fontSize: 14, lineHeight: 21 },
  meta: { fontSize: 12, lineHeight: 18 },
  badge: { fontSize: 11, lineHeight: 18, fontWeight: '900', letterSpacing: 0.8 },
  responses: { gap: spacing.sm },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
