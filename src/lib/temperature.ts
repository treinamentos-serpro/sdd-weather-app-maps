import type { Unit } from '../types/search';

export function celsiusToFahrenheit(celsius: number): number {
  return celsius * (9 / 5) + 32;
}

export function convertTemperature(celsius: number, unit: Unit): number {
  return unit === 'fahrenheit' ? celsiusToFahrenheit(celsius) : celsius;
}

export function unitLabel(unit: Unit): string {
  return unit === 'fahrenheit' ? '°F' : '°C';
}

// Converte e formata a temperatura na unidade ativa, arredondando ao inteiro mais próximo
export function formatTemperature(celsius: number | null | undefined, unit: Unit): string {
  if (celsius === null || celsius === undefined || !Number.isFinite(celsius)) {
    return '—';
  }

  return `${Math.round(convertTemperature(celsius, unit))}${unitLabel(unit)}`;
}
