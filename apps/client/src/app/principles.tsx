import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { BrandMark } from '@/components/brand-mark';
import { spacing, typography } from '@/constants/theme';
import { AppButton } from '@/design-system/app-button';
import { AppCard } from '@/design-system/app-card';
import { ScreenShell } from '@/design-system/screen-shell';
import { useAppTheme } from '@/design-system/theme-provider';

const principles = [
  {
    number: '01',
    title: 'Privacidade',
    description: 'Compartilhar a vida não significa abrir mão da individualidade.',
  },
  {
    number: '02',
    title: 'Consentimento',
    description: 'Nenhum recurso sensível ou compromisso conjunto é ativado silenciosamente.',
  },
  {
    number: '03',
    title: 'Igualdade',
    description: 'Os dois membros têm os mesmos direitos básicos dentro do espaço do casal.',
  },
  {
    number: '04',
    title: 'Transparência',
    description: 'Mudanças importantes mostram quem alterou, quando e o que mudou.',
  },
] as const;

export default function PrinciplesScreen() {
  const { colors } = useAppTheme();

  return (
    <ScreenShell width="reading">
      <View style={styles.header}>
        <AppButton
          label="Voltar"
          variant="secondary"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        />
        <BrandMark compact />
      </View>

      <View style={styles.intro}>
        <Text selectable style={[styles.kicker, { color: colors.accent }]}>
          NOSSO ACORDO
        </Text>
        <Text selectable style={[styles.title, { color: colors.text }]}>
          Projetado para cuidar do vínculo e de cada pessoa.
        </Text>
        <Text selectable style={[styles.subtitle, { color: colors.textMuted }]}>
          Estes princípios orientarão as telas, o banco de dados e todas as permissões do EntreNós.
        </Text>
      </View>

      <View style={styles.grid}>
        {principles.map((principle) => (
          <AppCard key={principle.number} style={styles.card}>
            <Text selectable style={[styles.number, { color: colors.accent }]}>
              {principle.number}
            </Text>
            <Text selectable style={[styles.cardTitle, { color: colors.text }]}>
              {principle.title}
            </Text>
            <Text selectable style={[styles.cardDescription, { color: colors.textMuted }]}>
              {principle.description}
            </Text>
          </AppCard>
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  intro: { maxWidth: 650, paddingTop: spacing.lg, gap: spacing.md },
  kicker: { fontSize: 12, fontWeight: '800', letterSpacing: 1.4 },
  title: {
    fontFamily: typography.display,
    fontSize: 42,
    lineHeight: 49,
    fontWeight: '700',
    letterSpacing: -1.3,
  },
  subtitle: { fontSize: 17, lineHeight: 27 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  card: {
    minWidth: 250,
    flexBasis: 310,
    flexGrow: 1,
    gap: spacing.sm,
  },
  number: { fontSize: 12, fontWeight: '800', letterSpacing: 1.2 },
  cardTitle: { fontFamily: typography.display, fontSize: 24, fontWeight: '700' },
  cardDescription: { fontSize: 15, lineHeight: 23 },
});
