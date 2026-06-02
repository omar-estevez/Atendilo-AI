import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Sparkles, ArrowRight, Check, Users } from "lucide-react"
import { useNavigate } from "react-router"

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
}

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
}

export const HeroSection = () => {

    const navigate = useNavigate();

    return (
        <section className="relative min-h-screen pt-24 lg:pt-32 pb-20 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px] opacity-50" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] opacity-30" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial="initial"
                    animate="animate"
                    variants={staggerContainer}
                    className="text-center max-w-4xl mx-auto"
                >
                    {/* Badge */}
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">AI-Powered Customer Communication</span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        variants={fadeInUp}
                        className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
                    >
                        <span className="text-balance">Never Miss a</span>
                        <br />
                        <span className="text-gradient">Customer Again</span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        variants={fadeInUp}
                        className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty leading-relaxed"
                    >
                        Get a custom AI receptionist for your business that answers leads, captures customer info, and helps book appointments — without hiring extra staff.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                        <Button
                            size="lg"
                            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg glow"
                            onClick={() => navigate('/register')}
                        >
                            Request My AI Preview
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                        <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-6 text-lg border-border/50 hover:bg-secondary">
                            See How It Works
                        </Button>
                    </motion.div>

                    {/* Trust Badges */}
                    <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-primary" />
                            <span>Free personalized preview</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-primary" />
                            <span>No free trial required</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-primary" />
                            <span>Activate only when ready</span>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Dashboard Mockup */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="mt-16 lg:mt-24"
                >
                    <div className="relative mx-auto max-w-5xl">
                        <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
                        <div className="glass-strong rounded-2xl lg:rounded-3xl p-2 lg:p-3 glow">
                            <div className="bg-secondary/50 rounded-xl lg:rounded-2xl overflow-hidden">
                                {/* Mockup Header */}
                                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-destructive/60" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/60" />
                                    </div>
                                    <div className="flex-1 text-center">
                                        <span className="text-xs text-muted-foreground">dashboard.Atendilo.ai</span>
                                    </div>
                                </div>
                                {/* Dashboard Content */}
                                <div className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    {/* Stats Cards */}
                                    <div className="space-y-4">
                                        <div className="glass rounded-xl p-4">
                                            <div className="text-sm text-muted-foreground mb-1">Today&apos;s Conversations</div>
                                            <div className="text-3xl font-bold">147</div>
                                            <div className="text-xs text-primary mt-1">+23% from yesterday</div>
                                        </div>
                                        <div className="glass rounded-xl p-4">
                                            <div className="text-sm text-muted-foreground mb-1">Bookings Created</div>
                                            <div className="text-3xl font-bold">34</div>
                                            <div className="text-xs text-primary mt-1">+12% conversion rate</div>
                                        </div>
                                    </div>

                                    {/* Chat Preview */}
                                    <div className="lg:col-span-2 glass rounded-xl p-4">
                                        <div className="text-sm font-medium mb-4">Live Conversations</div>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                                    <Users className="w-4 h-4 text-primary" />
                                                </div>
                                                <div className="flex-1 glass rounded-lg rounded-tl-none p-3">
                                                    <p className="text-sm">Hi, how much for a full detail on my SUV?</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 flex-row-reverse">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <img
                                                        src="/icon.png"
                                                        alt="Icono"
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <div className="flex-1 bg-primary/20 rounded-lg rounded-tr-none p-3">
                                                    <p className="text-sm">Great question! Our full detail for SUVs starts at $149. This includes exterior wash, interior deep clean, and full wax protection. Would you like to book an appointment? I have availability tomorrow at 10 AM or 2 PM.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
