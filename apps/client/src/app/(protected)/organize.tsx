import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import Head from 'expo-router/head';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { radii, spacing } from '@/constants/theme';
import { AppButton } from '@/design-system/app-button';
import { AppCard } from '@/design-system/app-card';
import { AppField } from '@/design-system/app-field';
import { AppScaffold } from '@/design-system/app-scaffold';
import { InlineNotice } from '@/design-system/inline-notice';
import { PageHeader } from '@/design-system/page-header';
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
  none: 'Não repetir',
  daily: 'Diariamente',
  weekly: 'Semanalmente',
  monthly: 'Mensalmente',
};

function ListItemRow({
  item,
  busy,
  onToggle,
  onDelete,
}: {
  item: SharedItem;
  busy: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const { colors } = useAppTheme();
  const completed = item.status === 'completed';
  return (
    <View style={[styles.itemRow, { borderColor: colors.border }]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: completed, disabled: busy }}
        disabled={busy}
        onPress={onToggle}
        style={({ pressed }) => [
          styles.checkbox,
          {
            backgroundColor: completed ? colors.success : 'transparent',
            borderColor: completed ? colors.success : colors.border,
            opacity: pressed ? 0.65 : 1,
          },
        ]}
      >
        {completed ? <Text style={[styles.checkmark, { color: colors.onBrand }]}>✓</Text> : null}
      </Pressable>
      <View style={styles.itemCopy}>
        <View style={styles.itemTitleRow}>
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
          {item.quantity ? (
            <Text
              style={[
                styles.quantity,
                { backgroundColor: colors.surfaceMuted, color: colors.text },
              ]}
            >
              {' '}
              {item.quantity}
            </Text>
          ) : null}
        </View>
        {item.item_notes ? (
          <Text
            selectable
            numberOfLines={2}
            style={[styles.itemNotes, { color: colors.textMuted }]}
          >
            {item.item_notes}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            {item.assigned_name ? `Responsável: ${item.assigned_name}` : 'Qualquer um'}
          </Text>
          {item.due_at ? (
            <Text style={[styles.meta, { color: colors.textMuted }]}>
              Até {formatDateTime(item.due_at)}
            </Text>
          ) : null}
          {item.recurrence !== 'none' ? (
            <Text style={[styles.meta, { color: colors.textMuted }]}>
              {recurrenceLabels[item.recurrence]}
            </Text>
          ) : null}
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Excluir ${item.item_title}`}
        disabled={busy}
        onPress={onDelete}
        style={({ pressed }) => [styles.deleteButton, { opacity: pressed ? 0.55 : 1 }]}
      >
        <Text style={[styles.deleteText, { color: colors.error }]}>Excluir</Text>
      </Pressable>
    </View>
  );
}

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
  const allItems = itemsQuery.data ?? [];
  const visibleItems = allItems.filter((item) => item.list_kind === kind);
  const openItems = visibleItems.filter((item) => item.status === 'open');
  const completedItems = visibleItems.filter((item) => item.status === 'completed');
  const taskCount = allItems.filter(
    (item) => item.list_kind === 'tasks' && item.status === 'open',
  ).length;
  const shoppingCount = allItems.filter(
    (item) => item.list_kind === 'shopping' && item.status === 'open',
  ).length;
  const mutationBusy = toggleMutation.isPending || deleteMutation.isPending;

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
    <AppScaffold active="organize">
      <Head>
        <title>Organização · EntreNós</title>
      </Head>
      <PageHeader
        eyebrow="Rotina compartilhada"
        title="Tarefas e compras"
        subtitle="Distribuam responsabilidades e mantenham a lista do mercado sempre atualizada nas duas contas."
        action={
          <AppButton
            label="Atualizar"
            variant="secondary"
            disabled={!spaceQuery.data}
            onPress={() => void itemsQuery.refetch()}
          />
        }
      />

      <View
        accessibilityRole="tablist"
        style={[styles.tabs, { backgroundColor: colors.surfaceMuted }]}
      >
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: kind === 'tasks' }}
          onPress={() => setKind('tasks')}
          style={[
            styles.tab,
            kind === 'tasks'
              ? { backgroundColor: colors.surface, boxShadow: '0 1px 3px rgba(16, 24, 40, 0.08)' }
              : null,
          ]}
        >
          {' '}
          <Text
            style={[styles.tabLabel, { color: kind === 'tasks' ? colors.brand : colors.textMuted }]}
          >
            Tarefas
          </Text>
          <Text
            style={[
              styles.tabCount,
              {
                backgroundColor: kind === 'tasks' ? `${colors.brand}15` : colors.border,
                color: kind === 'tasks' ? colors.brand : colors.textMuted,
              },
            ]}
          >
            {taskCount}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: kind === 'shopping' }}
          onPress={() => setKind('shopping')}
          style={[
            styles.tab,
            kind === 'shopping'
              ? { backgroundColor: colors.surface, boxShadow: '0 1px 3px rgba(16, 24, 40, 0.08)' }
              : null,
          ]}
        >
          {' '}
          <Text
            style={[
              styles.tabLabel,
              { color: kind === 'shopping' ? colors.brand : colors.textMuted },
            ]}
          >
            Compras
          </Text>
          <Text
            style={[
              styles.tabCount,
              {
                backgroundColor: kind === 'shopping' ? `${colors.brand}15` : colors.border,
                color: kind === 'shopping' ? colors.brand : colors.textMuted,
              },
            ]}
          >
            {shoppingCount}
          </Text>
        </Pressable>
      </View>

      {validationError ? <InlineNotice tone="warning">{validationError}</InlineNotice> : null}
      {activeError ? (
        <InlineNotice tone="error">{getFriendlyCoreError(activeError)}</InlineNotice>
      ) : null}
      {!spaceQuery.data && !spaceQuery.isPending ? (
        <AppCard tone="accent">
          <Text selectable style={[styles.panelTitle, { color: colors.text }]}>
            Conecte as duas contas primeiro
          </Text>
          <Text style={[styles.panelBody, { color: colors.textMuted }]}>
            As listas precisam de um espaço do casal para sincronizar.
          </Text>
          <AppButton label="Ir para conexão" onPress={() => router.push('/space')} />
        </AppCard>
      ) : null}

      {spaceQuery.data ? (
        <View style={styles.workspace}>
          <AppCard style={styles.listPanel}>
            <View style={styles.listHeading}>
              <View>
                <Text selectable style={[styles.panelTitle, { color: colors.text }]}>
                  {kind === 'tasks' ? 'Responsabilidades' : 'Lista do mercado'}
                </Text>
                <Text style={[styles.panelBody, { color: colors.textMuted }]}>
                  {openItems.length} pendente{openItems.length === 1 ? '' : 's'} ·{' '}
                  {completedItems.length} concluído{completedItems.length === 1 ? '' : 's'}
                </Text>
              </View>
            </View>
            {itemsQuery.isPending ? (
              <View style={styles.loading}>
                <ActivityIndicator color={colors.brand} />
                <Text style={{ color: colors.textMuted }}>Sincronizando lista…</Text>
              </View>
            ) : null}
            {!itemsQuery.isPending && visibleItems.length === 0 ? (
              <View style={styles.empty}>
                <View style={[styles.emptyIcon, { backgroundColor: `${colors.brand}12` }]}>
                  <Text style={[styles.emptyGlyph, { color: colors.brand }]}>
                    {kind === 'tasks' ? '✓' : '▣'}
                  </Text>
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Lista vazia</Text>
                <Text style={[styles.panelBody, { color: colors.textMuted }]}>
                  Adicione o primeiro item no painel ao lado.
                </Text>
              </View>
            ) : null}
            {openItems.map((item) => (
              <ListItemRow
                key={item.item_id}
                item={item}
                busy={mutationBusy}
                onToggle={() => toggleMutation.mutate({ item, completed: true })}
                onDelete={() => deleteMutation.mutate(item)}
              />
            ))}
            {completedItems.length > 0 ? (
              <View style={styles.completedHeading}>
                <Text style={[styles.completedLabel, { color: colors.textMuted }]}>
                  CONCLUÍDOS ({completedItems.length})
                </Text>
              </View>
            ) : null}
            {completedItems.map((item) => (
              <ListItemRow
                key={item.item_id}
                item={item}
                busy={mutationBusy}
                onToggle={() => toggleMutation.mutate({ item, completed: false })}
                onDelete={() => deleteMutation.mutate(item)}
              />
            ))}
          </AppCard>

          <AppCard tone="accent" style={styles.formPanel}>
            <View>
              <Text selectable style={[styles.panelTitle, { color: colors.text }]}>
                {kind === 'tasks' ? 'Nova tarefa' : 'Adicionar produto'}
              </Text>
              <Text style={[styles.panelBody, { color: colors.textMuted }]}>
                {kind === 'tasks'
                  ? 'Defina quem fará e quando.'
                  : 'O item aparece imediatamente para o casal.'}
              </Text>
            </View>
            <AppField
              label={kind === 'tasks' ? 'O que precisa ser feito?' : 'Qual produto?'}
              value={title}
              maxLength={160}
              onChangeText={setTitle}
              placeholder={kind === 'tasks' ? 'Ex.: Agendar revisão do carro' : 'Ex.: Café em pó'}
            />
            {kind === 'shopping' ? (
              <AppField
                label="Quantidade"
                value={quantity}
                maxLength={80}
                onChangeText={setQuantity}
                placeholder="Ex.: 2 unidades, 1 kg"
              />
            ) : null}
            <AppField
              label="Observações"
              value={notes}
              multiline
              maxLength={2000}
              onChangeText={setNotes}
              placeholder="Detalhes opcionais"
            />
            <AppField
              label="Data limite"
              value={dueDate}
              keyboardType="numbers-and-punctuation"
              onChangeText={setDueDate}
              hint="DD/MM/AAAA · opcional"
            />

            <View style={styles.formBlock}>
              <Text selectable style={[styles.formLabel, { color: colors.text }]}>
                Responsável
              </Text>
              <View style={styles.chips}>
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
              <View style={styles.formBlock}>
                <Text selectable style={[styles.formLabel, { color: colors.text }]}>
                  Repetição
                </Text>
                <View style={styles.chips}>
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
              fullWidth
              label={kind === 'tasks' ? 'Adicionar tarefa' : 'Adicionar produto'}
              pending={createMutation.isPending}
              onPress={submit}
            />
          </AppCard>
        </View>
      ) : null}
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  tabs: {
    alignSelf: 'flex-start',
    padding: 4,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: 4,
  },
  tab: {
    minHeight: 42,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tabLabel: { fontSize: 13, fontWeight: '800' },
  tabCount: {
    minWidth: 23,
    height: 23,
    borderRadius: 12,
    paddingHorizontal: 6,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 11,
    lineHeight: 23,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  workspace: {
    flexDirection: 'row',
    flexWrap: 'wrap-reverse',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  listPanel: { flexGrow: 2, flexBasis: 580, minWidth: 290 },
  formPanel: { flexGrow: 1, flexBasis: 340, minWidth: 290 },
  listHeading: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panelTitle: { fontSize: 19, lineHeight: 25, fontWeight: '800' },
  panelBody: { fontSize: 12, lineHeight: 18, marginTop: 3 },
  itemRow: {
    minHeight: 76,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: { fontSize: 14, lineHeight: 17, fontWeight: '900' },
  itemCopy: { flex: 1, minWidth: 0, gap: 3 },
  itemTitleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  itemTitle: { flexShrink: 1, fontSize: 14, lineHeight: 20, fontWeight: '800' },
  quantity: {
    borderRadius: radii.xs,
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 2,
    fontSize: 10,
    fontWeight: '800',
  },
  itemNotes: { fontSize: 12, lineHeight: 18 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  meta: { fontSize: 10, lineHeight: 16, fontWeight: '600' },
  deleteButton: { minHeight: 34, paddingHorizontal: spacing.sm, justifyContent: 'center' },
  deleteText: { fontSize: 11, fontWeight: '800' },
  completedHeading: { paddingTop: spacing.md },
  completedLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  formBlock: { gap: spacing.sm },
  formLabel: { fontSize: 12, lineHeight: 18, fontWeight: '800' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  loading: { minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  empty: { minHeight: 260, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyGlyph: { fontSize: 24, fontWeight: '900' },
  emptyTitle: { fontSize: 17, fontWeight: '800' },
});
