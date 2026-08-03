import 'react-native-url-polyfill/auto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { requirePublicEnvironment } from '@/lib/env';

let client: SupabaseClient | undefined;

export function getSupabaseClient() {
  if (!client) {
    const environment = requirePublicEnvironment();
    client = createClient(environment.supabaseUrl, environment.supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  return client;
}
