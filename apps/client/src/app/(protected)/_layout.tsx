import { Stack } from 'expo-router/stack';

import { useAppTheme } from '@/design-system/theme-provider';

export default function ProtectedLayout() {
  const { colors } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="dashboard" options={{ title: 'Seu espaço', headerBackVisible: false }} />
      <Stack.Screen name="space" options={{ title: 'Espaço do casal' }} />
      <Stack.Screen name="calendar" options={{ title: 'Agenda' }} />
      <Stack.Screen name="event-new" options={{ title: 'Novo compromisso' }} />
      <Stack.Screen name="organize" options={{ title: 'Tarefas e compras' }} />
      <Stack.Screen name="update-password" options={{ title: 'Nova senha' }} />
    </Stack>
  );
}
