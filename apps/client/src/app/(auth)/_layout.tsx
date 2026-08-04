import { Stack } from 'expo-router/stack';
import { useColorScheme } from 'react-native';

import { palette } from '@/constants/theme';

export default function AuthLayout() {
  const colors = useColorScheme() === 'dark' ? palette.dark : palette.light;

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
