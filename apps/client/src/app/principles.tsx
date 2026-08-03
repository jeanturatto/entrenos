import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { maxContentWidth, palette, radii, spacing, typography } from '@/constants/theme';

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
  const colors = useColorScheme() === 'dark' ? palette.dark : palette.light;

  return (
    <View style={[styles.page, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Voltar para a tela inicial"
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: pressed ? 0.72 : 1,
                },
              ]}
            >
              <Text style={[styles.backText, { color: colors.text }]}>← Voltar</Text>
            </Pressable>
            <BrandMark color={colors.brand} compact />
          </View>

          <View style={styles.intro}>
            <Text style={[styles.kicker, { color: colors.accent }]}>NOSSO ACORDO</Text>
            <Text style={[styles.title, { color: colors.text }]}>
              Projetado para cuidar do vínculo e de cada pessoa.
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Estes princípios orientarão as telas, o banco de dados e todas as permissões do
              EntreNós.
            </Text>
          </View>

          <View style={styles.grid}>
            {principles.map((principle) => (
              <View
                key={principle.number}
                style={[
                  styles.card,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.number, { color: colors.accent }]}>{principle.number}</Text>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{principle.title}</Text>
                <Text style={[styles.cardDescription, { color: colors.textMuted }]}>
                  {principle.description}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  safeArea: { flex: 1 },
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: maxContentWidth,
    minHeight: '100%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.pill,
  },
  backText: { fontSize: 14, fontWeight: '700' },
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
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.lg,
    gap: spacing.sm,
  },
  number: { fontSize: 12, fontWeight: '800', letterSpacing: 1.2 },
  cardTitle: { fontFamily: typography.display, fontSize: 24, fontWeight: '700' },
  cardDescription: { fontSize: 15, lineHeight: 23 },
});
