import { z } from 'zod';

const emailSchema = z.email('Digite um e-mail válido.');
const displayNameSchema = z
  .string()
  .trim()
  .min(1, 'Informe como você quer ser chamado.')
  .max(80, 'Use no máximo 80 caracteres.');
const strongPasswordSchema = z
  .string()
  .min(10, 'A senha precisa ter pelo menos 10 caracteres.')
  .regex(/[a-z]/, 'Inclua uma letra minúscula.')
  .regex(/[A-Z]/, 'Inclua uma letra maiúscula.')
  .regex(/[0-9]/, 'Inclua um número.')
  .regex(/[^A-Za-z0-9]/, 'Inclua um símbolo.');

function firstIssue(result: z.ZodSafeParseResult<unknown>) {
  return result.success ? null : result.error.issues[0]?.message;
}

export function validateEmail(email: string) {
  return firstIssue(emailSchema.safeParse(email.trim()));
}

export function validateDisplayName(displayName: string) {
  return firstIssue(displayNameSchema.safeParse(displayName));
}

export function validateStrongPassword(password: string) {
  return firstIssue(strongPasswordSchema.safeParse(password));
}
