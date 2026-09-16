import { memo } from 'react';
import { formatDayLabel } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherIcon, getWeatherLabel } from '../lib/weatherCode';
import type { Unit } from '../types/search';
import type { ForecastDay } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  index: number;
  unit: Unit;
}

function ForecastCard({ day, index, unit }: ForecastCardProps) {
  const dayLabel = formatDayLabel(day.date, index);
  const conditionLabel = getWeatherLabel(day.weatherCode);

  return (
    <article className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-center shadow-glass backdrop-blur-md">
      <p className="text-sm font-medium text-white/80">{dayLabel}</p>
      <span aria-hidden="true" className="text-3xl">
        {getWeatherIcon(day.weatherCode)}
      </span>
      <p className="sr-only">{conditionLabel}</p>
      <p className="text-sm text-white">
        <span className="font-semibold">{formatTemperature(day.temperatureMaxC, unit)}</span>{' '}
        <span className="text-white/50">{formatTemperature(day.temperatureMinC, unit)}</span>
      </p>
    </article>
  );
}

export default memo(ForecastCard);
