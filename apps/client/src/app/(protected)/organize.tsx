import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import Head from 'expo-router/head';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { maxContentWidth, spacing, typography } from '@/constants/theme';
import { AppButton } from '@/design-system/app-button';
import { AppCard } from '@/design-system/app-card';
import { AppField } from '@/design-system/app-field';
import { InlineNotice } from '@/design-system/inline-notice';
import { useAppTheme } from '@/design-system/theme-provider';
import {
  createSharedItem,
  deleteSharedItem,
  getFriendlyCoreError,
  getSpaceOverview,
  listSharedItems,
  toggleSharedItem,
  type SharedItem,
  type SharedListKind,
  type SharedRecurrence,
} from '@/features/core/api';
import { formatDateTime, parseLocalDateTime } from '@/features/core/date-time';
import { useAuth } from '@/providers/auth-provider';

const recurrenceLabels: Record<SharedRecurrence, string> = {
  none: 'Sem repetir',
  daily: 'Todo dia',
  weekly: 'Toda semana',
  monthly: 'Todo mês',
};

export default function OrganizeScreen() {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [kind, setKind] = useState<SharedListKind>('tasks');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [recurrence, setRecurrence] = useState<SharedRecurrence>('none');
  const [validationError, setValidationError] = useState<string | null>(null);

  const spaceQuery = useQuery({
    queryKey: ['space', user?.id],
    enabled: Boolean(user),
    queryFn: () => getSpaceOverview(user!.id),
  });
  const itemsQuery = useQuery({
    queryKey: ['shared-items'],
    enabled: Boolean(spaceQuery.data),
    refetchInterval: 10_000,
    queryFn: listSharedItems,
  });
  const createMutation = useMutation({
    mutationFn: (dueAt: Date | null) =>
      createSharedItem({
        kind,
        title,
        notes,
        quantity: kind === 'shopping' ? quantity : '',
        assignedTo,
        dueAt,
        recurrence: kind === 'tasks' ? recurrence : 'none',
      }),
    onSuccess: async () => {
      setTitle('');
      setNotes('');
      setQuantity('');
      setDueDate('');
      await queryClient.invalidateQueries({ queryKey: ['shared-items'] });
    },
  });
  const toggleMutation = useMutation({
    mutationFn: ({ item, completed }: { item: SharedItem; completed: boolean }) =>
      toggleSharedItem(item, completed),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shared-items'] }),
    onError: () => queryClient.invalidateQueries({ queryKey: ['shared-items'] }),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteSharedItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shared-items'] }),
    onError: () => queryClient.invalidateQueries({ queryKey: ['shared-items'] }),
  });
  const activeError =
    itemsQuery.error ?? createMutation.error ?? toggleMutation.error ?? deleteMutation.error;
  const visibleItems = itemsQuery.data?.filter((item) => item.list_kind === kind) ?? [];

  const submit = () => {
    setValidationError(null);
    if (!title.trim())
      return setValidationError(`Informe o nome ${kind === 'tasks' ? 'da tarefa' : 'do produto'}.`);
    let dueAt: Date | null = null;
    if (dueDate.trim()) {
      dueAt = parseLocalDateTime(dueDate, '23:59');
      if (!dueAt) return setValidationError('Use a data no formato DD/MM/AAAA.');
    }
    createMutation.mutate(dueAt);
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <Head>
        <title>Tarefas e compras · EntreNós</title>
      </Head>
      <View style={styles.header}>
        <Text selectable style={[styles.kicker, { color: colors.accent }]}>
          ORGANIZAÇÃO COMPARTILHADA
        </Text>
        <Text selectable style={[styles.title, { color: colors.text }]}>
          Tarefas e compras
        </Text>
        <Text selectable style={[styles.subtitle, { color: colors.textMuted }]}>
          As duas contas veem a mesma lista. A tela atualiza automaticamente e bloqueia alterações
          feitas sobre uma versão antiga.
        </Text>
      </View>

      <View accessibilityRole="tablist" style={styles.tabs}>
        <AppButton
          label="Tarefas"
          accessibilityRole="tab"
          selected={kind === 'tasks'}
          variant={kind === 'tasks' ? 'primary' : 'secondary'}
          onPress={() => setKind('tasks')}
        />
        <AppButton
          label="Compras"
          accessibilityRole="tab"
          selected={kind === 'shopping'}
          variant={kind === 'shopping' ? 'primary' : 'secondary'}
          onPress={() => setKind('shopping')}
        />
      </View>

      {validationError ? <InlineNotice tone="warning">{validationError}</InlineNotice> : null}
      {activeError ? (
        <InlineNotice tone="error">{getFriendlyCoreError(activeError)}</InlineNotice>
      ) : null}
      {!spaceQuery.data && !spaceQuery.isPending ? (
        <AppCard tone="accent">
          <Text selectable style={[styles.cardTitle, { color: colors.text }]}>
            Conecte o casal primeiro
          </Text>
          <AppButton label="Ir para conexão" onPress={() => router.push('/space')} />
        </AppCard>
      ) : null}

      {spaceQuery.data ? (
        <AppCard tone="accent">
          <Text selectable style={[styles.cardTitle, { color: colors.text }]}>
            {kind === 'tasks' ? 'Nova tarefa' : 'Adicionar à compra'}
          </Text>
          <AppField
            label={kind === 'tasks' ? 'O que precisa ser feito?' : 'Qual produto?'}
            value={title}
            maxLength={160}
            onChangeText={setTitle}
          />
          {kind === 'shopping' ? (
            <AppField
              label="Quantidade (opcional)"
              value={quantity}
              maxLength={80}
              onChangeText={setQuantity}
              placeholder="Ex.: 2 unidades, 1 kg"
            />
          ) : null}
          <AppField
            label="Observações (opcional)"
            value={notes}
            multiline
            maxLength={2000}
            onChangeText={setNotes}
          />
          <AppField
            label="Data limite (opcional)"
            value={dueDate}
            keyboardType="numbers-and-punctuation"
            onChangeText={setDueDate}
            hint="DD/MM/AAAA"
          />

          <View style={styles.block}>
            <Text selectable style={[styles.label, { color: colors.text }]}>
              Responsável
            </Text>
            <View style={styles.actions}>
              <AppButton
                label="Qualquer um"
                variant={assignedTo === null ? 'primary' : 'secondary'}
                selected={assignedTo === null}
                onPress={() => setAssignedTo(null)}
              />
              {spaceQuery.data.members.map((member) => (
                <AppButton
                  key={member.userId}
                  label={member.isMe ? 'Eu' : member.displayName}
                  variant={assignedTo === member.userId ? 'primary' : 'secondary'}
                  selected={assignedTo === member.userId}
                  onPress={() => setAssignedTo(member.userId)}
                />
              ))}
            </View>
          </View>

          {kind === 'tasks' ? (
            <View style={styles.block}>
              <Text selectable style={[styles.label, { color: colors.text }]}>
                Repetição
              </Text>
              <View style={styles.actions}>
                {(Object.keys(recurrenceLabels) as SharedRecurrence[]).map((option) => (
                  <AppButton
                    key={option}
                    label={recurrenceLabels[option]}
                    variant={recurrence === option ? 'primary' : 'secondary'}
                    selected={recurrence === option}
                    onPress={() => setRecurrence(option)}
                  />
                ))}
              </View>
            </View>
          ) : null}
          <AppButton
            label={kind === 'tasks' ? 'Adicionar tarefa' : 'Adicionar produto'}
            pending={createMutation.isPending}
            onPress={submit}
          />
        </AppCard>
      ) : null}

      <View style={styles.list}>
        {visibleItems.length === 0 && spaceQuery.data && !itemsQuery.isPending ? (
          <AppCard>
            <Text selectable style={[styles.cardTitle, { color: colors.text }]}>
              Lista vazia
            </Text>
            <Text selectable style={[styles.body, { color: colors.textMuted }]}>
              Adicione o primeiro item acima.
            </Text>
          </AppCard>
        ) : null}
        {visibleItems.map((item) => {
          const completed = item.status === 'completed';
          return (
            <AppCard key={item.item_id} tone={completed ? 'muted' : 'default'}>
              <View style={styles.itemHeader}>
                <Text
                  selectable
                  style={[
                    styles.itemTitle,
                    {
                      color: completed ? colors.textMuted : colors.text,
                      textDecorationLine: completed ? 'line-through' : 'none',
                    },
                  ]}
                >
                  {item.item_title}
                </Text>
                <Text
                  selectable
                  style={[styles.badge, { color: completed ? colors.success : colors.warning }]}
                >
                  {completed ? 'CONCLUÍDO' : 'PENDENTE'}
                </Text>
              </View>
              {item.quantity ? (
                <Text selectable style={[styles.body, { color: colors.text }]}>
                  Quantidade: {item.quantity}
                </Text>
              ) : null}
              {item.item_notes ? (
                <Text selectable style={[styles.body, { color: colors.textMuted }]}>
                  {item.item_notes}
                </Text>
              ) : null}
              <Text selectable style={[styles.meta, { color: colors.textMuted }]}>
                {item.assigned_name
                  ? `Responsável: ${item.assigned_name}`
                  : 'Qualquer um pode fazer'}
                {item.due_at ? ` · até ${formatDateTime(item.due_at)}` : ''}
                {item.recurrence !== 'none' ? ` · ${recurrenceLabels[item.recurrence]}` : ''}
              </Text>
              <View style={styles.actions}>
                <AppButton
                  label={completed ? 'Reabrir' : 'Concluir'}
                  variant={completed ? 'secondary' : 'primary'}
                  pending={toggleMutation.isPending}
                  onPress={() => toggleMutation.mutate({ item, completed: !completed })}
                />
                <AppButton
                  label="Excluir"
                  variant="danger"
                  disabled={deleteMutation.isPending}
                  onPress={() => deleteMutation.mutate(item)}
                />
              </View>
            </AppCard>
          );
        })}
      </View>
      <AppButton
        label="Atualizar listas"
        variant="ghost"
        disabled={!spaceQuery.data}
        onPress={() => void itemsQuery.refetch()}
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
  header: { gap: spacing.sm },
  kicker: { fontSize: 12, fontWeight: '800', letterSpacing: 1.3 },
  title: { fontFamily: typography.display, fontSize: 34, lineHeight: 40, fontWeight: '700' },
  subtitle: { maxWidth: 640, fontSize: 16, lineHeight: 25 },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cardTitle: { fontFamily: typography.display, fontSize: 22, fontWeight: '700' },
  itemTitle: {
    flexGrow: 1,
    flexBasis: 220,
    fontFamily: typography.display,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  itemHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  badge: { fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
  body: { fontSize: 14, lineHeight: 21 },
  meta: { fontSize: 12, lineHeight: 18 },
  block: { gap: spacing.sm },
  label: { fontSize: 14, lineHeight: 21, fontWeight: '700' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  list: { gap: spacing.md },
});
