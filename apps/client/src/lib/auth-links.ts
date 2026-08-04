import { getSupabaseClient } from '@/lib/supabase';

type AuthLinkResult = {
  handled: boolean;
  isPasswordRecovery: boolean;
};

function getAuthParameters(url: string) {
  const parsedUrl = new URL(url);
  const parameters = new URLSearchParams(parsedUrl.search);
  const hashParameters = new URLSearchParams(parsedUrl.hash.replace(/^#/, ''));

  hashParameters.forEach((value, key) => parameters.set(key, value));

  return parameters;
}

export async function restoreSessionFromUrl(url: string): Promise<AuthLinkResult> {
  const parameters = getAuthParameters(url);
  const errorDescription = parameters.get('error_description');

  if (errorDescription) {
    throw new Error(errorDescription);
  }

  const type = parameters.get('type');
  const isPasswordRecovery = type === 'recovery';
  const code = parameters.get('code');

  if (code) {
    const { error } = await getSupabaseClient().auth.exchangeCodeForSession(code);

    if (error) {
      throw error;
    }

    return { handled: true, isPasswordRecovery };
  }

  const accessToken = parameters.get('access_token');
  const refreshToken = parameters.get('refresh_token');

  if (!accessToken || !refreshToken) {
    return { handled: false, isPasswordRecovery: false };
  }

  const { error } = await getSupabaseClient().auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    throw error;
  }

  return { handled: true, isPasswordRecovery };
}
