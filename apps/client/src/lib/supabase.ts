import 'react-native-url-polyfill/auto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { authStorage } from '@/lib/auth-storage';
import { requirePublicEnvironment } from '@/lib/env';

let client: SupabaseClient | undefined;

export function getSupabaseClient() {
  if (!client) {
    const environment = requirePublicEnvironment();
    client = createClient(environment.supabaseUrl, environment.supabasePublishableKey, {
      auth: {
        storage: authStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
  }

  return client;
}
