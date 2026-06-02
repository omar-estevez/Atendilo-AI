import type { ChannelStatus, ChannelType } from "@/services/dashboard/channelsService";
import { MessageCircle, Smartphone, MessageSquare, Mail, Globe, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export const getChannelTitle = (type?: string) => {
    switch (type) {
        case "whatsapp":
            return "WhatsApp";
        case "sms":
            return "SMS";
        case "webchat":
            return "Web Chat";
        case "email":
            return "Email";
        default:
            return "Channel";
    }
};

export const getChannelDescription = (type?: string) => {
    switch (type) {
        case "whatsapp":
            return "Connect WhatsApp to automate customer messages, replies, quotes and booking flows.";
        case "sms":
            return "Use SMS to send fast replies, reminders, confirmations and follow-up messages.";
        case "webchat":
            return "Add a smart AI web chat widget to your website and capture leads automatically.";
        case "email":
            return "Connect email to manage customer conversations, replies, follow-ups and notifications.";
        default:
            return "Manage this communication channel.";
    }
};

export const getChannelIcon = (type?: string) => {
    switch (type) {
        case "whatsapp":
            return <MessageCircle className="h-7 w-7 text-emerald-400" />;
        case "sms":
            return <Smartphone className="h-7 w-7 text-blue-400" />;
        case "webchat":
            return <MessageSquare className="h-7 w-7 text-cyan-400" />;
        case "email":
            return <Mail className="h-7 w-7 text-purple-400" />;
        default:
            return <Globe className="h-7 w-7 text-primary" />;
    }
};

export const getStatusClass = (status?: ChannelStatus) => {
    switch (status) {
        case "active":
            return "border-emerald-500/25 bg-emerald-500/15 text-emerald-400";
        case "inactive":
            return "border-amber-500/25 bg-amber-500/15 text-amber-400";
        case "error":
            return "border-red-500/25 bg-red-500/15 text-red-400";
        default:
            return "border-border bg-secondary text-muted-foreground";
    }
};

export const getStatusIcon = (status?: ChannelStatus) => {
    switch (status) {
        case "active":
            return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
        case "inactive":
            return <AlertTriangle className="h-4 w-4 text-amber-400" />;
        case "error":
            return <XCircle className="h-4 w-4 text-red-400" />;
        default:
            return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
};

export const getDefaultConfig = (type: ChannelType) => {
    switch (type) {
        case "whatsapp":
            return {
                phone_number: "",
                provider: "twilio",
                auto_reply_enabled: true,
                business_hours_only: false,
            };
        case "sms":
            return {
                phone_number: "",
                provider: "twilio",
                auto_reply_enabled: true,
                reminders_enabled: true,
            };
        case "webchat":
            return {
                widget_title: "Atendilo AI Assistant",
                welcome_message: "Hi! How can I help you today?",
                primary_color: "#38bdf8",
                capture_leads: true,
            };
        case "email":
            return {
                email_address: "",
                provider: "smtp",
                auto_reply_enabled: true,
                follow_ups_enabled: true,
            };
        default:
            return {};
    }
};

export const formatConfigLabel = (key: string) => {
    return key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};