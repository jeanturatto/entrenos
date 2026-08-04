import React, { createContext, useMemo, useState, type PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';

import { palette, type AppPalette, type ThemeName } from '@/constants/theme';

export type ThemePreference = 'system' | ThemeName;

type AppThemeContextValue = {
  colors: AppPalette;
  isDark: boolean;
  preference: ThemePreference;
  resolvedTheme: ThemeName;
  setPreference: (preference: ThemePreference) => void;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemTheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const [preference, setPreference] = useState<ThemePreference>('system');
  const resolvedTheme = preference === 'system' ? systemTheme : preference;

  const value = useMemo<AppThemeContextValue>(
    () => ({
      colors: palette[resolvedTheme],
      isDark: resolvedTheme === 'dark',
      preference,
      resolvedTheme,
      setPreference,
    }),
    [preference, resolvedTheme],
  );

  return <AppThemeContext value={value}>{children}</AppThemeContext>;
}

export function useAppTheme() {
  const context = React.use(AppThemeContext);

  if (!context) {
    throw new Error('useAppTheme precisa estar dentro de AppThemeProvider.');
  }

  return context;
}
