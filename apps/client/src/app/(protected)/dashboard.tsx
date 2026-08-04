import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';

import { BrandMark } from '@/components/brand-mark';
import { maxContentWidth, palette, radii, spacing, typography } from '@/constants/theme';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

type Profile = {
  display_name: string;
  locale: string;
  timezone: string;
  currency_code: string;
};

export default function DashboardScreen() {
  const colors = useColorScheme() === 'dark' ? palette.dark : palette.light;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await getSupabaseClient()
        .from('profiles')
        .select('display_name, locale, timezone, currency_code')
        .eq('id', user!.id)
        .single<Profile>();

      if (error) {
        throw error;
      }

      return data;
    },
  });

  const signOut = async () => {
    const { error } = await getSupabaseClient().auth.signOut();

    if (!error) {
      queryClient.clear();
      router.replace('/');
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <View style={styles.brandRow}>
        <BrandMark compact />
        <Text selectable style={[styles.wordmark, { color: colors.text }]}>
          EntreNós
        </Text>
      </View>

      <View style={styles.hero}>
        <Text selectable style={[styles.kicker, { color: colors.accent }]}>
          ÁREA PROTEGIDA
        </Text>
        {profileQuery.isPending ? (
          <ActivityIndicator color={colors.brand} style={{ alignSelf: 'flex-start' }} />
        ) : (
          <Text selectable style={[styles.title, { color: colors.text }]}>
            Olá, {profileQuery.data?.display_name ?? 'você'}.
          </Text>
        )}
        <Text selectable style={[styles.subtitle, { color: colors.textMuted }]}>
          Sua identidade está confirmada. Agora cada próximo passo pode respeitar consentimento,
          privacidade e direitos equivalentes.
        </Text>
      </View>

      {profileQuery.error ? (
        <View
          style={[
            styles.notice,
            { borderColor: colors.error, backgroundColor: `${colors.error}14` },
          ]}
        >
          <Text selectable style={{ color: colors.error }}>
            Não foi possível carregar seu perfil. Tente novamente.
          </Text>
        </View>
      ) : null}

      <View style={styles.grid}>
        <View
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text selectable style={[styles.cardKicker, { color: colors.success }]}>
            SESSÃO ATIVA
          </Text>
          <Text selectable style={[styles.cardTitle, { color: colors.text }]}>
            Acesso protegido
          </Text>
          <Text selectable style={[styles.cardBody, { color: colors.textMuted }]}>
            A sessão é renovada enquanto o app está ativo e armazenada com proteção nativa no
            dispositivo.
          </Text>
        </View>
        <View
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text selectable style={[styles.cardKicker, { color: colors.accent }]}>
            PRÓXIMO PASSO
          </Text>
          <Text selectable style={[styles.cardTitle, { color: colors.text }]}>
            Formar seu espaço
          </Text>
          <Text selectable style={[styles.cardBody, { color: colors.textMuted }]}>
            O convite do parceiro será uma etapa separada e dependerá da concordância das duas
            pessoas.
          </Text>
        </View>
      </View>

      <View style={styles.account}>
        <Text selectable style={[styles.email, { color: colors.textMuted }]}>
          {user?.email}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => void signOut()}
          style={({ pressed }) => [
            styles.secondaryButton,
            {
              borderColor: colors.border,
              backgroundColor: colors.surface,
              opacity: pressed ? 0.72 : 1,
            },
          ]}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
            Sair com segurança
          </Text>
        </Pressable>
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
  hero: { gap: spacing.md, paddingTop: spacing.lg },
  kicker: { fontSize: 12, fontWeight: '800', letterSpacing: 1.4 },
  title: { fontFamily: typography.display, fontSize: 42, lineHeight: 48, fontWeight: '700' },
  subtitle: { maxWidth: 640, fontSize: 17, lineHeight: 27 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  card: {
    minWidth: 250,
    flexBasis: 300,
    flexGrow: 1,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.lg,
    borderCurve: 'continuous',
    gap: spacing.sm,
  },
  cardKicker: { fontSize: 11, fontWeight: '800', letterSpacing: 1.1 },
  cardTitle: { fontFamily: typography.display, fontSize: 23, fontWeight: '700' },
  cardBody: { fontSize: 15, lineHeight: 23 },
  notice: { padding: spacing.md, borderWidth: StyleSheet.hairlineWidth, borderRadius: radii.md },
  account: { gap: spacing.md, alignItems: 'flex-start', paddingTop: spacing.md },
  email: { fontSize: 14 },
  secondaryButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.md,
    borderCurve: 'continuous',
  },
  secondaryButtonText: { fontSize: 14, fontWeight: '800' },
});
