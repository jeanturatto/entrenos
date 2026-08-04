import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { spacing, typography } from '@/constants/theme';
import { AppButton } from '@/design-system/app-button';
import { AppCard } from '@/design-system/app-card';
import { AppField } from '@/design-system/app-field';
import { FeedbackState } from '@/design-system/feedback-state';
import { InlineNotice } from '@/design-system/inline-notice';
import { ScreenShell } from '@/design-system/screen-shell';
import { useAppTheme } from '@/design-system/theme-provider';

type ActionConfig = {
  eyebrow: string;
  title: string;
  description: string;
  fieldLabel: string;
  fieldPlaceholder: string;
  submitLabel: string;
  successTitle: string;
};

const actionConfigs: Record<string, ActionConfig> = {
  proposal: {
    eyebrow: 'NOVA PROPOSTA',
    title: 'O que vocês querem combinar?',
    description: 'A outra pessoa poderá aceitar, recusar ou sugerir uma alteração.',
    fieldLabel: 'Título da proposta',
    fieldPlaceholder: 'Ex.: Jantar na sexta-feira',
    submitLabel: 'Concluir simulação',
    successTitle: 'Proposta preparada',
  },
  calendar: {
    eyebrow: 'COMPROMISSO',
    title: 'Proponha um horário conjunto.',
    description: 'A agenda só será alterada após a resposta da outra pessoa.',
    fieldLabel: 'Compromisso',
    fieldPlaceholder: 'Ex.: Consulta às 15h',
    submitLabel: 'Concluir simulação',
    successTitle: 'Compromisso preparado',
  },
  task: {
    eyebrow: 'NOVA TAREFA',
    title: 'Defina uma responsabilidade clara.',
    description: 'Responsável e prazo serão confirmados antes de entrar no espaço conjunto.',
    fieldLabel: 'Tarefa',
    fieldPlaceholder: 'Ex.: Organizar documentos',
    submitLabel: 'Concluir simulação',
    successTitle: 'Tarefa preparada',
  },
  list: {
    eyebrow: 'NOVO ITEM',
    title: 'Acrescente algo à lista conjunta.',
    description: 'Itens pessoais continuam fora da visão da outra pessoa.',
    fieldLabel: 'Item',
    fieldPlaceholder: 'Ex.: Café',
    submitLabel: 'Concluir simulação',
    successTitle: 'Item preparado',
  },
  expense: {
    eyebrow: 'NOVO GASTO',
    title: 'Escolha conscientemente o que compartilhar.',
    description: 'Nesta simulação, nenhum valor financeiro real será solicitado ou armazenado.',
    fieldLabel: 'Descrição do gasto',
    fieldPlaceholder: 'Ex.: Mercado',
    submitLabel: 'Concluir simulação',
    successTitle: 'Gasto preparado',
  },
  invite: {
    eyebrow: 'CONVITE',
    title: 'Inicie uma conexão respeitosa.',
    description: 'A outra pessoa verá o convite antes de qualquer dado compartilhado.',
    fieldLabel: 'E-mail da pessoa',
    fieldPlaceholder: 'pessoa@exemplo.com',
    submitLabel: 'Concluir simulação',
    successTitle: 'Convite preparado',
  },
  confirmation: {
    eyebrow: 'EXEMPLO DE MODAL',
    title: 'Revise antes de confirmar.',
    description: 'Este padrão será usado quando uma decisão precisar de contexto adicional.',
    fieldLabel: 'Observação opcional',
    fieldPlaceholder: 'Escreva algo para testar o campo',
    submitLabel: 'Confirmar exemplo',
    successTitle: 'Exemplo confirmado',
  },
};

const defaultConfig = actionConfigs.confirmation!;

export default function PrototypeActionScreen() {
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{ kind?: string }>();
  const config = actionConfigs[typeof params.kind === 'string' ? params.kind : ''] ?? defaultConfig;
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [completed, setCompleted] = useState(false);

  const submit = () => {
    const isOptional = config === actionConfigs.confirmation;

    if (!isOptional && value.trim().length < 3) {
      setError('Escreva pelo menos 3 caracteres para continuar.');
      return;
    }

    setError(undefined);
    setCompleted(true);
  };

  if (completed) {
    return (
      <ScreenShell width="reading">
        <FeedbackState
          tone="success"
          title={config.successTitle}
          description="O fluxo foi validado somente neste dispositivo. Nenhuma informação foi enviada ao banco de dados."
          actionLabel="Voltar ao protótipo"
          onAction={() => router.back()}
        />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell width="reading" keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text selectable style={[styles.kicker, { color: colors.accent }]}>
          {config.eyebrow}
        </Text>
        <Text selectable style={[styles.title, { color: colors.text }]}>
          {config.title}
        </Text>
        <Text selectable style={[styles.description, { color: colors.textMuted }]}>
          {config.description}
        </Text>
      </View>

      <InlineNotice tone="warning" title="Somente demonstração">
        Concluir este exemplo não cria convite, compromisso, tarefa ou gasto real.
      </InlineNotice>

      <AppCard>
        <AppField
          label={config.fieldLabel}
          placeholder={config.fieldPlaceholder}
          value={value}
          onChangeText={(nextValue) => {
            setValue(nextValue);
            if (error) setError(undefined);
          }}
          error={error}
          autoCapitalize={params.kind === 'invite' ? 'none' : 'sentences'}
          inputMode={params.kind === 'invite' ? 'email' : 'text'}
          multiline={params.kind === 'confirmation'}
        />
        <View style={styles.actions}>
          <AppButton label={config.submitLabel} onPress={submit} />
          <AppButton label="Fechar sem salvar" variant="secondary" onPress={() => router.back()} />
        </View>
      </AppCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm, paddingTop: spacing.lg },
  kicker: { fontSize: 12, lineHeight: 18, fontWeight: '800', letterSpacing: 1.35 },
  title: { fontFamily: typography.display, fontSize: 34, lineHeight: 41, fontWeight: '700' },
  description: { fontSize: 16, lineHeight: 25 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
