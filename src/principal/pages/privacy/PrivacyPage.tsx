import { motion } from "framer-motion"
import { Shield } from "lucide-react"

const sections = [
    {
        title: "1. Information We Collect",
        content: `We collect information that you provide directly to us, such as when you create an account, use our services, or contact us. This information may include:

- Account information: name, email address, phone number, and company name.
- Payment information: billing details and payment method, securely processed by third-party providers.
- Communication content: messages, conversations, and data generated through our AI services.
- Usage information: data about how you interact with our services, including access logs and preferences.`,
    },
    {
        title: "2. How We Use Your Information",
        content: `We use the information we collect to:

- Provide, maintain, and improve our AI receptionist services.
- Process transactions and send related communications.
- Personalize and optimize the user experience.
- Train and improve our artificial intelligence models.
- Send marketing communications with your consent.
- Comply with legal obligations and protect our rights.`,
    },
    {
        title: "3. Information Sharing",
        content: `We do not sell your personal information. We may share information with:

- Service providers: companies that help us operate our services, such as payment processors, hosting providers, and analytics tools.
- Business partners: with your consent, to offer integrated services.
- Legal requirements: when required by law or to protect legal rights.
- Business transfers: in the event of a merger, acquisition, or sale of assets.`,
    },
    {
        title: "4. Data Security",
        content: `We implement technical and organizational security measures to protect your information:

- Encryption of data in transit and at rest.
- Strict access controls and multi-factor authentication.
- Continuous security monitoring and threat detection.
- Regular security audits and penetration testing.
- Compliance with industry standards such as SOC 2 and GDPR.`,
    },
    {
        title: "5. Data Retention",
        content: `We retain your personal information for as long as your account is active or as needed to provide services to you. We may also retain information as necessary to:

- Comply with legal obligations.
- Resolve disputes and enforce agreements.
- Improve our services using anonymized data.

You may request the deletion of your account and associated data at any time.`,
    },
    {
        title: "6. Your Rights",
        content: `Depending on your location, you may have the right to:

- Access your personal information.
- Correct inaccurate information.
- Request deletion of your data.
- Export your data in a portable format.
- Object to the processing of your data.
- Withdraw consent at any time.

To exercise these rights, please contact us at privacy@Atendiloai.com.`,
    },
    {
        title: "7. Cookies and Tracking Technologies",
        content: `We use cookies and similar technologies to:

- Keep you signed in.
- Remember your preferences.
- Analyze website usage.
- Personalize content and advertising.

You can control cookies through your browser settings. Please note that disabling cookies may affect the functionality of the service.`,
    },
    {
        title: "8. International Transfers",
        content: `Your data may be transferred to and processed in countries outside your location. We take steps to ensure your data receives appropriate protection, including standard contractual clauses and privacy certifications.`,
    },
    {
        title: "9. Children's Privacy",
        content: `Our services are not intended for individuals under the age of 18. We do not knowingly collect information from minors. If we discover that we have collected information from a minor, we will delete it immediately.`,
    },
    {
        title: "10. Changes to This Policy",
        content: `We may update this policy periodically. We will notify you of significant changes through our website or by email. We encourage you to review this policy regularly.`,
    },
    {
        title: "11. Contact",
        content: `If you have questions about this Privacy Policy, please contact us:

- Email: privacy@Atendiloai.com
- Address: 123 AI Street, Suite 100, San Francisco, CA 94105
- Phone: +1 (555) 123-4567`,
    },
];

export const PrivacyPage = () => {
    const lastUpdated = "May 26, 2026"

    return (
        <div className="min-h-screen bg-background">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] opacity-30" />
            </div>

            <main className="relative z-10 py-16 lg:py-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                            <Shield className="w-4 h-4 text-primary" />
                            <span className="text-sm text-muted-foreground">Legal</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                            Privacy Policy
                        </h1>
                        <p className="text-muted-foreground">
                            Last updated: {lastUpdated}
                        </p>
                    </motion.div>

                    {/* Introduction */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass p-6 lg:p-8 rounded-2xl mb-8"
                    >
                        <p className="text-muted-foreground leading-relaxed">
                            At Atendilo AI (&quot;we&quot;, &quot;our&quot;, or &quot;the Company&quot;), we are committed to protecting
                            your privacy. This Privacy Policy explains how we collect, use,
                            disclose, and protect your information when you use our artificial
                            intelligence receptionist services.
                        </p>
                    </motion.div>

                    {/* Sections */}
                    <div className="space-y-6">
                        {sections.map((section, index) => (
                            <motion.div
                                key={section.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                                className="glass p-6 lg:p-8 rounded-2xl"
                            >
                                <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
                                <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                    {section.content}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>

        </div>
    )
}

export default PrivacyPage;