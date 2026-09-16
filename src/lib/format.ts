// Rótulo do dia para o card de previsão: "Hoje" para o primeiro item, senão o dia da semana abreviado em pt-BR
export function formatDayLabel(date: string | null | undefined, index: number): string {
  if (index === 0) return 'Hoje';
  if (index === 1) return 'Amanhã';
  if (!date) return 'Dia indisponível';

  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return 'Dia indisponível';

  const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(parsed);
  return weekday.replace('.', '').replace(/^\w/, (char) => char.toUpperCase());
}

export function getShortDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(parsed);
}
