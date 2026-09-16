import type { Unit } from '../types/search';
import type { ForecastDay } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: ForecastDay[];
  unit: Unit;
}

export default function ForecastList({ forecast, unit }: ForecastListProps) {
  return (
    <section aria-label="Previsão de 5 dias" className="w-full max-w-3xl">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {forecast.map((day, index) => (
          <li key={day.date}>
            <ForecastCard day={day} index={index} unit={unit} />
          </li>
        ))}
      </ul>
    </section>
  );
}
