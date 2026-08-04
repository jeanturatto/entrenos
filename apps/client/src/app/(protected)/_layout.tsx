import { Stack } from 'expo-router/stack';
import { useColorScheme } from 'react-native';

import { palette } from '@/constants/theme';

export default function ProtectedLayout() {
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
      <Stack.Screen name="dashboard" options={{ title: 'Seu espaço', headerBackVisible: false }} />
      <Stack.Screen name="update-password" options={{ title: 'Nova senha' }} />
    </Stack>
  );
}
