import { describe, expect, it } from 'vitest';
import {
  celsiusToFahrenheit,
  convertTemperature,
  formatTemperature,
  unitLabel,
} from '../../src/lib/temperature';

describe('celsiusToFahrenheit', () => {
  it('converte 0\u00b0C para 32\u00b0F', () => {
    expect(celsiusToFahrenheit(0)).toBe(32);
  });

  it('converte 100\u00b0C para 212\u00b0F', () => {
    expect(celsiusToFahrenheit(100)).toBe(212);
  });

  it('converte -40\u00b0C para -40\u00b0F', () => {
    expect(celsiusToFahrenheit(-40)).toBe(-40);
  });
});

describe('convertTemperature', () => {
  it('mantém o valor quando a unidade é Celsius', () => {
    expect(convertTemperature(22.4, 'celsius')).toBe(22.4);
  });

  it('converte o valor quando a unidade é Fahrenheit', () => {
    expect(convertTemperature(22.4, 'fahrenheit')).toBeCloseTo(72.32);
  });

  it.each([
    [-273.15, -459.67],
    [1000, 1832],
  ])('converte corretamente o valor de borda %s°C', (celsius, fahrenheit) => {
    expect(convertTemperature(celsius, 'fahrenheit')).toBeCloseTo(fahrenheit);
  });
});

describe('formatTemperature', () => {
  it('formata em Celsius arredondando ao inteiro mais próximo', () => {
    expect(formatTemperature(22.4, 'celsius')).toBe('22°C');
  });

  it('formata em Fahrenheit convertendo o valor', () => {
    expect(formatTemperature(0, 'fahrenheit')).toBe('32°F');
  });

  it('arredonda e exibe o símbolo da unidade selecionada', () => {
    expect(formatTemperature(22.6, 'celsius')).toBe('23°C');
    expect(formatTemperature(22.4, 'fahrenheit')).toBe('72°F');
  });
});

describe('unitLabel', () => {
  it('retorna o símbolo de Celsius', () => {
    expect(unitLabel('celsius')).toBe('°C');
  });

  it('retorna o símbolo de Fahrenheit', () => {
    expect(unitLabel('fahrenheit')).toBe('°F');
  });
});
