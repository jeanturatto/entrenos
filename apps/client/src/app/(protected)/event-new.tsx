import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import Head from 'expo-router/head';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radii, spacing } from '@/constants/theme';
import { AppButton } from '@/design-system/app-button';
import { AppCard } from '@/design-system/app-card';
import { AppField } from '@/design-system/app-field';
import { AppScaffold } from '@/design-system/app-scaffold';
import { InlineNotice } from '@/design-system/inline-notice';
import { PageHeader } from '@/design-system/page-header';
import { useAppTheme } from '@/design-system/theme-provider';
import {
  createCalendarEvent,
  getFriendlyCoreError,
  type EventVisibility,
} from '@/features/core/api';
import { formatDateInput, formatTimeInput, parseLocalDateTime } from '@/features/core/date-time';

const visibilityOptions: {
  value: EventVisibility;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    value: 'full',
    label: 'Do casal',
    description: 'Seu par vê todos os detalhes e precisa responder.',
    icon: '♡',
  },
  {
    value: 'title_only',
    label: 'Título visível',
    description: 'Seu par vê o título e o horário, sem detalhes.',
    icon: 'T',
  },
  {
    value: 'busy_only',
    label: 'Somente ocupado',
    description: 'O horário fica bloqueado sem revelar o motivo.',
    icon: '■',
  },
  {
    value: 'private',
    label: 'Somente eu',
    description: 'O compromisso aparece apenas na sua agenda.',
    icon: '●',
  },
];

export default function NewEventScreen() {
  const { colors } = useAppTheme();
  const queryClient = useQueryClient();
  const defaults = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setMinutes(0, 0, 0);
    start.setHours(Math.max(9, start.getHours() + 1));
    const end = new Date(start);
    end.setHours(end.getHours() + 1);
    return {
      date: formatDateInput(start),
      start: formatTimeInput(start),
      end: formatTimeInput(end),
    };
  }, []);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(defaults.date);
  const [startTime, setStartTime] = useState(defaults.start);
  const [endTime, setEndTime] = useState(defaults.end);
  const [visibility, setVisibility] = useState<EventVisibility>('full');
  const [validationError, setValidationError] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: ({ startsAt, endsAt }: { startsAt: Date; endsAt: Date }) =>
      createCalendarEvent({ title, description, location, startsAt, endsAt, visibility }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['calendar'] });
      router.replace('/calendar');
    },
  });

  const submit = () => {
    setValidationError(null);
    const startsAt = parseLocalDateTime(date, startTime);
    const endsAt = parseLocalDateTime(date, endTime);
    if (!title.trim()) return setValidationError('Informe o título do compromisso.');
    if (!startsAt || !endsAt) return setValidationError('Use data DD/MM/AAAA e horários HH:MM.');
    if (endsAt <= startsAt)
      return setValidationError('O horário final precisa ser depois do inicial.');
    mutation.mutate({ startsAt, endsAt });
  };
  const visibilityOption = visibilityOptions.find((option) => option.value === visibility)!;

  return (
    <AppScaffold active="add">
      <Head>
        <title>Novo compromisso · EntreNós</title>
      </Head>
      <PageHeader
        eyebrow="Novo compromisso"
        title="Adicionar à agenda"
        subtitle="Escolha o que seu par poderá ver. Compromissos do casal só são confirmados com a concordância dos dois."
      />
      {validationError ? <InlineNotice tone="warning">{validationError}</InlineNotice> : null}
      {mutation.error ? (
        <InlineNotice tone="error">{getFriendlyCoreError(mutation.error)}</InlineNotice>
      ) : null}

      <View style={styles.workspace}>
        <View style={styles.formColumn}>
          <AppCard>
            <View style={styles.sectionHeading}>
              <View style={[styles.stepNumber, { backgroundColor: `${colors.brand}15` }]}>
                <Text style={[styles.stepText, { color: colors.brand }]}>1</Text>
              </View>
              <View>
                <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>
                  Informações principais
                </Text>
                <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
                  Comece pelo essencial; detalhes podem ser opcionais.
                </Text>
              </View>
            </View>
            <AppField
              label="Título"
              value={title}
              maxLength={120}
              onChangeText={setTitle}
              placeholder="Ex.: Jantar no centro"
            />
            <View style={styles.fieldsRow}>
              <View style={styles.dateField}>
                <AppField
                  label="Data"
                  value={date}
                  keyboardType="numbers-and-punctuation"
                  onChangeText={setDate}
                  hint="DD/MM/AAAA"
                />
              </View>
              <View style={styles.timeField}>
                <AppField
                  label="Início"
                  value={startTime}
                  keyboardType="numbers-and-punctuation"
                  onChangeText={setStartTime}
                  hint="HH:MM"
                />
              </View>
              <View style={styles.timeField}>
                <AppField
                  label="Fim"
                  value={endTime}
                  keyboardType="numbers-and-punctuation"
                  onChangeText={setEndTime}
                  hint="HH:MM"
                />
              </View>
            </View>
            <AppField
              label="Local"
              value={location}
              maxLength={200}
              onChangeText={setLocation}
              placeholder="Nome do local ou endereço"
            />
            <AppField
              label="Descrição"
              value={description}
              multiline
              maxLength={2000}
              onChangeText={setDescription}
              placeholder="Adicione observações, combinados ou links"
            />
          </AppCard>

          <AppCard>
            <View style={styles.sectionHeading}>
              <View style={[styles.stepNumber, { backgroundColor: `${colors.brand}15` }]}>
                <Text style={[styles.stepText, { color: colors.brand }]}>2</Text>
              </View>
              <View>
                <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>
                  Quem pode ver?
                </Text>
                <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
                  A privacidade é aplicada no banco, não apenas na tela.
                </Text>
              </View>
            </View>
            <View style={styles.privacyGrid}>
              {visibilityOptions.map((option) => {
                const selected = visibility === option.value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    onPress={() => setVisibility(option.value)}
                    style={({ pressed }) => [
                      styles.privacyOption,
                      {
                        backgroundColor: selected ? `${colors.brand}0e` : colors.surface,
                        borderColor: selected ? colors.brand : colors.border,
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.privacyIcon,
                        { backgroundColor: selected ? `${colors.brand}18` : colors.surfaceMuted },
                      ]}
                    >
                      <Text
                        style={[
                          styles.privacyGlyph,
                          { color: selected ? colors.brand : colors.textMuted },
                        ]}
                      >
                        {option.icon}
                      </Text>
                    </View>
                    <View style={styles.grow}>
                      <Text style={[styles.privacyTitle, { color: colors.text }]}>
                        {option.label}
                      </Text>
                      <Text style={[styles.privacyDescription, { color: colors.textMuted }]}>
                        {option.description}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.radio,
                        { borderColor: selected ? colors.brand : colors.border },
                      ]}
                    >
                      {selected ? (
                        <View style={[styles.radioInner, { backgroundColor: colors.brand }]} />
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </AppCard>
        </View>

        <AppCard tone="accent" style={styles.summaryCard}>
          <Text style={[styles.summaryEyebrow, { color: colors.brand }]}>RESUMO</Text>
          <Text selectable numberOfLines={3} style={[styles.summaryTitle, { color: colors.text }]}>
            {title.trim() || 'Novo compromisso'}
          </Text>
          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryIcon, { color: colors.brand }]}>□</Text>
            <View>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>DATA E HORÁRIO</Text>
              <Text selectable style={[styles.summaryValue, { color: colors.text }]}>
                {date} · {startTime}–{endTime}
              </Text>
            </View>
          </View>
          {location.trim() ? (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryIcon, { color: colors.brand }]}>⌖</Text>
              <View style={styles.grow}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>LOCAL</Text>
                <Text selectable style={[styles.summaryValue, { color: colors.text }]}>
                  {location}
                </Text>
              </View>
            </View>
          ) : null}
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryIcon, { color: colors.brand }]}>
              {visibilityOption.icon}
            </Text>
            <View style={styles.grow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>PRIVACIDADE</Text>
              <Text selectable style={[styles.summaryValue, { color: colors.text }]}>
                {visibilityOption.label}
              </Text>
              <Text style={[styles.summaryHelper, { color: colors.textMuted }]}>
                {visibility === 'full'
                  ? 'Será enviado como proposta ao seu par.'
                  : 'Será salvo diretamente na sua agenda.'}
              </Text>
            </View>
          </View>
          <AppButton
            fullWidth
            label={visibility === 'full' ? 'Enviar proposta' : 'Salvar compromisso'}
            pending={mutation.isPending}
            onPress={submit}
          />
          <AppButton
            fullWidth
            label="Cancelar"
            variant="ghost"
            disabled={mutation.isPending}
            onPress={() => router.back()}
          />
        </AppCard>
      </View>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  workspace: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: spacing.md },
  formColumn: { flexGrow: 2, flexBasis: 620, minWidth: 290, gap: spacing.md },
  summaryCard: { flexGrow: 1, flexBasis: 310, minWidth: 280 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: 15, fontWeight: '900' },
  sectionTitle: { fontSize: 18, lineHeight: 24, fontWeight: '800' },
  sectionHint: { fontSize: 11, lineHeight: 17, marginTop: 2 },
  fieldsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  dateField: { flexGrow: 2, flexBasis: 190 },
  timeField: { flexGrow: 1, flexBasis: 120 },
  privacyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  privacyOption: {
    flexGrow: 1,
    flexBasis: 270,
    minWidth: 250,
    minHeight: 92,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  privacyIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyGlyph: { fontSize: 16, fontWeight: '900' },
  privacyTitle: { fontSize: 13, lineHeight: 19, fontWeight: '800' },
  privacyDescription: { fontSize: 11, lineHeight: 17, marginTop: 3 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  grow: { flex: 1, minWidth: 0 },
  summaryEyebrow: { fontSize: 10, lineHeight: 16, fontWeight: '900', letterSpacing: 0.9 },
  summaryTitle: { fontSize: 23, lineHeight: 29, fontWeight: '800' },
  summaryDivider: { height: StyleSheet.hairlineWidth },
  summaryRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  summaryIcon: { width: 22, fontSize: 18, fontWeight: '900' },
  summaryLabel: { fontSize: 9, lineHeight: 14, fontWeight: '900', letterSpacing: 0.6 },
  summaryValue: { fontSize: 13, lineHeight: 20, fontWeight: '700', marginTop: 2 },
  summaryHelper: { fontSize: 11, lineHeight: 17, marginTop: 3 },
});
