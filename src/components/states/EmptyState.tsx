export default function EmptyState() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-6 text-center shadow-glass backdrop-blur-md">
      <p className="text-lg font-medium text-white">Busque uma cidade para ver o clima</p>
      <p className="text-sm text-white/60">
        Digite o nome de uma cidade acima e pressione Enter ou clique em Buscar.
      </p>
    </div>
  );
}
