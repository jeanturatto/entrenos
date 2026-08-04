import { Stack } from 'expo-router/stack';

import { useAppTheme } from '@/design-system/theme-provider';

export default function AuthLayout() {
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
      <Stack.Screen name="sign-in" options={{ title: 'Entrar' }} />
      <Stack.Screen name="sign-up" options={{ title: 'Criar conta' }} />
      <Stack.Screen name="forgot-password" options={{ title: 'Recuperar acesso' }} />
    </Stack>
  );
}
