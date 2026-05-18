export default function StagingBadge() {
  if (process.env.APP_ENV !== "staging") return null;
  return (
    <div
      aria-label="Environnement de pré-production"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none select-none"
    >
      <div className="flex items-center gap-2 rounded-full bg-yellow-400 text-black font-extrabold tracking-widest uppercase text-xs px-4 py-1.5 shadow-lg ring-2 ring-black/20">
        <span className="inline-block h-2 w-2 rounded-full bg-black animate-pulse" />
        Staging — ne pas confondre avec la prod
      </div>
    </div>
  );
}
