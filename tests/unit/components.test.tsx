import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import SearchBar from '../../src/components/SearchBar';
import UnitToggle from '../../src/components/UnitToggle';
import type { Unit } from '../../src/types/search';
import type { City, CurrentWeather as CurrentWeatherData } from '../../src/types/weather';

const city: City = {
  id: 3448439,
  name: 'São Paulo',
  country: 'Brazil',
  admin1: 'São Paulo',
  latitude: -23.5475,
  longitude: -46.63611,
  timezone: 'America/Sao_Paulo',
};

const current: CurrentWeatherData = {
  temperatureC: 0,
  apparentTemperatureC: 0,
  humidityPercent: 50,
  windSpeedKmh: 10,
  weatherCode: 0,
};

describe('SearchBar', () => {
  it('não dispara onSearch quando o input está vazio', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('dispara onSearch com o termo informado', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByLabelText('Nome da cidade'), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).toHaveBeenCalledWith('São Paulo');
  });

  it('remove marcações perigosas e preserva caracteres especiais como texto', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await user.type(
      screen.getByLabelText('Nome da cidade'),
      'São Paulo <script>alert(1)</script> ☀️',
    );
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).toHaveBeenCalledWith('São Paulo ☀️');
    expect(onSearch.mock.calls[0][0]).not.toContain('<script>');
  });
});

function WeatherUnitExample() {
  const [unit, setUnit] = useState<Unit>('celsius');

  return (
    <>
      <UnitToggle unit={unit} onChange={setUnit} />
      <CurrentWeather city={city} current={current} unit={unit} />
    </>
  );
}

describe('conversão de unidade', () => {
  it('exibe 32°F ao clicar em °F para uma temperatura de 0°C', async () => {
    const user = userEvent.setup();
    render(<WeatherUnitExample />);

    await user.click(screen.getByRole('button', { name: '°F' }));

    expect(screen.getByRole('region', { name: 'Clima atual em São Paulo' })).toHaveTextContent(
      '32°F',
    );
  });
});

describe('CurrentWeather', () => {
  it('exibe indisponível para métricas opcionais ausentes', () => {
    render(
      <CurrentWeather
        city={city}
        current={{
          ...current,
          apparentTemperatureC: null,
          humidityPercent: null,
          windSpeedKmh: null,
        }}
        unit="celsius"
      />,
    );

    expect(screen.getAllByText('—')).toHaveLength(3);
  });
});
