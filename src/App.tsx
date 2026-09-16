import { useEffect, useRef, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/search';

const NOT_FOUND_MESSAGE = 'Nenhuma cidade encontrada';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const { status, data, error, search, retry } = useWeather();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (status === 'success' || status === 'error' || status === 'empty') {
      mainRef.current?.focus();
    }
  }, [status]);

  return (
    <div className="min-h-screen bg-night-900 font-sans text-white">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-8 px-4 py-10">
        <header className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-xl font-semibold tracking-tight">
            <span aria-hidden="true">🌤️</span> SDD Weather
          </p>
          <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <SearchBar onSearch={search} disabled={status === 'loading'} />
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
        </header>

        <main
          ref={mainRef}
          tabIndex={-1}
          aria-busy={status === 'loading'}
          className="flex w-full flex-1 flex-col items-center gap-8 outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
        >
          {status === 'idle' && <EmptyState />}
          {status === 'loading' && <LoadingState />}
          {status === 'empty' && <ErrorState message={NOT_FOUND_MESSAGE} onRetry={retry} />}
          {status === 'error' && (
            <ErrorState message={error ?? NOT_FOUND_MESSAGE} onRetry={retry} />
          )}
          {status === 'success' && data && (
            <>
              <CurrentWeather city={data.city} current={data.current} unit={unit} />
              <ForecastList forecast={data.forecast} unit={unit} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
