import { motion } from "framer-motion"
import { FileText } from "lucide-react"

const lastUpdated = "May 26, 2026"

const sections = [
    {
        title: "1. Acceptance of Terms",
        content: `By accessing or using Atendilo AI services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree with these terms, please do not use our services.

We reserve the right to modify these terms at any time. Changes will become effective immediately after they are posted. Your continued use of the services constitutes your acceptance of the modified terms.`,
    },
    {
        title: "2. Service Description",
        content: `Atendilo AI provides AI-powered virtual receptionist services, including but not limited to:

- Automated responses via chat, SMS, and WhatsApp
- AI voice call handling
- Automated appointment scheduling
- Lead capture and management
- CRM system integrations
- Communication analytics and reporting

The services are subject to availability and may be modified without prior notice.`,
    },
    {
        title: "3. Registration and Account",
        content: `To use our services, you must:

- Be at least 18 years old.
- Provide accurate and complete information during registration.
- Maintain the security of your account and password.
- Notify us immediately of any unauthorized use.

You are responsible for all activities that occur under your account.`,
    },
    {
        title: "4. Acceptable Use",
        content: `When using our services, you agree not to:

- Violate applicable laws or regulations.
- Send illegal, offensive, threatening, or defamatory content.
- Use the services for spam or unsolicited communications.
- Attempt to access unauthorized systems or data.
- Interfere with the normal operation of the services.
- Resell or redistribute the services without authorization.
- Use the services for fraudulent activities.`,
    },
    {
        title: "5. Fees and Payments",
        content: `The prices of our plans are displayed on our website. By subscribing:

- You authorize recurring charges based on the selected plan.
- Payments are processed at the beginning of each billing period.
- Prices may change with 30 days' prior notice.
- Refunds are handled according to our refund policy.
- Applicable taxes will be added where required.

Failure to make payment may result in suspension of the service.`,
    },
    {
        title: "6. Intellectual Property",
        content: `All content, software, and technology belonging to Atendilo AI are protected by copyright, trademark, and other intellectual property laws.

- We grant you a limited, non-exclusive, revocable license to use the services.
- You retain ownership of your content, but grant us a license to process it.
- You may not copy, modify, or distribute our technology without authorization.
- AI-generated data used to improve the service is the property of Atendilo AI.`,
    },
    {
        title: "7. Privacy and Data",
        content: `The use of your information is governed by our Privacy Policy. By using our services:

- You consent to the collection and processing of data according to our policy.
- You are responsible for obtaining consent from your customers when necessary.
- You must comply with applicable data protection laws.`,
    },
    {
        title: "8. Limitation of Liability",
        content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW:

- The services are provided "as is" without warranties of any kind.
- We do not guarantee uninterrupted or error-free availability.
- We are not responsible for indirect, incidental, or consequential losses.
- Our total liability will not exceed the fees paid in the last 12 months.

Some jurisdictions do not allow certain exclusions, so some limitations may not apply to you.`,
    },
    {
        title: "9. Indemnification",
        content: `You agree to indemnify and hold harmless Atendilo AI, its directors, employees, and agents from any claim, damage, loss, or expense, including legal fees, arising from:

- Your use of the services.
- Your violation of these terms.
- Your violation of third-party rights.
- The content you transmit through the services.`,
    },
    {
        title: "10. Termination",
        content: `We may suspend or terminate your access to the services:

- For violation of these terms.
- For failure to pay.
- For fraudulent or illegal activities.
- For any reason with 30 days' notice.

You may cancel your account at any time. After termination, you will no longer have access to the services or associated data.`,
    },
    {
        title: "11. Governing Law",
        content: `These terms are governed by the laws of the State of California, United States, without regard to conflict of law provisions. Any dispute will be resolved in the courts of San Francisco, California, unless the parties agree to arbitration.`,
    },
    {
        title: "12. General Provisions",
        content: `- If any provision is invalid, the remaining provisions will remain in effect.
- Our failure to enforce any right does not constitute a waiver.
- These terms constitute the entire agreement between the parties.
- You may not assign these terms without our written consent.`,
    },
    {
        title: "13. Contact",
        content: `For questions about these Terms of Service:

- Email: legal@Atendiloai.com
- Address: 123 AI Street, Suite 100, San Francisco, CA 94105
- Phone: +1 (555) 123-4567`,
    },
];

export const TermsPage = () => {
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
                            <FileText className="w-4 h-4 text-primary" />
                            <span className="text-sm text-muted-foreground">Legal</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                            Terms of Service
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
                            Welcome to Atendilo AI. These Terms of Service
                            (&quot;Terms&quot;) govern your access to and use of our
                            AI-powered virtual receptionist services. Please read these terms
                            carefully before using our services.
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

export default TermsPage;