import { Database, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface AtendiloLoaderProps {
    message?: string;
    subMessage?: string | null;
}

export const AtendiloLoader = ({
    message = "Loading Atendilo",
    subMessage = "Preparing your AI workspace...",
}: AtendiloLoaderProps) => {
    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-background">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/3 h-[280px] w-[280px] rounded-full bg-accent/10 blur-[100px]" />
            </div>

            <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.4)_1px,transparent_1px)] bg-size-[40px_40px]" />

            <div className="relative z-10 flex flex-col items-center">
                <div className="relative mb-8 flex h-28 w-28 items-center justify-center">
                    <motion.div
                        className="absolute inset-0 rounded-full border border-primary/30"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    />

                    <motion.div
                        className="absolute inset-2 rounded-full border border-dashed border-accent/40"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                    />

                    <motion.div
                        className="absolute inset-6 rounded-2xl bg-primary/20 blur-sm"
                        animate={{
                            scale: [1, 1.15, 1],
                            opacity: [0.4, 0.8, 0.4],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />

                    <motion.div
                        className="relative flex h-16 w-16 items-center justify-center rounded-2xl shadow-[0_0_45px_rgba(56,189,248,0.45)]"
                        animate={{ y: [0, -6, 0] }}
                        transition={{
                            duration: 2.4,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <img
                            src="/icon.png"
                            alt="Icono"
                            className="w-full h-full object-contain"
                        />
                    </motion.div>

                    <motion.div
                        className="absolute -right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/80 backdrop-blur"
                        animate={{
                            y: [0, -8, 0],
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <Database className="h-4 w-4 text-primary" />
                    </motion.div>

                    <motion.div
                        className="absolute -left-2 bottom-3 flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/80 backdrop-blur"
                        animate={{
                            y: [0, 8, 0],
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 2.4,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <Zap className="h-4 w-4 text-accent" />
                    </motion.div>

                    <motion.div
                        className="absolute -top-3 left-5 flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background/80 backdrop-blur"
                        animate={{
                            scale: [1, 1.15, 1],
                            opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                            duration: 1.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                    </motion.div>
                </div>

                <div className="text-center">
                    <motion.h1
                        className="text-xl font-bold tracking-tight text-foreground"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        {message}
                        <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        >
                            ...
                        </motion.span>
                    </motion.h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        {subMessage}
                    </p>
                </div>

                <div className="mt-8 w-80 rounded-2xl border border-border/60 bg-card/40 p-4 backdrop-blur">
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                            Current process
                        </span>

                        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                    </div>

                    <motion.p
                        key={subMessage}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm font-medium text-foreground"
                    >
                        {subMessage}
                    </motion.p>

                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary">
                        <motion.div
                            className="h-full rounded-full bg-linear-to-r from-primary to-accent"
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{
                                duration: 1.4,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};