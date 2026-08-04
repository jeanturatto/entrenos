import { describe, expect, it } from 'vitest';

import { formatDateInput, formatTimeInput, parseLocalDateTime } from './date-time';

describe('date-time', () => {
  it('converte data e horário locais válidos', () => {
    const result = parseLocalDateTime('04/08/2026', '19:30');

    expect(result?.getFullYear()).toBe(2026);
    expect(result?.getMonth()).toBe(7);
    expect(result?.getDate()).toBe(4);
    expect(result?.getHours()).toBe(19);
    expect(result?.getMinutes()).toBe(30);
  });

  it('rejeita datas e horários impossíveis', () => {
    expect(parseLocalDateTime('31/02/2026', '19:30')).toBeNull();
    expect(parseLocalDateTime('04/08/2026', '25:00')).toBeNull();
    expect(parseLocalDateTime('2026-08-04', '19:30')).toBeNull();
  });

  it('formata os valores usados pelo formulário', () => {
    const value = new Date(2026, 7, 4, 9, 5);

    expect(formatDateInput(value)).toBe('04/08/2026');
    expect(formatTimeInput(value)).toBe('09:05');
  });
});
