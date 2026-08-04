import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  AuthScreen,
  FormField,
  InlineNotice,
  PrimaryButton,
  authFormStyles,
} from '@/components/auth-screen';
import { useAppTheme } from '@/design-system/theme-provider';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { validateEmail } from '@/lib/auth-validation';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

export default function SignInScreen() {
  const { colors } = useAppTheme();
  const { linkError, clearLinkError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const signIn = async () => {
    clearLinkError();
    setError(null);

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    if (!password) {
      setError('Digite sua senha.');
      return;
    }

    setPending(true);
    const { data, error: authError } = await getSupabaseClient().auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setPending(false);

    if (authError) {
      setError(getAuthErrorMessage(authError));
      return;
    }

    if (data.session) {
      router.replace('/dashboard');
    }
  };

  return (
    <AuthScreen
      eyebrow="BEM-VINDO DE VOLTA"
      title="Entre no seu espaço com tranquilidade."
      description="Sua sessão fica protegida neste dispositivo e os dados continuam isolados pelas políticas do Supabase."
      footer={
        <View style={authFormStyles.linkRow}>
          <Text selectable style={[authFormStyles.supportingText, { color: colors.textMuted }]}>
            Ainda não tem conta?
          </Text>
          <Link href="/sign-up" asChild>
            <Pressable accessibilityRole="link">
              <Text style={[authFormStyles.linkText, { color: colors.brand }]}>Criar conta</Text>
            </Pressable>
          </Link>
        </View>
      }
    >
      <View style={authFormStyles.form}>
        {error || linkError ? <InlineNotice tone="error">{error ?? linkError}</InlineNotice> : null}
        <FormField
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          placeholder="voce@exemplo.com"
          inputMode="email"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
        />
        <FormField
          label="Senha"
          value={password}
          onChangeText={setPassword}
          placeholder="Sua senha"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={() => void signIn()}
        />

        <View style={authFormStyles.actions}>
          <PrimaryButton label="Entrar" onPress={() => void signIn()} pending={pending} />
          <Link href="/forgot-password" asChild>
            <Pressable accessibilityRole="link" style={{ alignSelf: 'center', padding: 10 }}>
              <Text style={[authFormStyles.linkText, { color: colors.brand }]}>
                Esqueci minha senha
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </AuthScreen>
  );
}
