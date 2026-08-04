import type { AuthError } from '@supabase/supabase-js';

const authMessages: Record<string, string> = {
  email_address_invalid: 'Digite um e-mail válido.',
  email_exists: 'Já existe uma conta com este e-mail.',
  email_not_confirmed: 'Confirme seu e-mail antes de entrar.',
  invalid_credentials: 'E-mail ou senha incorretos.',
  over_email_send_rate_limit: 'Muitos e-mails foram solicitados. Aguarde alguns minutos.',
  over_request_rate_limit: 'Muitas tentativas. Aguarde um pouco e tente novamente.',
  signup_disabled: 'Novos cadastros estão temporariamente indisponíveis.',
  user_already_exists: 'Já existe uma conta com este e-mail.',
  weak_password: 'Use uma senha mais forte e atenda a todos os requisitos.',
};

export function getAuthErrorMessage(error: AuthError) {
  return authMessages[error.code ?? ''] ?? 'Não foi possível concluir. Tente novamente.';
}
