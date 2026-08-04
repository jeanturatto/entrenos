import { describe, expect, it } from 'vitest';

import { dateKey, getCalendarRange, getMonthGridDays, getWeekDays } from './calendar-utils';

describe('calendar utils', () => {
  it('gera uma grade mensal completa com seis semanas', () => {
    const days = getMonthGridDays(new Date(2026, 7, 15));
    expect(days).toHaveLength(42);
    expect(days[0].getDay()).toBe(0);
    expect(days[41].getDay()).toBe(6);
  });

  it('gera uma semana de domingo a sábado', () => {
    const days = getWeekDays(new Date(2026, 7, 4));
    expect(days.map(dateKey)).toEqual([
      '2026-08-02',
      '2026-08-03',
      '2026-08-04',
      '2026-08-05',
      '2026-08-06',
      '2026-08-07',
      '2026-08-08',
    ]);
  });

  it('limita a consulta diária ao dia selecionado', () => {
    const range = getCalendarRange('day', new Date(2026, 7, 4, 18, 30));
    expect(dateKey(range.from)).toBe('2026-08-04');
    expect(range.to.getTime() - range.from.getTime()).toBe(86_400_000);
  });
});
