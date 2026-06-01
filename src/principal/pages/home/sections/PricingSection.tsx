import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { mockPlans } from "@/shared/data/mock"
import { motion } from "framer-motion"
import { Zap, Check, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router"

export const PricingSection = () => {

    const navigate = useNavigate();

    return (
        <section id="pricing" className="py-20 lg:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                        <Zap className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">Simple Pricing</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                        Choose Your
                        <span className="text-gradient"> AI Receptionist Plan</span>
                    </h2>
                    <p className="text-lg text-muted-foreground text-pretty">
                        Start with a free preview. Activate only when you’re ready.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {mockPlans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className={`relative h-full p-6 lg:p-8 ${plan.popular
                                ? 'bg-linear-to-b from-primary/10 to-card border-primary/30 glow'
                                : 'glass border-border/50'
                                }`}>
                                {plan.popular && (
                                    <div className="absolute top-1 left-1/2 -translate-x-1/2">
                                        <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                                    <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold">${plan.price}</span>
                                        <span className="text-muted-foreground">/month</span>
                                    </div>
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                            <span className="text-sm text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className={`w-full ${plan.popular
                                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                                        : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                                        }`}
                                    size="lg"
                                    onClick={() => navigate('/register')}
                                >
                                    Get Started
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <p className="text-lg text-muted-foreground text-pretty">
                        *Provider fees may apply for SMS, WhatsApp, voice calls, and high AI usage.
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
