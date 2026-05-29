import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { Sparkles, Check, User, Building2, Mail, EyeOff, Eye, ArrowRight, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';

export const RegisterPage = () => {

    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        businessName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const {
        register,
        isAuthenticated,
        isInitialized,
        isLoading,
        // error,
        clearError,
    } = useAuthStore();

    useEffect(() => {
        if (isInitialized && isAuthenticated) {
            navigate("/dashboard", { replace: true });
        }
    }, [isInitialized, isAuthenticated, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        clearError();

        if (formData.password !== formData.confirmPassword) {
            return;
        }

        try {
            await register(formData.email, formData.password);
            navigate("/dashboard", { replace: true });
        } catch {
            // Error already handled by Zustand
        }
    };

    const passwordRequirements = [
        { label: "Minimum 8 characters", met: formData.password.length >= 8 },
        { label: "One uppercase letter", met: /[A-Z]/.test(formData.password) },
        { label: "One number", met: /[0-9]/.test(formData.password) },
        {
            label: "Passwords match",
            met:
                formData.password === formData.confirmPassword &&
                formData.confirmPassword.length > 0,
        },
    ];

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
                            Start your{" "}
                            <span className="text-gradient">14-day free trial</span>
                        </h1>

                        <p className="text-lg text-muted-foreground mb-12 max-w-md">
                            No credit card required. Set up your AI receptionist in less
                            than 5 minutes.
                        </p>

                        {/* Benefits List */}
                        <div className="space-y-4">
                            {[
                                "500 free messages included",
                                "Priority support during your trial",
                                "Access to all features",
                                "Cancel anytime, no commitment",
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

                        {/* Testimonial */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            className="mt-12 p-6 glass rounded-2xl max-w-md"
                        >
                            <p className="text-muted-foreground italic mb-4">
                                &quot;Lumora transformed my business. Now I never miss a
                                client because I didn&apos;t respond on time.&quot;
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-linear-to-r from-primary to-accent flex items-center justify-center text-white font-semibold">
                                    MR
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        Miguel Rodriguez
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        AutoSpa Premium - Detailing
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Register Form */}
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
                        <span className="text-xl font-bold text-foreground">
                            Lumora
                        </span>
                    </Link>

                    {/* Form Header */}
                    <div className="mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                            Create Account
                        </h2>
                        <p className="text-muted-foreground">
                            Complete your details to start your free trial
                        </p>
                    </div>

                    {/* Social Login */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <Button
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
                            <span className="text-sm font-medium text-foreground">
                                Google
                            </span>
                        </Button>

                        {/* <button
                            type="button"
                            className="glass flex items-center justify-center gap-2 py-3 px-4 rounded-xl hover:bg-card/80 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            <span className="text-sm font-medium text-foreground">
                                GitHub
                            </span>
                        </button> */}
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-sm text-muted-foreground">
                            or sign up with email
                        </span>
                        <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Register Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <label
                                htmlFor="name"
                                className="text-sm font-medium text-foreground"
                            >
                                Full name
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Smith"
                                    className="w-full pl-12 pr-4 py-3.5 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Business Name Field */}
                        <div className="space-y-2">
                            <label
                                htmlFor="businessName"
                                className="text-sm font-medium text-foreground"
                            >
                                Business name
                            </label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="businessName"
                                    name="businessName"
                                    type="text"
                                    value={formData.businessName}
                                    onChange={handleChange}
                                    placeholder="My Business LLC"
                                    className="w-full pl-12 pr-4 py-3.5 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="text-sm font-medium text-foreground"
                            >
                                Work email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@company.com"
                                    className="w-full pl-12 pr-4 py-3.5 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="text-sm font-medium text-foreground"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
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

                        {/* Confirm Password Field */}
                        <div className="space-y-2">
                            <label
                                htmlFor="confirmPassword"
                                className="text-sm font-medium text-foreground"
                            >
                                Confirm password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-3.5 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Password Requirements */}
                        <div className="grid grid-cols-2 gap-2 py-2">
                            {passwordRequirements.map((req) => (
                                <div key={req.label} className="flex items-center gap-2">
                                    <div
                                        className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${req.met ? "bg-green-500/20" : "bg-muted"
                                            }`}
                                    >
                                        <Check
                                            className={`w-2.5 h-2.5 transition-colors ${req.met
                                                ? "text-green-500"
                                                : "text-muted-foreground"
                                                }`}
                                        />
                                    </div>
                                    <span
                                        className={`text-xs transition-colors ${req.met
                                            ? "text-green-500"
                                            : "text-muted-foreground"
                                            }`}
                                    >
                                        {req.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Terms */}
                        <div className="flex items-start gap-3">
                            <input
                                id="terms"
                                type="checkbox"
                                className="mt-1 w-4 h-4 rounded border-border bg-input text-primary focus:ring-primary/50 focus:ring-offset-0"
                                required
                            />
                            <label htmlFor="terms" className="text-sm text-muted-foreground">
                                I accept the{" "}
                                <Link
                                    to="/terms"
                                    className="text-primary hover:text-primary/80 transition-colors"
                                >
                                    Terms of Service
                                </Link>{" "}
                                and the{" "}
                                <Link
                                    to="/privacy"
                                    className="text-primary hover:text-primary/80 transition-colors"
                                >
                                    Privacy Policy
                                </Link>
                            </label>
                        </div>

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
                                    Create Free Account
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Login Link */}
                    <p className="mt-8 text-center text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="text-primary font-medium hover:text-primary/80 transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default RegisterPage;