import { motion } from "framer-motion";
import {
    Sparkles,
    Shield,
    ArrowLeft,
    Mail,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router";
import { useAuthStore } from "@/store/authStore";

export const ForgotPasswordPage = () => {
    const { resetPassword, isLoading, error, clearError } = useAuthStore();

    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            clearError();

            const cleanEmail = email.trim().replace(/\s+/g, "");

            await resetPassword(cleanEmail);

            setEmail(cleanEmail);
            setIsSubmitted(true);
        } catch {
            // El error ya queda guardado en authStore.error
        }
    };

    return (
        <div className="min-h-screen bg-background flex">
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
                </div>

                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

                <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Link to="/" className="flex items-center gap-3 mb-12">
                            <div className="relative w-12 h-12 rounded-xl bg-linear-to-r from-primary to-accent flex items-center justify-center glow">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-foreground">Lumora</span>
                        </Link>

                        <h1 className="text-4xl xl:text-5xl font-bold text-foreground leading-tight mb-6">
                            Recover access to your <span className="text-gradient">account</span>
                        </h1>

                        <p className="text-lg text-muted-foreground mb-12 max-w-md">
                            Don’t worry, we’ll send you instructions to securely reset your
                            password.
                        </p>

                        <div className="glass rounded-2xl p-6 max-w-md">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                                    <Shield className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-foreground font-semibold mb-2">
                                        Secure process
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        The recovery link can only be used to securely create a new
                                        password.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <Link to="/" className="flex lg:hidden items-center gap-3 mb-10">
                        <div className="relative w-10 h-10 rounded-xl bg-linear-to-r from-primary to-accent flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-foreground">Lumora</span>
                    </Link>

                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">Back to login</span>
                    </Link>

                    {!isSubmitted ? (
                        <>
                            <div className="mb-8">
                                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                                    Reset Password
                                </h2>
                                <p className="text-muted-foreground">
                                    Enter your email and we’ll send you a link to create a new
                                    password.
                                </p>
                            </div>

                            {error && (
                                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="email"
                                        className="text-sm font-medium text-foreground"
                                    >
                                        Email
                                    </label>

                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value.replace(/\s+/g, ""))}
                                            placeholder="you@email.com"
                                            className="w-full pl-12 pr-4 py-3.5 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 px-6 bg-linear-to-r from-primary to-accent text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed glow flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Send Recovery Link
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-8 pt-8 border-t border-border">
                                <p className="text-sm text-muted-foreground text-center mb-4">
                                    Remembered your password?
                                </p>
                                <Link
                                    to="/login"
                                    className="block w-full py-3.5 px-6 glass text-center text-foreground font-medium rounded-xl hover:bg-card/80 transition-colors"
                                >
                                    Back to Sign In
                                </Link>
                            </div>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="text-center"
                        >
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>

                            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                                Email Sent
                            </h2>

                            <p className="text-muted-foreground mb-8">
                                We’ve sent instructions to{" "}
                                <span className="text-foreground font-medium">{email}</span>.
                                Check your inbox.
                            </p>

                            <div className="glass rounded-xl p-4 mb-8 text-left">
                                <p className="text-sm text-muted-foreground">
                                    <strong className="text-foreground">Note:</strong> If you
                                    don’t receive the email, check your spam folder.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    type="button"
                                    onClick={() => setIsSubmitted(false)}
                                    disabled={isLoading}
                                    className="w-full py-3.5 px-6 glass text-foreground font-medium rounded-xl hover:bg-card/80 transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? "Sending..." : "Resend Email"}
                                </button>

                                <Link
                                    to="/login"
                                    className="block w-full py-3.5 px-6 bg-linear-to-r from-primary to-accent text-white font-semibold rounded-xl hover:opacity-90 transition-all glow"
                                >
                                    Back to Sign In
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;