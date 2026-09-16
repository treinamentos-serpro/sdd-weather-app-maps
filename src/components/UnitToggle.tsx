import { type KeyboardEvent, useRef } from 'react';
import type { Unit } from '../types/search';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

const OPTIONS: { unit: Unit; label: string }[] = [
  { unit: 'celsius', label: '°C' },
  { unit: 'fahrenheit', label: '°F' },
];

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const nextIndex =
      event.key === 'ArrowRight'
        ? (index + 1) % OPTIONS.length
        : (index - 1 + OPTIONS.length) % OPTIONS.length;
    const nextOption = OPTIONS[nextIndex];
    buttonRefs.current[nextIndex]?.focus();
    onChange(nextOption.unit);
  }

  return (
    <div
      role="group"
      aria-label="Unidade de temperatura"
      className="inline-flex gap-1 rounded-2xl border border-white/10 bg-white/5 p-1 shadow-glass backdrop-blur-md"
    >
      {OPTIONS.map((option, index) => {
        const isActive = option.unit === unit;
        return (
          <button
            key={option.unit}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.unit)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 ${
              isActive ? 'bg-accent-500 text-white' : 'text-white/70 hover:bg-white/10'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
