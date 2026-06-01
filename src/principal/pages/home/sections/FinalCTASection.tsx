import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router'

export const FinalCTASection = () => {
    const navigate = useNavigate();

    return (
        <section className="py-20 lg:py-32 border-t border-border/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative"
                >
                    <div className="absolute inset-0 bg-linear-to-r from-primary/20 via-accent/10 to-primary/20 rounded-3xl blur-[60px] opacity-50" />
                    <div className="relative glass-strong rounded-3xl p-8 lg:p-16 text-center overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] opacity-50" />
                        <div className="relative">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                                Ready to See
                                <br />
                                <span className="text-gradient">Lumora for Your Business?</span>
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
                                Get a personalized AI preview showing how Lumora could answer leads, capture customer info, and help book appointments for your business.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button
                                    size="lg"
                                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg glow"
                                    onClick={() => navigate('/register')}
                                >
                                    Request My Free Preview
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full sm:w-auto px-8 py-6 text-lg border-border/50 hover:bg-secondary"
                                    onClick={() => navigate('/contact')}
                                >
                                    Talk to Sales
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground mt-6">
                                See your AI before paying • No free trial required • Activate after approval
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
