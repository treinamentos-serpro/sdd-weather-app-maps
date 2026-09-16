import { describe, expect, it } from 'vitest';
import { getWeatherIcon, getWeatherLabel } from '../../src/lib/weatherCode';

describe('getWeatherLabel', () => {
  it('traduz um código WMO conhecido', () => {
    expect(getWeatherLabel(0)).toBe('Céu limpo');
  });

  it('retorna um texto padrão para código desconhecido', () => {
    expect(getWeatherLabel(999)).toBe('Condição desconhecida');
  });
});

describe('getWeatherIcon', () => {
  it('retorna um ícone para código conhecido', () => {
    expect(getWeatherIcon(0)).toBe('☀️');
  });

  it('retorna um ícone padrão para código desconhecido', () => {
    expect(getWeatherIcon(999)).toBe('❓');
  });
});
