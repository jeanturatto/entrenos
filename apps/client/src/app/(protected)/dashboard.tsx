import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import Head from 'expo-router/head';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BrandMark } from '@/components/brand-mark';
import { maxContentWidth, spacing, typography } from '@/constants/theme';
import { AppButton } from '@/design-system/app-button';
import { AppCard } from '@/design-system/app-card';
import { InlineNotice } from '@/design-system/inline-notice';
import { useAppTheme } from '@/design-system/theme-provider';
import {
  getSpaceOverview,
  listCalendarEvents,
  listSharedItems,
  type SpaceOverview,
} from '@/features/core/api';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

type Profile = { display_name: string };

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
    queryFn: listSharedItems,
  });

  const signOut = async () => {
    const { error } = await getSupabaseClient().auth.signOut();
    if (!error) {
      queryClient.clear();
      router.replace('/');
    }
  };

  const pendingTasks = itemsQuery.data?.filter(
    (item) => item.list_kind === 'tasks' && item.status === 'open',
  ).length;
  const shoppingItems = itemsQuery.data?.filter(
    (item) => item.list_kind === 'shopping' && item.status === 'open',
  ).length;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <Head>
        <title>Meu espaço · EntreNós</title>
        <meta name="description" content="Organize a vida a dois no EntreNós." />
      </Head>

      <View style={styles.brandRow}>
        <BrandMark compact />
        <Text selectable style={[styles.wordmark, { color: colors.text }]}>
          EntreNós
        </Text>
      </View>

      <View style={styles.hero}>
        <Text selectable style={[styles.kicker, { color: colors.accent }]}>
          SEU DIA A DOIS
        </Text>
        {profileQuery.isPending ? (
          <ActivityIndicator color={colors.brand} style={{ alignSelf: 'flex-start' }} />
        ) : (
          <Text selectable style={[styles.title, { color: colors.text }]}>
            Oi, {profileQuery.data?.display_name ?? 'você'}.
          </Text>
        )}
        <Text selectable style={[styles.subtitle, { color: colors.textMuted }]}>
          {hasSpace
            ? `${spaceQuery.data?.name}: agenda, tarefas e compras já estão prontas para vocês usarem.`
            : 'Crie o espaço do casal ou entre com o código recebido para liberar agenda, tarefas e compras.'}
        </Text>
      </View>

      {spaceQuery.error ? (
        <InlineNotice tone="error">
          Não foi possível consultar seu espaço. Tente atualizar.
        </InlineNotice>
      ) : null}

      {!hasSpace && !spaceQuery.isPending ? (
        <AppCard tone="accent" style={styles.callout}>
          <Text selectable style={[styles.cardTitle, { color: colors.text }]}>
            Conecte o casal
          </Text>
          <Text selectable style={[styles.cardBody, { color: colors.textMuted }]}>
            Uma pessoa cria o espaço e envia um código de 8 caracteres. A outra entra com esse
            código.
          </Text>
          <AppButton label="Criar ou entrar em um espaço" onPress={() => router.push('/space')} />
        </AppCard>
      ) : null}

      <View style={styles.grid}>
        <AppCard style={styles.card}>
          <Text selectable style={[styles.cardKicker, { color: colors.brand }]}>
            CASAL
          </Text>
          <Text selectable style={[styles.cardTitle, { color: colors.text }]}>
            Espaço compartilhado
          </Text>
          <Text selectable style={[styles.cardBody, { color: colors.textMuted }]}>
            {hasSpace
              ? `${spaceQuery.data?.members.length}/2 pessoas conectadas.`
              : 'Ainda não conectado.'}
          </Text>
          <AppButton
            label={hasSpace ? 'Ver pessoas e convite' : 'Conectar agora'}
            variant="secondary"
            onPress={() => router.push('/space')}
          />
        </AppCard>

        <AppCard style={styles.card}>
          <Text selectable style={[styles.cardKicker, { color: colors.accent }]}>
            AGENDA
          </Text>
          <Text selectable style={[styles.cardTitle, { color: colors.text }]}>
            Próximos compromissos
          </Text>
          <Text selectable style={[styles.metric, { color: colors.text }]}>
            {hasSpace ? (eventsQuery.data?.length ?? '—') : '—'}
          </Text>
          <AppButton
            label="Abrir agenda"
            variant="secondary"
            disabled={!hasSpace}
            onPress={() => router.push('/calendar')}
          />
        </AppCard>

        <AppCard style={styles.card}>
          <Text selectable style={[styles.cardKicker, { color: colors.success }]}>
            ORGANIZAÇÃO
          </Text>
          <Text selectable style={[styles.cardTitle, { color: colors.text }]}>
            Tarefas e compras
          </Text>
          <Text selectable style={[styles.cardBody, { color: colors.textMuted }]}>
            {hasSpace
              ? `${pendingTasks ?? '—'} tarefas · ${shoppingItems ?? '—'} compras pendentes`
              : 'Disponível após conectar o casal.'}
          </Text>
          <AppButton
            label="Abrir listas"
            variant="secondary"
            disabled={!hasSpace}
            onPress={() => router.push('/organize')}
          />
        </AppCard>
      </View>

      <View style={styles.account}>
        <Text selectable style={[styles.email, { color: colors.textMuted }]}>
          {user?.email}
        </Text>
        <View style={styles.accountActions}>
          <AppButton
            label="Atualizar dados"
            variant="ghost"
            onPress={() => {
              void queryClient.invalidateQueries();
            }}
          />
          <AppButton label="Sair" variant="secondary" onPress={() => void signOut()} />
        </View>
      </View>
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
  wordmark: { fontFamily: typography.display, fontSize: 20, fontWeight: '700' },
  hero: { gap: spacing.md, paddingTop: spacing.md },
  kicker: { fontSize: 12, fontWeight: '800', letterSpacing: 1.4 },
  title: { fontFamily: typography.display, fontSize: 40, lineHeight: 46, fontWeight: '700' },
  subtitle: { maxWidth: 640, fontSize: 17, lineHeight: 27 },
  callout: { alignItems: 'flex-start' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  card: { minWidth: 250, flexBasis: 300, flexGrow: 1, alignItems: 'flex-start' },
  cardKicker: { fontSize: 11, fontWeight: '800', letterSpacing: 1.1 },
  cardTitle: { fontFamily: typography.display, fontSize: 23, fontWeight: '700' },
  cardBody: { fontSize: 15, lineHeight: 23 },
  metric: { fontFamily: typography.display, fontSize: 36, fontWeight: '700' },
  account: { gap: spacing.md, alignItems: 'flex-start', paddingTop: spacing.md },
  accountActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  email: { fontSize: 14 },
});
