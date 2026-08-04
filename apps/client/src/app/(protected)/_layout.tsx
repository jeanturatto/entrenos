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
      <Stack.Screen name="update-password" options={{ title: 'Nova senha' }} />
    </Stack>
  );
}
