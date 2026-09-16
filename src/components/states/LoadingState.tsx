export default function LoadingState() {
  return (
    <div
      role="status"
      className="flex w-full max-w-md flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 text-center shadow-glass backdrop-blur-md"
    >
      <span
        aria-hidden="true"
        className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-accent-400"
      />
      <p className="text-sm text-white/70">Buscando o clima...</p>
    </div>
  );
}
