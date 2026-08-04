import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import Head from 'expo-router/head';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { maxContentWidth, spacing, typography } from '@/constants/theme';
import { AppButton } from '@/design-system/app-button';
import { AppCard } from '@/design-system/app-card';
import { AppField } from '@/design-system/app-field';
import { InlineNotice } from '@/design-system/inline-notice';
import { useAppTheme } from '@/design-system/theme-provider';
import {
  createCalendarEvent,
  getFriendlyCoreError,
  type EventVisibility,
} from '@/features/core/api';
import { formatDateInput, formatTimeInput, parseLocalDateTime } from '@/features/core/date-time';

const visibilityOptions: { value: EventVisibility; label: string; description: string }[] = [
  { value: 'full', label: 'Compartilhado', description: 'Seu par vê tudo e precisa responder.' },
  { value: 'title_only', label: 'Só título', description: 'Seu par vê horário e título.' },
  {
    value: 'busy_only',
    label: 'Só ocupado',
    description: 'Seu par vê apenas que o horário está ocupado.',
  },
  { value: 'private', label: 'Privado', description: 'Somente você vê este compromisso.' },
];

export default function NewEventScreen() {
  const { colors } = useAppTheme();
  const queryClient = useQueryClient();
  const defaults = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(19, 0, 0, 0);
    const end = new Date(start);
    end.setHours(20, 0, 0, 0);
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
      router.back();
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

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <Head>
        <title>Novo compromisso · EntreNós</title>
      </Head>
      <View style={styles.intro}>
        <Text selectable style={[styles.kicker, { color: colors.accent }]}>
          NOVO COMPROMISSO
        </Text>
        <Text selectable style={[styles.title, { color: colors.text }]}>
          O que vai acontecer?
        </Text>
      </View>
      {validationError ? <InlineNotice tone="warning">{validationError}</InlineNotice> : null}
      {mutation.error ? (
        <InlineNotice tone="error">{getFriendlyCoreError(mutation.error)}</InlineNotice>
      ) : null}
      <AppCard>
        <AppField
          label="Título"
          value={title}
          maxLength={120}
          onChangeText={setTitle}
          placeholder="Ex.: Jantar, consulta, viagem"
        />
        <AppField
          label="Descrição (opcional)"
          value={description}
          multiline
          maxLength={2000}
          onChangeText={setDescription}
        />
        <AppField
          label="Local (opcional)"
          value={location}
          maxLength={200}
          onChangeText={setLocation}
        />
        <View style={styles.fieldsRow}>
          <View style={styles.fieldGrow}>
            <AppField
              label="Data"
              value={date}
              keyboardType="numbers-and-punctuation"
              onChangeText={setDate}
              hint="DD/MM/AAAA"
            />
          </View>
          <View style={styles.fieldSmall}>
            <AppField
              label="Início"
              value={startTime}
              keyboardType="numbers-and-punctuation"
              onChangeText={setStartTime}
              hint="HH:MM"
            />
          </View>
          <View style={styles.fieldSmall}>
            <AppField
              label="Fim"
              value={endTime}
              keyboardType="numbers-and-punctuation"
              onChangeText={setEndTime}
              hint="HH:MM"
            />
          </View>
        </View>
      </AppCard>
      <AppCard>
        <Text selectable style={[styles.cardTitle, { color: colors.text }]}>
          Privacidade
        </Text>
        {visibilityOptions.map((option) => (
          <View key={option.value} style={styles.option}>
            <AppButton
              label={option.label}
              variant={visibility === option.value ? 'primary' : 'secondary'}
              selected={visibility === option.value}
              onPress={() => setVisibility(option.value)}
            />
            <Text selectable style={[styles.body, { color: colors.textMuted }]}>
              {option.description}
            </Text>
          </View>
        ))}
      </AppCard>
      <View style={styles.actions}>
        <AppButton label="Salvar compromisso" pending={mutation.isPending} onPress={submit} />
        <AppButton
          label="Cancelar"
          variant="ghost"
          disabled={mutation.isPending}
          onPress={() => router.back()}
        />
      </View>
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
  intro: { gap: spacing.sm },
  kicker: { fontSize: 12, fontWeight: '800', letterSpacing: 1.3 },
  title: { fontFamily: typography.display, fontSize: 34, lineHeight: 40, fontWeight: '700' },
  cardTitle: { fontFamily: typography.display, fontSize: 22, fontWeight: '700' },
  fieldsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  fieldGrow: { flexGrow: 2, flexBasis: 190 },
  fieldSmall: { flexGrow: 1, flexBasis: 120 },
  option: { gap: spacing.sm, alignItems: 'flex-start' },
  body: { fontSize: 14, lineHeight: 21 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
