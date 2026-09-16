import { describe, expect, it } from 'vitest';
import { formatDayLabel, getShortDate } from '../../src/lib/format';

describe('formatDayLabel', () => {
  it('retorna "Hoje" para o primeiro dia', () => {
    expect(formatDayLabel('2026-09-16', 0)).toBe('Hoje');
  });

  it('retorna "Amanhã" para o segundo dia', () => {
    expect(formatDayLabel('2026-09-17', 1)).toBe('Amanhã');
  });

  it('retorna o dia da semana para os dias seguintes', () => {
    expect(formatDayLabel('2026-09-18', 2)).toBe('Sex');
  });
});

describe('getShortDate', () => {
  it('retorna dia e mês no formato curto', () => {
    expect(getShortDate('2026-09-16')).toBe('16/09');
  });
});
