import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppThemeProvider, useAppTheme } from '@/design-system/theme-provider';
import { AuthProvider, useAuth } from '@/providers/auth-provider';

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function AppNavigator() {
  const { session, isLoading } = useAuth();
  const { colors, isDark } = useAppTheme();
  const baseNavigationTheme = isDark ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseNavigationTheme,
    colors: {
      ...baseNavigationTheme.colors,
      background: colors.background,
      card: colors.surface,
      border: colors.border,
      primary: colors.brand,
      text: colors.text,
      notification: colors.accent,
    },
  };

  useEffect(() => {
    if (!isLoading) {
      void SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'EntreNós' }} />
        <Stack.Screen name="principles" options={{ title: 'Princípios · EntreNós' }} />
        <Stack.Screen name="design-system" options={{ title: 'Sistema visual · EntreNós' }} />
        <Stack.Screen name="prototype" options={{ title: 'Protótipo · EntreNós' }} />
        <Stack.Screen
          name="prototype-action"
          options={{
            title: 'Nova ação',
            presentation: 'modal',
            headerShown: true,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            headerBackButtonDisplayMode: 'minimal',
          }}
        />

        <Stack.Protected guard={isLoading || !session}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected guard={isLoading || Boolean(session)}>
          <Stack.Screen name="(protected)" />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppNavigator />
          </AuthProvider>
        </QueryClientProvider>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}
