export function LoadingBall() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/75 backdrop-blur-sm">
      <img
        src="/trionda.png"
        alt="Trionda FIFA 2026"
        width={120}
        height={120}
        className="animate-spin [animation-duration:2s] drop-shadow-2xl"
        aria-hidden="true"
      />
      <p className="mt-5 text-xs font-semibold text-slate-400 tracking-[0.25em] uppercase">
        Cargando...
      </p>
    </div>
  )
}
