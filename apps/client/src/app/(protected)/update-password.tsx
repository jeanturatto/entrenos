import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import {
  AuthScreen,
  FormField,
  InlineNotice,
  PrimaryButton,
  authFormStyles,
} from '@/components/auth-screen';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { validateStrongPassword } from '@/lib/auth-validation';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

export default function UpdatePasswordScreen() {
  const { isPasswordRecovery, finishPasswordRecovery } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const updatePassword = async () => {
    setError(null);
    const passwordError = validateStrongPassword(password);

    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmation) {
      setError('As senhas não coincidem.');
      return;
    }

    setPending(true);
    const { error: authError } = await getSupabaseClient().auth.updateUser({ password });
    setPending(false);

    if (authError) {
      setError(getAuthErrorMessage(authError));
      return;
    }

    finishPasswordRecovery();
    router.replace('/dashboard');
  };

  return (
    <AuthScreen
      eyebrow={isPasswordRecovery ? 'LINK CONFIRMADO' : 'SEGURANÇA DA CONTA'}
      title="Escolha uma nova senha."
      description="Depois da alteração, você continuará dentro da sua área protegida."
    >
      <View style={authFormStyles.form}>
        {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}
        <FormField
          label="Nova senha"
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
          label="Confirmar nova senha"
          value={confirmation}
          onChangeText={setConfirmation}
          placeholder="Repita a nova senha"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={() => void updatePassword()}
        />
        <PrimaryButton
          label="Salvar nova senha"
          onPress={() => void updatePassword()}
          pending={pending}
        />
      </View>
    </AuthScreen>
  );
}
