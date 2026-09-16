import { type FormEvent, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

function sanitizeSearchQuery(value: string): string {
  return value
    .replace(/<(script|style|iframe|object|embed)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [query, setQuery] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const sanitized = sanitizeSearchQuery(query);
    if (!sanitized) return;
    onSearch(sanitized);
  }

  return (
    <form
      role="search"
      aria-busy={disabled}
      onSubmit={handleSubmit}
      className="flex w-full max-w-md items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 shadow-glass backdrop-blur-md"
    >
      <label htmlFor="search-city" className="sr-only">
        Nome da cidade
      </label>
      <input
        id="search-city"
        name="city"
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        disabled={disabled}
        placeholder="Buscar cidade..."
        autoComplete="off"
        className="w-full rounded-xl bg-transparent px-3 py-2 text-white placeholder:text-white/50 outline-none focus-visible:ring-2 focus-visible:ring-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled}
        className="shrink-0 rounded-xl bg-accent-600 px-4 py-2 font-medium text-white transition-colors hover:bg-accent-700 active:bg-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Buscar
      </button>
    </form>
  );
}
