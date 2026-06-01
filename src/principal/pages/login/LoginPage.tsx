import { Button } from '@/components/ui/button';
import { LumoraLoader } from '@/shared/components/LumoraLoader';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { Sparkles, Check, Mail, EyeOff, Eye, ArrowRight, Lock } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router';

export const LoginPage = () => {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { login, isLoading, error, clearError, isInitialized, isAuthenticated, loadingStep } = useAuthStore();

    const [searchParams] = useSearchParams();

    const redirect = searchParams.get("redirect") || "/dashboard";

    useEffect(() => {
        if (isInitialized && isAuthenticated) {
            navigate(redirect, { replace: true });
        }
    }, [isInitialized, isAuthenticated, navigate, redirect]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        clearError();

        try {
            await login(email, password);
            navigate(redirect, { replace: true });
        } catch {
            // Error already handled by Zustand
        }
    };

    if (isLoading) {
        return (
            <LumoraLoader
                message="Signing in"
                subMessage={loadingStep || "Preparing your AI workspace..."}
            />
        );
    }

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
                </div>

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 mb-12">
                            <div className="relative w-12 h-12 rounded-xl bg-linear-to-r from-primary to-accent flex items-center justify-center glow">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-foreground">
                                Lumora
                            </span>
                        </Link>

                        {/* Headline */}
                        <h1 className="text-4xl xl:text-5xl font-bold text-foreground leading-tight mb-6">
                            Welcome back to your{" "}
                            <span className="text-gradient">AI receptionist</span>
                        </h1>

                        <p className="text-lg text-muted-foreground mb-12 max-w-md">
                            Access your dashboard and manage all your business conversations
                            in one place.
                        </p>

                        {/* Features List */}
                        <div className="space-y-4">
                            {[
                                "Real-time dashboard",
                                "Complete conversation history",
                                "Detailed analytics and reports",
                                "AI response settings",
                            ].map((feature, index) => (
                                <motion.div
                                    key={feature}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                        <Check className="w-3.5 h-3.5 text-primary" />
                                    </div>
                                    <span className="text-muted-foreground">{feature}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile Logo */}
                    <Link to="/" className="flex lg:hidden items-center gap-3 mb-10">
                        <div className="relative w-10 h-10 rounded-xl bg-linear-to-r from-primary to-accent flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-foreground">Lumora</span>
                    </Link>

                    {/* Form Header */}
                    <div className="mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                            Sign In
                        </h2>
                        <p className="text-muted-foreground">
                            Enter your credentials to access your account
                        </p>
                    </div>

                    {/* Social Login */}
                    {/* <div className="grid grid-cols-2 gap-3 mb-6">
                        <Button
                            type="button"
                            onClick={handleGoogleAuth}
                            disabled={isLoading}
                            size="lg"
                            variant="outline"
                            className="w-full sm:w-auto px-8 py-6 text-lg border-border/50 hover:bg-secondary"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            <span className="text-sm font-medium text-foreground">Google</span>
                        </Button>
                        <button
                            type="button"
                            className="glass flex items-center justify-center gap-2 py-3 px-4 rounded-xl hover:bg-card/80 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            <span className="text-sm font-medium text-foreground">GitHub</span>
                        </button>
                    </div> */}

                    {/* Divider */}
                    {/* <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-sm text-muted-foreground">
                            or continue with email
                        </span>
                        <div className="flex-1 h-px bg-border" />
                    </div> */}

                    {redirect.includes("/accept-invite") && (
                        <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/10 p-4">
                            <p className="text-sm font-semibold text-primary">
                                Team invitation detected
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Sign in with the invited email to continue accepting your workspace invitation.
                            </p>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Field */}
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
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@email.com"
                                    className="w-full pl-12 pr-4 py-3.5 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Password
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                                >
                                    Forgot your password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-3.5 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me */}
                        {/* <div className="flex items-center gap-3">
                            <input
                                id="remember"
                                type="checkbox"
                                className="w-4 h-4 rounded border-border bg-input text-primary focus:ring-primary/50 focus:ring-offset-0"
                            />
                            <label
                                htmlFor="remember"
                                className="text-sm text-muted-foreground"
                            >
                                Keep me signed in
                            </label>
                        </div> */}

                        {error && (
                            <p className="text-sm text-red-500">
                                {error}
                            </p>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            size="lg"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg glow"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Sign Up Link */}
                    <p className="mt-8 text-center text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link
                            to={
                                redirect !== "/dashboard"
                                    ? `/register?redirect=${encodeURIComponent(redirect)}`
                                    : "/register"
                            }
                            className="text-primary font-medium hover:text-primary/80 transition-colors"
                        >
                            Create a free account
                        </Link>
                    </p>

                    {/* Trust Badge */}
                    <div className="mt-8 pt-8 border-t border-border">
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Lock className="w-4 h-4" />
                            <span>Secure connection with 256-bit SSL encryption</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default LoginPage;