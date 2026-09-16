import { afterEach, describe, expect, it, vi } from 'vitest';
import { getWeather, REQUEST_TIMEOUT_MS, searchCities } from '../../src/services/weatherService';
import { WeatherServiceError } from '../../src/types/search';
import type { City } from '../../src/types/weather';

const city: City = {
  id: 3448439,
  name: 'São Paulo',
  country: 'Brazil',
  admin1: 'São Paulo',
  latitude: -23.5475,
  longitude: -46.63611,
  timezone: 'America/Sao_Paulo',
};

const daily = {
  time: ['2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'],
  temperature_2m_max: [24.1, 23.5, 19.8, 25, 26.2],
  temperature_2m_min: [15.2, 14.8, 13.1, 15.9, 16.4],
  weather_code: [2, 3, 61, 1, 0],
  precipitation_probability_max: [null, 20, 70, 10, 0],
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('searchCities', () => {
  it('retorna vazio sem chamar fetch para input vazio', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('   ')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('mapeia os resultados de geocoding para cidades', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [
            {
              id: city.id,
              name: city.name,
              country: city.country,
              admin1: city.admin1,
              latitude: city.latitude,
              longitude: city.longitude,
              timezone: city.timezone,
            },
          ],
        }),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('sao paulo')).resolves.toEqual([city]);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('retorna vazio quando results não está presente', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}')));

    await expect(searchCities('cidade inexistente')).resolves.toEqual([]);
  });

  it('aplica defaults seguros a metadados opcionais da cidade', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            results: [
              {
                id: city.id,
                name: city.name,
                latitude: city.latitude,
                longitude: city.longitude,
              },
            ],
          }),
        ),
      ),
    );

    await expect(searchCities('São Paulo')).resolves.toEqual([
      { ...city, country: 'País não informado', admin1: undefined, timezone: 'UTC' },
    ]);
  });

  it('lança WeatherServiceError quando a resposta não é ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 500 })));

    await expect(searchCities('São Paulo')).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('lança WeatherServiceError em falha de rede', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await expect(searchCities('São Paulo')).rejects.toMatchObject({
      kind: 'network',
      message:
        'Não foi possível conectar ao serviço de clima. Verifique sua conexão e tente novamente.',
    });
  });

  it('informa quando a requisição ultrapassa o timeout', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, options: RequestInit) =>
          new Promise<Response>((_, reject) => {
            options.signal?.addEventListener('abort', () => {
              const abortError = new Error('Aborted');
              abortError.name = 'AbortError';
              reject(abortError);
            });
          }),
      ),
    );

    const request = searchCities('São Paulo');
    const requestError = expect(request).rejects.toMatchObject({
      kind: 'network',
      message: 'A conexão demorou mais de 10 segundos. Tente novamente.',
    });
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);

    await requestError;
  });

  it('lança WeatherServiceError para JSON inválido', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('não é JSON')));

    await expect(searchCities('São Paulo')).rejects.toBeInstanceOf(WeatherServiceError);
  });
});

describe('getWeather', () => {
  it('mapeia current e daily para cinco dias', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            current: {
              temperature_2m: 22.4,
              apparent_temperature: 21.8,
              relative_humidity_2m: 58,
              wind_speed_10m: 12.3,
              weather_code: 2,
            },
            daily,
          }),
        ),
      ),
    );

    await expect(getWeather(city)).resolves.toEqual({
      city,
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
          temperatureMaxC: 24.1,
          temperatureMinC: 15.2,
          weatherCode: 2,
          precipitationProbability: 0,
        },
        {
          date: '2026-09-17',
          temperatureMaxC: 23.5,
          temperatureMinC: 14.8,
          weatherCode: 3,
          precipitationProbability: 20,
        },
        {
          date: '2026-09-18',
          temperatureMaxC: 19.8,
          temperatureMinC: 13.1,
          weatherCode: 61,
          precipitationProbability: 70,
        },
        {
          date: '2026-09-19',
          temperatureMaxC: 25,
          temperatureMinC: 15.9,
          weatherCode: 1,
          precipitationProbability: 10,
        },
        {
          date: '2026-09-20',
          temperatureMaxC: 26.2,
          temperatureMinC: 16.4,
          weatherCode: 0,
          precipitationProbability: 0,
        },
      ],
    });
  });

  it('mapeia current ausente para valores nulos seguros', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ daily }))));

    await expect(getWeather(city)).resolves.toMatchObject({
      current: {
        temperatureC: null,
        apparentTemperatureC: null,
        humidityPercent: null,
        windSpeedKmh: null,
        weatherCode: null,
      },
    });
  });

  it('mapeia campos nulos de current e daily sem produzir undefined', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            current: {
              temperature_2m: null,
              apparent_temperature: null,
              relative_humidity_2m: null,
              wind_speed_10m: null,
              weather_code: null,
            },
            daily: {
              time: [null, ...daily.time.slice(1)],
              temperature_2m_max: [null, ...daily.temperature_2m_max.slice(1)],
              temperature_2m_min: [null, ...daily.temperature_2m_min.slice(1)],
              weather_code: [null, ...daily.weather_code.slice(1)],
              precipitation_probability_max: [
                null,
                ...daily.precipitation_probability_max.slice(1),
              ],
            },
          }),
        ),
      ),
    );

    await expect(getWeather(city)).resolves.toMatchObject({
      current: {
        temperatureC: null,
        apparentTemperatureC: null,
        humidityPercent: null,
        windSpeedKmh: null,
        weatherCode: null,
      },
      forecast: expect.arrayContaining([
        expect.objectContaining({
          date: null,
          temperatureMaxC: null,
          temperatureMinC: null,
          weatherCode: null,
          precipitationProbability: 0,
        }),
      ]),
    });
  });

  it('lança WeatherServiceError quando forecast responde com erro HTTP', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 503 })));

    await expect(getWeather(city)).rejects.toMatchObject({ kind: 'network' });
  });

  it('lança WeatherServiceError quando há menos de cinco dias', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            current: {
              temperature_2m: 22.4,
              apparent_temperature: 21.8,
              relative_humidity_2m: 58,
              wind_speed_10m: 12.3,
              weather_code: 2,
            },
            daily: {
              ...daily,
              time: daily.time.slice(0, 4),
            },
          }),
        ),
      ),
    );

    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('lança WeatherServiceError quando um array obrigatório está ausente', async () => {
    const { precipitation_probability_max: _precipitation, ...dailyWithoutPrecipitation } = daily;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            current: {
              temperature_2m: 22.4,
              apparent_temperature: 21.8,
              relative_humidity_2m: 58,
              wind_speed_10m: 12.3,
              weather_code: 2,
            },
            daily: dailyWithoutPrecipitation,
          }),
        ),
      ),
    );

    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });
});
