import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Head from 'expo-router/head';
import { useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';

import { maxContentWidth, spacing, typography } from '@/constants/theme';
import { AppButton } from '@/design-system/app-button';
import { AppCard } from '@/design-system/app-card';
import { AppField } from '@/design-system/app-field';
import { InlineNotice } from '@/design-system/inline-notice';
import { useAppTheme } from '@/design-system/theme-provider';
import {
  cancelInvitation,
  createInvitation,
  createSpace,
  getFriendlyCoreError,
  getSpaceOverview,
  joinSpace,
} from '@/features/core/api';
import { formatDateTime } from '@/features/core/date-time';
import { useAuth } from '@/providers/auth-provider';

type Invitation = Awaited<ReturnType<typeof createInvitation>>;

export default function SpaceScreen() {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [spaceName, setSpaceName] = useState('Nosso espaço');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [deliveryHint, setDeliveryHint] = useState('');
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const spaceQuery = useQuery({
    queryKey: ['space', user?.id],
    enabled: Boolean(user),
    queryFn: () => getSpaceOverview(user!.id),
  });
  const refreshSpace = async () => {
    await queryClient.invalidateQueries({ queryKey: ['space'] });
    await spaceQuery.refetch();
  };
  const createMutation = useMutation({
    mutationFn: () => createSpace(spaceName),
    onSuccess: async () => {
      setSuccess('Espaço criado. Agora gere o código para convidar seu par.');
      await refreshSpace();
    },
  });
  const joinMutation = useMutation({
    mutationFn: () => joinSpace(inviteCodeInput),
    onSuccess: async () => {
      setSuccess('Tudo certo: vocês agora compartilham o mesmo espaço.');
      setInviteCodeInput('');
      await refreshSpace();
    },
  });
  const inviteMutation = useMutation({
    mutationFn: () => createInvitation(deliveryHint),
    onSuccess: (result) => {
      setInvitation(result);
      setSuccess('Código criado. Envie apenas para a pessoa que entrará no espaço.');
    },
  });
  const cancelMutation = useMutation({
    mutationFn: cancelInvitation,
    onSuccess: () => {
      setInvitation(null);
      setSuccess('Convite cancelado. O código anterior não funciona mais.');
    },
  });
  const activeError =
    createMutation.error ?? joinMutation.error ?? inviteMutation.error ?? cancelMutation.error;
  const space = spaceQuery.data;
  const canInvite = Boolean(space && space.members.length < 2);

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <Head>
        <title>Espaço do casal · EntreNós</title>
      </Head>
      <View style={styles.intro}>
        <Text selectable style={[styles.kicker, { color: colors.accent }]}>
          VÍNCULO DO CASAL
        </Text>
        <Text selectable style={[styles.title, { color: colors.text }]}>
          {space ? space.name : 'Conectem as duas contas'}
        </Text>
        <Text selectable style={[styles.subtitle, { color: colors.textMuted }]}>
          {space
            ? 'Somente as duas pessoas abaixo podem acessar o conteúdo compartilhado.'
            : 'Uma pessoa cria o espaço. A outra usa o código recebido para entrar.'}
        </Text>
      </View>

      {success ? <InlineNotice tone="success">{success}</InlineNotice> : null}
      {activeError ? (
        <InlineNotice tone="error">{getFriendlyCoreError(activeError)}</InlineNotice>
      ) : null}
      {spaceQuery.error ? (
        <InlineNotice tone="error">{getFriendlyCoreError(spaceQuery.error)}</InlineNotice>
      ) : null}

      {!space && !spaceQuery.isPending ? (
        <View style={styles.grid}>
          <AppCard style={styles.card}>
            <Text selectable style={[styles.cardTitle, { color: colors.text }]}>
              1. Criar um espaço
            </Text>
            <Text selectable style={[styles.body, { color: colors.textMuted }]}>
              Faça isso em apenas uma das contas.
            </Text>
            <AppField
              label="Nome do espaço"
              value={spaceName}
              maxLength={80}
              onChangeText={setSpaceName}
            />
            <AppButton
              label="Criar espaço"
              pending={createMutation.isPending}
              disabled={!spaceName.trim()}
              onPress={() => createMutation.mutate()}
            />
          </AppCard>
          <AppCard style={styles.card}>
            <Text selectable style={[styles.cardTitle, { color: colors.text }]}>
              2. Entrar com código
            </Text>
            <Text selectable style={[styles.body, { color: colors.textMuted }]}>
              Use na segunda conta o código gerado pela primeira.
            </Text>
            <AppField
              label="Código de 8 caracteres"
              value={inviteCodeInput}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={8}
              onChangeText={(value) =>
                setInviteCodeInput(value.toUpperCase().replace(/[^0-9A-F]/g, ''))
              }
            />
            <AppButton
              label="Entrar no espaço"
              pending={joinMutation.isPending}
              disabled={inviteCodeInput.length !== 8}
              onPress={() => joinMutation.mutate()}
            />
          </AppCard>
        </View>
      ) : null}

      {space ? (
        <>
          <AppCard>
            <Text selectable style={[styles.cardTitle, { color: colors.text }]}>
              Pessoas conectadas ({space.members.length}/2)
            </Text>
            {space.members.map((member) => (
              <View key={member.userId} style={[styles.member, { borderColor: colors.border }]}>
                <View style={[styles.avatar, { backgroundColor: `${colors.brand}22` }]}>
                  <Text style={{ color: colors.brand, fontWeight: '800' }}>
                    {member.displayName.slice(0, 1).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text selectable style={[styles.memberName, { color: colors.text }]}>
                    {member.displayName}
                  </Text>
                  <Text selectable style={[styles.body, { color: colors.textMuted }]}>
                    {member.isMe ? 'Você' : 'Seu par'}
                  </Text>
                </View>
              </View>
            ))}
          </AppCard>

          {canInvite ? (
            <AppCard tone="accent">
              <Text selectable style={[styles.cardTitle, { color: colors.text }]}>
                Convidar seu par
              </Text>
              <AppField
                label="E-mail ou apelido (opcional)"
                value={deliveryHint}
                onChangeText={setDeliveryHint}
                hint="Serve apenas para você identificar o convite."
              />
              {!invitation ? (
                <AppButton
                  label="Gerar código seguro"
                  pending={inviteMutation.isPending}
                  onPress={() => inviteMutation.mutate()}
                />
              ) : (
                <View style={styles.codeBox}>
                  <Text selectable style={[styles.code, { color: colors.brandStrong }]}>
                    {invitation.invite_code}
                  </Text>
                  <Text selectable style={[styles.body, { color: colors.textMuted }]}>
                    Válido até {formatDateTime(invitation.expires_at)}
                  </Text>
                  <View style={styles.actions}>
                    <AppButton
                      label="Compartilhar código"
                      onPress={() =>
                        void Share.share({
                          message: `Entre no nosso espaço no EntreNós com o código ${invitation.invite_code}.`,
                        })
                      }
                    />
                    <AppButton
                      label="Cancelar convite"
                      variant="danger"
                      pending={cancelMutation.isPending}
                      onPress={() => cancelMutation.mutate()}
                    />
                  </View>
                </View>
              )}
            </AppCard>
          ) : (
            <InlineNotice tone="success">
              Espaço completo. Agenda e listas já podem ser usadas pelas duas contas.
            </InlineNotice>
          )}
        </>
      ) : null}
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
  intro: { gap: spacing.sm, marginBottom: spacing.sm },
  kicker: { fontSize: 12, fontWeight: '800', letterSpacing: 1.3 },
  title: { fontFamily: typography.display, fontSize: 34, lineHeight: 40, fontWeight: '700' },
  subtitle: { fontSize: 16, lineHeight: 25 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  card: { minWidth: 270, flexGrow: 1, flexBasis: 300, alignSelf: 'flex-start' },
  cardTitle: { fontFamily: typography.display, fontSize: 22, fontWeight: '700' },
  body: { fontSize: 14, lineHeight: 21 },
  member: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.md,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberName: { fontSize: 16, fontWeight: '700' },
  codeBox: { gap: spacing.md, alignItems: 'flex-start' },
  code: {
    fontFamily: typography.display,
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '800',
    letterSpacing: 4,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
