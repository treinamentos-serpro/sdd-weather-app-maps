import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../src/hooks/useWeather';
import { WeatherServiceError } from '../../src/types/search';
import type { City, WeatherData } from '../../src/types/weather';

const { getWeatherMock, searchCitiesMock } = vi.hoisted(() => ({
  getWeatherMock: vi.fn(),
  searchCitiesMock: vi.fn(),
}));

vi.mock('../../src/services/weatherService', () => ({
  getWeather: getWeatherMock,
  searchCities: searchCitiesMock,
}));

const city: City = {
  id: 3448439,
  name: 'São Paulo',
  country: 'Brazil',
  admin1: 'São Paulo',
  latitude: -23.5475,
  longitude: -46.63611,
  timezone: 'America/Sao_Paulo',
};

const weather: WeatherData = {
  city,
  current: {
    temperatureC: 22,
    apparentTemperatureC: 21,
    humidityPercent: 58,
    windSpeedKmh: 12,
    weatherCode: 1,
  },
  forecast: [],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useWeather', () => {
  it('repete a última busca depois de uma falha offline', async () => {
    searchCitiesMock
      .mockRejectedValueOnce(
        new WeatherServiceError(
          'network',
          'Não foi possível conectar ao serviço de clima. Verifique sua conexão e tente novamente.',
        ),
      )
      .mockResolvedValueOnce([city]);
    getWeatherMock.mockResolvedValue(weather);

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('São Paulo');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toContain('Verifique sua conexão');

    await act(async () => {
      await result.current.retry();
    });

    expect(searchCitiesMock).toHaveBeenCalledTimes(2);
    expect(searchCitiesMock).toHaveBeenLastCalledWith('São Paulo');
    expect(result.current.status).toBe('success');
    expect(result.current.data).toEqual(weather);
  });
});
