import * as Linking from 'expo-linking';
import { Link } from 'expo-router';
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
import { validateEmail } from '@/lib/auth-validation';
import { getSupabaseClient } from '@/lib/supabase';

export default function ForgotPasswordScreen() {
  const colors = useColorScheme() === 'dark' ? palette.dark : palette.light;
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  const requestReset = async () => {
    setError(null);
    const emailError = validateEmail(email);

    if (emailError) {
      setError(emailError);
      return;
    }

    setPending(true);
    const { error: authError } = await getSupabaseClient().auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: Linking.createURL('/update-password') },
    );
    setPending(false);

    if (authError) {
      setError(getAuthErrorMessage(authError));
      return;
    }

    setSent(true);
  };

  return (
    <AuthScreen
      eyebrow="RECUPERAR ACESSO"
      title="Vamos criar uma nova senha."
      description="Informe seu e-mail. Se houver uma conta, você receberá um link seguro para continuar."
      footer={
        <Link href="/sign-in" asChild>
          <Pressable accessibilityRole="link" style={{ padding: 10 }}>
            <Text style={[authFormStyles.linkText, { color: colors.brand }]}>
              Voltar para entrar
            </Text>
          </Pressable>
        </Link>
      }
    >
      <View style={authFormStyles.form}>
        {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}
        {sent ? (
          <InlineNotice tone="success">
            Se este e-mail estiver cadastrado, o link chegará em instantes. Verifique também o spam.
          </InlineNotice>
        ) : null}
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
          returnKeyType="done"
          onSubmitEditing={() => void requestReset()}
        />
        <PrimaryButton
          label="Enviar link seguro"
          onPress={() => void requestReset()}
          pending={pending}
        />
      </View>
    </AuthScreen>
  );
}
