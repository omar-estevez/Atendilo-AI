import {
    Home,
    MessageSquare,
    Phone,
    Calendar,
    Users,
    BarChart3,
    Brain,
    Workflow,
    FileText,
    MessageCircle,
    Smartphone,
    Globe,
    Mail,
    Webhook,
    Plug,
    Key,
    Building2,
    UserCog,
    CreditCard,
    Shield,
    BellRing,
    Sparkles,
} from "lucide-react";

export type NavItem = {
    id: string;
    label: string;
    path: string;
    moduleKey: string;
    icon: React.ElementType;
    badge?: number | string | null;
    status?: "active" | "inactive" | "upgrade";
};

export type NavSection = {
    title: string;
    icon?: React.ElementType;
    items: NavItem[];
};

export const sidebarSections: NavSection[] = [
    {
        title: "Main",
        items: [
            {
                id: "dashboard",
                label: "Dashboard",
                path: "/dashboard",
                moduleKey: "dashboard",
                icon: Home,
            },
            {
                id: "conversations",
                label: "Conversations",
                path: "/dashboard/conversations",
                moduleKey: "conversations",
                icon: MessageSquare,
            },
            {
                id: "voice",
                label: "Voice AI",
                path: "/dashboard/voice",
                moduleKey: "voice_ai",
                icon: Phone,
            },
            {
                id: "bookings",
                label: "Bookings",
                path: "/dashboard/bookings",
                moduleKey: "bookings",
                icon: Calendar,
            },
            {
                id: "leads",
                label: "Leads",
                path: "/dashboard/leads",
                moduleKey: "leads",
                icon: Users,
            },
            {
                id: "analytics",
                label: "Analytics",
                path: "/dashboard/analytics",
                moduleKey: "analytics",
                icon: BarChart3,
            },
        ],
    },
    {
        title: "Intelligence",
        icon: Sparkles,
        items: [
            {
                id: "ai-activity",
                label: "AI Activity",
                path: "/dashboard/ai-activity",
                moduleKey: "ai_activity",
                icon: Brain,
            },
            {
                id: "flows",
                label: "AI Flows",
                path: "/dashboard/flows",
                moduleKey: "ai_flows",
                icon: Workflow,
            },
            {
                id: "templates",
                label: "Templates",
                path: "/dashboard/templates",
                moduleKey: "templates",
                icon: FileText,
            },
        ],
    },
    {
        title: "Channels",
        items: [
            {
                id: "whatsapp",
                label: "WhatsApp",
                path: "/dashboard/channels/whatsapp",
                moduleKey: "whatsapp",
                icon: MessageCircle,
            },
            {
                id: "sms",
                label: "SMS",
                path: "/dashboard/channels/sms",
                moduleKey: "sms",
                icon: Smartphone,
            },
            {
                id: "webchat",
                label: "Web Chat",
                path: "/dashboard/channels/webchat",
                moduleKey: "webchat",
                icon: Globe,
            },
            {
                id: "email",
                label: "Email",
                path: "/dashboard/channels/email",
                moduleKey: "email",
                icon: Mail,
            },
        ],
    },
    {
        title: "Integrations",
        items: [
            {
                id: "webhooks",
                label: "Webhooks",
                path: "/dashboard/webhooks",
                moduleKey: "webhooks",
                icon: Webhook,
            },
            {
                id: "integrations",
                label: "Integrations",
                path: "/dashboard/integrations",
                moduleKey: "integrations",
                icon: Plug,
            },
            {
                id: "api",
                label: "API Keys",
                path: "/dashboard/api",
                moduleKey: "api_keys",
                icon: Key,
            },
        ],
    },
    {
        title: "Configuration",
        items: [
            {
                id: "business",
                label: "Business",
                path: "/dashboard/business",
                moduleKey: "business",
                icon: Building2,
            },
            {
                id: "team",
                label: "Team",
                path: "/dashboard/team",
                moduleKey: "team",
                icon: UserCog,
            },
            {
                id: "billing",
                label: "Billing",
                path: "/dashboard/billing",
                moduleKey: "billing",
                icon: CreditCard,
            },
            {
                id: "security",
                label: "Security",
                path: "/dashboard/security",
                moduleKey: "security",
                icon: Shield,
            },
            {
                id: "notifications",
                label: "Notifications",
                path: "/dashboard/notifications",
                moduleKey: "notifications",
                icon: BellRing,
            },
        ],
    },
];