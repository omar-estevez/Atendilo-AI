import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Server, Key, Eye, FileCheck, Globe, Shield, CheckCircle2, AlertTriangle, Users, type LucideIcon, LockKeyhole } from "lucide-react"

interface securityFeaturesTypes {
    icon: LucideIcon,
    title: string,
    description: string,
}

const securityFeatures: securityFeaturesTypes[] = [
    {
        icon: LockKeyhole,
        title: "End-to-End Encryption",
        description:
            "All data is encrypted in transit using TLS 1.3 and at rest using AES-256. Your conversations and customer data are never exposed.",
    },
    {
        icon: Server,
        title: "Secure Infrastructure",
        description:
            "We operate in SOC 2 Type II certified data centers with geographic redundancy, automatic backups, and disaster recovery.",
    },
    {
        icon: Key,
        title: "Advanced Authentication",
        description:
            "Support for multi-factor authentication (MFA), enterprise Single Sign-On (SSO), and customizable password policies.",
    },
    {
        icon: Eye,
        title: "24/7 Monitoring",
        description:
            "Intrusion detection systems, continuous threat monitoring, and real-time incident response.",
    },
    {
        icon: FileCheck,
        title: "Regular Audits",
        description:
            "We perform quarterly penetration testing and independent security audits to ensure data protection.",
    },
    {
        icon: Globe,
        title: "Global Compliance",
        description:
            "We comply with GDPR, CCPA, SOC 2 Type II, and other applicable data protection regulations.",
    },
];

const certifications = [
    { name: "SOC 2 Type II", status: "Certified" },
    { name: "GDPR", status: "Compliant" },
    { name: "CCPA", status: "Compliant" },
    { name: "ISO 27001", status: "In Progress" },
    { name: "HIPAA", status: "Available" },
    { name: "PCI DSS", status: "Compliant" },
];

const practices = [
    {
        title: "Access Control",
        items: [
            "Principle of least privilege for all employees",
            "Quarterly access permission reviews",
            "Mandatory multi-factor authentication",
            "Complete audit logs",
        ],
    },
    {
        title: "Data Protection",
        items: [
            "AES-256 encryption for data at rest",
            "TLS 1.3 for data in transit",
            "Customer data segregation",
            "Configurable retention policies",
        ],
    },
    {
        title: "Incident Response",
        items: [
            "Dedicated 24/7 response team",
            "Documented and tested response plan",
            "Notification within 72 hours when required under GDPR",
            "Detailed post-mortem analysis",
        ],
    },
    {
        title: "Business Continuity",
        items: [
            "Automatic hourly backups",
            "Real-time geographic replication",
            "4-hour RTO and 1-hour RPO",
            "Quarterly recovery testing",
        ],
    },
];

export const SecurityPage = () => {
    return (
        <div className="min-h-screen bg-background">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] opacity-30" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] opacity-20" />
            </div>

            <main className="relative z-10 py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-3xl mx-auto mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                            <Shield className="w-4 h-4 text-primary" />
                            <span className="text-sm text-muted-foreground">Security</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                            Enterprise-Grade
                            <br />
                            <span className="text-gradient">Security</span>
                        </h1>
                        <p className="text-lg text-muted-foreground text-pretty">
                            Protecting your data and your customers&apos; data is our highest
                            priority. Atendilo AI implements industry-leading security practices
                            to keep your business communications safe.
                        </p>
                    </motion.div>

                    {/* Security Features Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20"
                    >
                        {securityFeatures.map((feature) => {

                            const Icon = feature.icon;
                            return (
                                <Card key={feature.title} className="glass p-6 hover:bg-card/80 transition-all border-border/50">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                        <Icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                                </Card>
                            )
                        })}
                    </motion.div>

                    {/* Certifications */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-20"
                    >
                        <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8">
                            Certifications and Compliance
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {certifications.map((cert) => (
                                <Card key={cert.name} className="glass p-4 text-center border-border/50">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                                        <CheckCircle2 className="w-5 h-5 text-primary" />
                                    </div>
                                    <h4 className="font-semibold text-sm mb-1">{cert.name}</h4>
                                    <span className="text-xs text-primary">{cert.status}</span>
                                </Card>
                            ))}
                        </div>
                    </motion.div>

                    {/* Security Practices */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-20"
                    >
                        <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8">
                            Security Practices
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {practices.map((practice) => (
                                <Card key={practice.title} className="glass p-6 border-border/50">
                                    <h3 className="text-lg font-semibold mb-4">{practice.title}</h3>
                                    <ul className="space-y-3">
                                        {practice.items.map((item, index) => (
                                            <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                                                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            ))}
                        </div>
                    </motion.div>

                    {/* Report Vulnerability */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="glass-strong p-8 lg:p-12 border-border/50 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="w-8 h-8 text-primary" />
                            </div>
                            <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                                Responsible Disclosure Program
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                                We value the security community. If you discover a vulnerability
                                in Atendilo AI, please report it responsibly. We offer rewards for
                                valid security reports.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground glow">
                                    <Users className="w-4 h-4 mr-2" />
                                    Report Vulnerability
                                </Button>
                                <Button variant="outline">
                                    View Security Policy
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground mt-6">
                                Contact: security@Atendiloai.com
                            </p>
                        </Card>
                    </motion.div>
                </div>
            </main>
        </div>
    )
}

export default SecurityPage;