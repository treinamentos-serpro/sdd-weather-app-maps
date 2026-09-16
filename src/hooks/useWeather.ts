import { useCallback, useRef, useState } from 'react';
import { getWeather, searchCities } from '../services/weatherService';
import { WeatherServiceError } from '../types/search';
import type { City, WeatherData } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

const UNEXPECTED_ERROR_MESSAGE = 'Não foi possível carregar o clima. Tente novamente.';

interface UseWeatherResult {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: string | null;
  query: string;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

// última ação executada, usada por retry() para reexecutar exatamente o mesmo passo
type LastAction = { type: 'search'; name: string } | { type: 'selectCity'; city: City } | null;

export function useWeather(): UseWeatherResult {
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const lastActionRef = useRef<LastAction>(null);

  const loadWeather = useCallback(async (city: City) => {
    setStatus('loading');
    try {
      const weather = await getWeather(city);
      setData(weather);
      setStatus('success');
    } catch (err) {
      setError(err instanceof WeatherServiceError ? err.message : UNEXPECTED_ERROR_MESSAGE);
      setStatus('error');
    }
  }, []);

  const search = useCallback(
    async (name: string) => {
      lastActionRef.current = { type: 'search', name };
      setQuery(name);
      setStatus('loading');
      setError(null);

      try {
        const results = await searchCities(name);
        setCities(results);

        if (results.length === 0) {
          setData(null);
          setStatus('empty');
          return;
        }

        await loadWeather(results[0]);
      } catch (err) {
        setError(err instanceof WeatherServiceError ? err.message : UNEXPECTED_ERROR_MESSAGE);
        setStatus('error');
      }
    },
    [loadWeather],
  );

  const selectCity = useCallback(
    async (city: City) => {
      lastActionRef.current = { type: 'selectCity', city };
      setError(null);
      await loadWeather(city);
    },
    [loadWeather],
  );

  const retry = useCallback(async () => {
    const lastAction = lastActionRef.current;
    if (!lastAction) return;

    if (lastAction.type === 'search') {
      await search(lastAction.name);
    } else {
      await selectCity(lastAction.city);
    }
  }, [search, selectCity]);

  return { status, data, cities, error, query, search, selectCity, retry };
}
