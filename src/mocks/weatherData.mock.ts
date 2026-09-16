import type { WeatherData } from '../types/weather';

// Dados fictícios de São Paulo para desenvolver a UI sem depender da API real
export const mockWeatherData: WeatherData = {
  city: {
    id: 3448439,
    name: 'São Paulo',
    country: 'Brazil',
    admin1: 'São Paulo',
    latitude: -23.5475,
    longitude: -46.63611,
    timezone: 'America/Sao_Paulo',
  },
  current: {
    temperatureC: 22.4,
    apparentTemperatureC: 21.8,
    humidityPercent: 58,
    windSpeedKmh: 12.3,
    weatherCode: 2,
  },
  forecast: [
    {
      date: '2026-09-16',
      temperatureMinC: 15.2,
      temperatureMaxC: 24.1,
      weatherCode: 2,
      precipitationProbability: 0,
    },
    {
      date: '2026-09-17',
      temperatureMinC: 14.8,
      temperatureMaxC: 23.5,
      weatherCode: 3,
      precipitationProbability: 20,
    },
    {
      date: '2026-09-18',
      temperatureMinC: 13.1,
      temperatureMaxC: 19.8,
      weatherCode: 61,
      precipitationProbability: 70,
    },
    {
      date: '2026-09-19',
      temperatureMinC: 15.9,
      temperatureMaxC: 25.0,
      weatherCode: 1,
      precipitationProbability: 10,
    },
    {
      date: '2026-09-20',
      temperatureMinC: 16.4,
      temperatureMaxC: 26.2,
      weatherCode: 0,
      precipitationProbability: 0,
    },
  ],
};
