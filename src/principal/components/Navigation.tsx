import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/authStore"
import { motion } from "framer-motion"
import { Bot } from "lucide-react"
import { Link, useNavigate } from "react-router"

export const Navigation = () => {

    const navigate = useNavigate();

    const { isInitialized, isAuthenticated } = useAuthStore();

    return (
        <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 glass-strong"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    <Link to='/' className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center glow">
                            <Bot className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Lumora</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
                        <Link to="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
                        <Link to="/#industries" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Industries</Link>
                        <Link to="/#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
                    </div>

                    <div className="flex items-center gap-3">
                        {isInitialized && isAuthenticated ? (
                            <Button
                                size="sm"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground glow"
                                onClick={() => navigate("/dashboard")}
                            >
                                Dashboard
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hidden sm:inline-flex"
                                    onClick={() => navigate("/login")}
                                >
                                    Log in
                                </Button>

                                <Button
                                    size="sm"
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground glow"
                                    onClick={() => navigate("/register")}
                                >
                                    Get Started
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </motion.nav>
    )
}
