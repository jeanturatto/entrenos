import { z } from 'zod';

const publicEnvironmentSchema = z.object({
  supabaseUrl: z.url(),
  supabaseAnonKey: z
    .string()
    .min(20)
    .refine((value) => !value.startsWith('substitua-'), 'Use a chave real do ambiente'),
});

function readPublicEnvironment() {
  return publicEnvironmentSchema.safeParse({
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  });
}

export function isBackendConfigured() {
  return readPublicEnvironment().success;
}

export function requirePublicEnvironment() {
  const result = readPublicEnvironment();

  if (!result.success) {
    throw new Error(
      'Supabase não configurado. Copie apps/client/.env.example para apps/client/.env.local e preencha as chaves.',
    );
  }

  return result.data;
}
