import { describe, expect, it } from 'vitest';

import { resolveAppMode } from './app-mode';

describe('modo de publicação', () => {
  it('usa o modo cliente quando nenhuma configuração é informada', () => {
    expect(resolveAppMode(undefined)).toBe('client');
  });

  it('mantém valores desconhecidos fora da publicação', () => {
    expect(resolveAppMode('preview')).toBe('client');
  });

  it('libera o laboratório somente quando solicitado explicitamente', () => {
    expect(resolveAppMode('studio')).toBe('studio');
  });
});
