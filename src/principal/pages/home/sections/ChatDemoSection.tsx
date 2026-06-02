import { motion } from "framer-motion"
import { MessageCircle, Check, Send } from "lucide-react"

const messages = [
    { type: "customer", text: "How much is an interior detail?" },
    { type: "ai", text: "Great question! Our interior detailing starts at $75 for sedans and $95 for SUVs. This includes full vacuum, steam cleaning, leather conditioning, and odor elimination. Would you like to see our full service menu or book an appointment?" },
    { type: "customer", text: "I have an SUV, can I book for tomorrow?" },
    { type: "ai", text: "Perfect! I have availability tomorrow at 9 AM, 11 AM, or 2 PM. Which time works best for you? The service takes about 2 hours, and we can come to your location or you can drop off at our shop." },
]

export const ChatDemoSection = () => {
    return (
        <section className="py-20 lg:py-32 border-y border-border/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                            <MessageCircle className="w-4 h-4 text-primary" />
                            <span className="text-sm text-muted-foreground">Live Demo</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                            See the AI
                            <br />
                            <span className="text-gradient">In Action</span>
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8 text-pretty">
                            Watch how our AI handles real customer conversations—understanding context,
                            answering questions, and booking appointments seamlessly.
                        </p>
                        <ul className="space-y-4">
                            {["Instant responses 24/7", "Natural conversation flow", "Accurate pricing & availability", "Seamless booking experience"].map((item) => (
                                <li key={item} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-primary" />
                                    </div>
                                    <span className="text-muted-foreground">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        {/* Phone Mockup */}
                        <div className="relative mx-auto max-w-[320px]">
                            <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full opacity-50" />
                            <div className="relative glass-strong rounded-[40px] p-2 glow">
                                <div className="bg-background rounded-[32px] overflow-hidden">
                                    {/* Phone Header */}
                                    <div className="bg-secondary/50 px-6 py-4 border-b border-border/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center">
                                                <img
                                                    src="/icon.png"
                                                    alt="Icono"
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-sm">AutoPro Detailing</div>
                                                <div className="text-xs text-primary flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                                    AI Assistant Online
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Chat Messages */}
                                    <div className="p-4 space-y-4 h-[400px] overflow-y-auto">
                                        {messages.map((message, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 10 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: index * 0.2 }}
                                                className={`flex ${message.type === 'customer' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.type === 'customer'
                                                    ? 'bg-primary text-primary-foreground rounded-br-md'
                                                    : 'glass rounded-bl-md'
                                                    }`}>
                                                    <p className="text-sm leading-relaxed">{message.text}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Input */}
                                    <div className="p-4 border-t border-border/50">
                                        <div className="flex items-center gap-2 glass rounded-full px-4 py-3">
                                            <input
                                                type="text"
                                                placeholder="Type a message..."
                                                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                                                readOnly
                                            />
                                            <button className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                                <Send className="w-4 h-4 text-primary-foreground" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
