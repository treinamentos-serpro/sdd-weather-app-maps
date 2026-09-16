// Tabela fixa weather_code (WMO) → texto pt-BR, conforme §4.3 do plano
const WEATHER_CODE_LABELS: Record<number, string> = {
  0: 'Céu limpo',
  1: 'Predominantemente limpo',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Névoa',
  48: 'Névoa',
  51: 'Garoa',
  53: 'Garoa',
  55: 'Garoa',
  56: 'Garoa congelante',
  57: 'Garoa congelante',
  61: 'Chuva',
  63: 'Chuva',
  65: 'Chuva',
  66: 'Chuva congelante',
  67: 'Chuva congelante',
  71: 'Neve',
  73: 'Neve',
  75: 'Neve',
  77: 'Neve',
  80: 'Pancadas de chuva',
  81: 'Pancadas de chuva',
  82: 'Pancadas de chuva',
  85: 'Pancadas de neve',
  86: 'Pancadas de neve',
  95: 'Trovoada',
  96: 'Trovoada com granizo',
  99: 'Trovoada com granizo',
};

const WEATHER_CODE_ICONS: Record<number, string> = {
  0: '☀️',
  1: '🌤️',
  2: '⛅',
  3: '☁️',
  45: '🌫️',
  48: '🌫️',
  51: '🌦️',
  53: '🌦️',
  55: '🌦️',
  56: '🌧️',
  57: '🌧️',
  61: '🌧️',
  63: '🌧️',
  65: '🌧️',
  66: '🌧️',
  67: '🌧️',
  71: '🌨️',
  73: '🌨️',
  75: '🌨️',
  77: '🌨️',
  80: '🌦️',
  81: '🌧️',
  82: '⛈️',
  85: '🌨️',
  86: '🌨️',
  95: '⛈️',
  96: '⛈️',
  99: '⛈️',
};

export function getWeatherLabel(code: number | null | undefined): string {
  if (code === null || code === undefined) return 'Condição desconhecida';

  return WEATHER_CODE_LABELS[code] ?? 'Condição desconhecida';
}

export function getWeatherIcon(code: number | null | undefined): string {
  if (code === null || code === undefined) return '❓';

  return WEATHER_CODE_ICONS[code] ?? '❓';
}
