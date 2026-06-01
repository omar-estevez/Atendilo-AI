import type { Plan } from "@/shared/types/plan";

export const mockPlans: Plan[] = [
    {
        id: "starter",
        name: "Starter",
        price: 49,
        description: "Perfect for small businesses just getting started with AI automation.",
        features: [
            "500 AI messages/month",
            "1 connected channel",
            "AI chat assistant",
            "Basic lead capture",
            "Basic analytics",
            "Email support",
        ],
        limits: {
            channels: 1,
            aiAgents: 1,
            messages: 500,
        },
    },
    {
        id: "growth",
        name: "Growth",
        price: 149,
        popular: true,
        description: "For growing businesses that need automation across sales and bookings.",
        features: [
            "5,000 AI messages/month",
            "Up to 3 connected channels/numbers",
            "WhatsApp, SMS & Web Chat",
            "Voice AI calls",
            "Automated booking",
            "AI follow-up flows",
            "Advanced analytics",
            "Priority support",
        ],
        limits: {
            channels: 3,
            aiAgents: 3,
            messages: 5000,
        },
    },
    {
        id: "scale",
        name: "Scale",
        price: 349,
        description: "For established businesses that need advanced automation and integrations.",
        features: [
            "High-volume AI messages*",
            "Up to 10 connected channels/numbers",
            "All communication channels",
            "Custom AI knowledge base",
            "CRM integrations",
            "White-label available",
            "Dedicated account support",
            "API access",
        ],
        limits: {
            channels: 10,
            aiAgents: 10,
            messages: 20000,
        },
    },
]