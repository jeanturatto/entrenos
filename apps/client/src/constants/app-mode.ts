export type AppMode = 'client' | 'studio';

export function resolveAppMode(value: string | undefined): AppMode {
  return value === 'studio' ? 'studio' : 'client';
}

export const appMode = resolveAppMode(process.env.EXPO_PUBLIC_APP_MODE);
export const isStudioMode = appMode === 'studio';
