import { formatTemperature } from '../lib/temperature';
import { getWeatherIcon, getWeatherLabel } from '../lib/weatherCode';
import type { Unit } from '../types/search';
import type { City, CurrentWeather as CurrentWeatherData } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

const UNAVAILABLE = '—';

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const conditionLabel = getWeatherLabel(current.weatherCode);
  const conditionIcon = getWeatherIcon(current.weatherCode);

  return (
    <section
      aria-label={`Clima atual em ${city.name}`}
      className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-center shadow-glass backdrop-blur-md"
    >
      <p className="text-lg font-medium text-white/80">
        {city.name}
        {city.admin1 ? `, ${city.admin1}` : ''}
      </p>

      <span aria-hidden="true" className="text-6xl">
        {conditionIcon}
      </span>

      <p className="text-6xl font-semibold tracking-tight text-white sm:text-7xl">
        {formatTemperature(current.temperatureC, unit)}
      </p>

      <p className="text-base text-white/70">{conditionLabel}</p>

      <dl className="mt-2 grid w-full grid-cols-2 gap-3 text-left sm:grid-cols-3">
        <div className="rounded-xl bg-white/5 p-3">
          <dt className="text-xs text-white/50">Sensação térmica</dt>
          <dd className="text-sm font-medium text-white">
            {current.apparentTemperatureC === null
              ? UNAVAILABLE
              : formatTemperature(current.apparentTemperatureC, unit)}
          </dd>
        </div>
        <div className="rounded-xl bg-white/5 p-3">
          <dt className="text-xs text-white/50">Umidade</dt>
          <dd className="text-sm font-medium text-white">
            {current.humidityPercent === null || !Number.isFinite(current.humidityPercent)
              ? UNAVAILABLE
              : `${current.humidityPercent}%`}
          </dd>
        </div>
        <div className="rounded-xl bg-white/5 p-3">
          <dt className="text-xs text-white/50">Vento</dt>
          <dd className="text-sm font-medium text-white">
            {current.windSpeedKmh === null || !Number.isFinite(current.windSpeedKmh)
              ? UNAVAILABLE
              : `${current.windSpeedKmh} km/h`}
          </dd>
        </div>
      </dl>
    </section>
  );
}
