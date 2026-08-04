import * as Linking from 'expo-linking';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View, useColorScheme } from 'react-native';

import {
  AuthScreen,
  FormField,
  InlineNotice,
  PrimaryButton,
  authFormStyles,
} from '@/components/auth-screen';
import { palette } from '@/constants/theme';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { validateDisplayName, validateEmail, validateStrongPassword } from '@/lib/auth-validation';
import { getSupabaseClient } from '@/lib/supabase';

export default function SignUpScreen() {
  const colors = useColorScheme() === 'dark' ? palette.dark : palette.light;
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const signUp = async () => {
    setError(null);
    setSuccess(null);

    const validationError =
      validateDisplayName(displayName) ?? validateEmail(email) ?? validateStrongPassword(password);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (password !== passwordConfirmation) {
      setError('As senhas não coincidem.');
      return;
    }

    setPending(true);
    const { data, error: authError } = await getSupabaseClient().auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { display_name: displayName.trim() },
        emailRedirectTo: Linking.createURL('/sign-in'),
      },
    });
    setPending(false);

    if (authError) {
      setError(getAuthErrorMessage(authError));
      return;
    }

    if (data.session) {
      router.replace('/dashboard');
      return;
    }

    setSuccess('Confira seu e-mail para confirmar a conta. Depois, volte aqui para entrar.');
  };

  return (
    <AuthScreen
      eyebrow="SUA IDENTIDADE"
      title="Comece pelo que é só seu."
      description="A conta é individual. O vínculo com outra pessoa só acontece depois, com consentimento explícito dos dois."
      footer={
        <View style={authFormStyles.linkRow}>
          <Text selectable style={[authFormStyles.supportingText, { color: colors.textMuted }]}>
            Já tem conta?
          </Text>
          <Link href="/sign-in" asChild>
            <Pressable accessibilityRole="link">
              <Text style={[authFormStyles.linkText, { color: colors.brand }]}>Entrar</Text>
            </Pressable>
          </Link>
        </View>
      }
    >
      <View style={authFormStyles.form}>
        {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}
        {success ? <InlineNotice tone="success">{success}</InlineNotice> : null}
        <FormField
          label="Como quer ser chamado"
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Seu nome"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
        />
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
        />
        <FormField
          label="Senha"
          hint="Use 10+ caracteres, com maiúscula, minúscula, número e símbolo."
          value={password}
          onChangeText={setPassword}
          placeholder="Crie uma senha forte"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <FormField
          label="Confirmar senha"
          value={passwordConfirmation}
          onChangeText={setPasswordConfirmation}
          placeholder="Repita a senha"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={() => void signUp()}
        />
        <PrimaryButton label="Criar minha conta" onPress={() => void signUp()} pending={pending} />
      </View>
    </AuthScreen>
  );
}
