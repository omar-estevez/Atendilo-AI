interface AppFallbackLoaderProps {
    message?: string
}

export const AppFallbackLoader = ({
    message = "Cargando Atendilo AI",
}: AppFallbackLoaderProps) => {
    return (
        <main className="relative min-h-screen overflow-hidden bg-black text-white">
            <div className="absolute inset-0 animate-weird-bg bg-[radial-gradient(circle_at_20%_20%,rgba(0,212,255,0.28),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(124,58,237,0.24),transparent_28%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.18),transparent_30%)]" />

            <div className="absolute inset-0 bg-black/55" />

            <section className="relative z-10 flex min-h-screen items-center justify-center px-6">
                <div className="flex flex-col items-center rounded-3xl border border-white/10 bg-white/[0.06] px-8 py-7 text-center shadow-2xl shadow-cyan-500/10 backdrop-blur-md">
                    <div className="relative mb-5">
                        <div className="absolute inset-0 rounded-2xl bg-cyan-400/30 blur-xl animate-pulse" />

                        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                            <img
                                src="/icon.png"
                                alt="Atendilo AI"
                                className="h-10 w-10 object-contain"
                                loading="eager"
                                decoding="async"
                            />
                        </div>
                    </div>

                    <div className="mb-4 h-6 w-6 rounded-full border-2 border-white/15 border-t-cyan-400 animate-spin" />

                    <p className="text-sm font-medium text-white">{message}</p>

                    <p className="mt-1 text-xs text-white/50">
                        Preparando tu experiencia...
                    </p>
                </div>
            </section>
        </main>
    )
}