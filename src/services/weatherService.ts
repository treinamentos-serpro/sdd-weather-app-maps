import { WeatherServiceError } from '../types/search';
import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const FORECAST_DAYS = 5;
export const REQUEST_TIMEOUT_MS = 10_000;

const NETWORK_ERROR_MESSAGE =
  'Não foi possível conectar ao serviço de clima. Verifique sua conexão e tente novamente.';
const TIMEOUT_ERROR_MESSAGE = 'A conexão demorou mais de 10 segundos. Tente novamente.';
const SERVICE_ERROR_MESSAGE = 'O serviço de clima está indisponível no momento. Tente novamente.';
const INVALID_RESPONSE_MESSAGE = 'O serviço de clima retornou dados inválidos. Tente novamente.';

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new WeatherServiceError('network', TIMEOUT_ERROR_MESSAGE);
    }
    throw new WeatherServiceError('network', NETWORK_ERROR_MESSAGE);
  } finally {
    clearTimeout(timeoutId);
  }
}

interface GeocodingResult {
  id?: number | null;
  name?: string | null;
  country?: string | null;
  admin1?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

function mapResultToCity(result: GeocodingResult): City | null {
  const { id, name, latitude, longitude } = result;

  if (
    typeof id !== 'number' ||
    !Number.isFinite(id) ||
    typeof name !== 'string' ||
    !name.trim() ||
    typeof latitude !== 'number' ||
    !Number.isFinite(latitude) ||
    typeof longitude !== 'number' ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  return {
    id,
    name,
    country: result.country?.trim() || 'País não informado',
    admin1: result.admin1?.trim() || undefined,
    latitude,
    longitude,
    timezone: result.timezone?.trim() || 'UTC',
  };
}

export async function searchCities(name: string): Promise<City[]> {
  if (!name.trim()) {
    return [];
  }

  const url = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(name)}&count=10&language=pt&format=json`;

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new WeatherServiceError('network', SERVICE_ERROR_MESSAGE);
  }

  let data: GeocodingResponse;
  try {
    data = await response.json();
  } catch {
    throw new WeatherServiceError('network', INVALID_RESPONSE_MESSAGE);
  }

  return (data.results ?? []).map(mapResultToCity).filter((city): city is City => city !== null);
}

interface ForecastCurrentResponse {
  temperature_2m?: number | null;
  apparent_temperature?: number | null;
  relative_humidity_2m?: number | null;
  wind_speed_10m?: number | null;
  weather_code?: number | null;
}

interface ForecastDailyResponse {
  time?: (string | null)[];
  temperature_2m_max?: (number | null)[];
  temperature_2m_min?: (number | null)[];
  weather_code?: (number | null)[];
  precipitation_probability_max?: (number | null)[];
}

interface ForecastResponse {
  current?: ForecastCurrentResponse;
  daily?: ForecastDailyResponse;
}

function toNullableNumber(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function mapCurrent(current?: ForecastCurrentResponse): CurrentWeather {
  return {
    temperatureC: toNullableNumber(current?.temperature_2m),
    apparentTemperatureC: toNullableNumber(current?.apparent_temperature),
    humidityPercent: toNullableNumber(current?.relative_humidity_2m),
    windSpeedKmh: toNullableNumber(current?.wind_speed_10m),
    weatherCode: toNullableNumber(current?.weather_code),
  };
}

function mapDaily(daily: ForecastDailyResponse): ForecastDay[] {
  const {
    time,
    temperature_2m_max: temperatureMax,
    temperature_2m_min: temperatureMin,
    weather_code: weatherCode,
    precipitation_probability_max: precipitationProbability,
  } = daily;

  if (
    !Array.isArray(time) ||
    !Array.isArray(temperatureMax) ||
    !Array.isArray(temperatureMin) ||
    !Array.isArray(weatherCode) ||
    !Array.isArray(precipitationProbability) ||
    time.length < FORECAST_DAYS ||
    temperatureMax.length < FORECAST_DAYS ||
    temperatureMin.length < FORECAST_DAYS ||
    weatherCode.length < FORECAST_DAYS ||
    precipitationProbability.length < FORECAST_DAYS
  ) {
    throw new WeatherServiceError('network', INVALID_RESPONSE_MESSAGE);
  }

  return Array.from({ length: FORECAST_DAYS }, (_, index) => ({
    date: typeof time[index] === 'string' ? time[index] : null,
    temperatureMaxC: toNullableNumber(temperatureMax[index]),
    temperatureMinC: toNullableNumber(temperatureMin[index]),
    weatherCode: toNullableNumber(weatherCode[index]),
    precipitationProbability: toNullableNumber(precipitationProbability[index]) ?? 0,
  }));
}

export async function getWeather(city: City): Promise<WeatherData> {
  const url =
    `${FORECAST_BASE_URL}?latitude=${city.latitude}&longitude=${city.longitude}` +
    '&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
    `&forecast_days=${FORECAST_DAYS}&timezone=auto`;

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new WeatherServiceError('network', SERVICE_ERROR_MESSAGE);
  }

  let data: ForecastResponse;
  try {
    data = await response.json();
  } catch {
    throw new WeatherServiceError('network', INVALID_RESPONSE_MESSAGE);
  }

  if (!data.daily) {
    throw new WeatherServiceError('network', INVALID_RESPONSE_MESSAGE);
  }

  return {
    city,
    current: mapCurrent(data.current),
    forecast: mapDaily(data.daily),
  };
}
