import { motion } from "framer-motion";
import { Sparkles, Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";

export const ResetPasswordPage = () => {
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrorMessage("");

        if (password.length < 8) {
            setErrorMessage("Password must be at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        const { error } = await supabase.auth.updateUser({
            password,
        });

        setIsLoading(false);

        if (error) {
            setErrorMessage(error.message);
            return;
        }

        setIsSuccess(true);

        setTimeout(() => {
            navigate("/login");
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md"
            >
                <Link to="/" className="flex items-center justify-center gap-3 mb-10">
                    <div className="relative w-11 h-11 rounded-xl bg-linear-to-r from-primary to-accent flex items-center justify-center glow">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-foreground">Lumora</span>
                </Link>

                <div className="glass rounded-2xl p-6 sm:p-8 border border-border">
                    {!isSuccess ? (
                        <>
                            <div className="mb-8 text-center">
                                <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-primary/20 flex items-center justify-center">
                                    <Lock className="w-7 h-7 text-primary" />
                                </div>

                                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                                    Create New Password
                                </h1>

                                <p className="text-muted-foreground">
                                    Enter your new password to recover your account.
                                </p>
                            </div>

                            {errorMessage && (
                                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <p>{errorMessage}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Minimum 8 characters"
                                        className="w-full px-4 py-3.5 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat your password"
                                        className="w-full px-4 py-3.5 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        required
                                    />
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
                                            Update Password
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>

                            <h2 className="text-2xl font-bold text-foreground mb-2">
                                Password Updated
                            </h2>

                            <p className="text-muted-foreground">
                                Your password was updated successfully. Redirecting to login...
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;