import type { TemplateChannel, TemplateType } from "@/services/dashboard/templatesService";
import { Send, CheckCircle2, MessageSquare, Mail, FileText } from "lucide-react";

export const formatLabel = (value?: string | null) => {
    if (!value) return "Unknown";

    return value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const getTypeIcon = (type: TemplateType) => {
    switch (type) {
        case "ai_prompt":
            return <img
                src="/icon.png"
                alt="Icono"
                className="w-5 h-5 object-contain"
            />;
        case "quote":
            return <Send className="h-4 w-4 text-emerald-400" />;
        case "booking_confirmation":
            return <CheckCircle2 className="h-4 w-4 text-blue-400" />;
        case "follow_up":
            return <MessageSquare className="h-4 w-4 text-amber-400" />;
        case "review_request":
            return <Mail className="h-4 w-4 text-purple-400" />;
        default:
            return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
};

export const getTypeClass = (type: TemplateType) => {
    switch (type) {
        case "ai_prompt":
            return "border-primary/25 bg-primary/15 text-primary";
        case "quote":
            return "border-emerald-500/25 bg-emerald-500/15 text-emerald-400";
        case "booking_confirmation":
            return "border-blue-500/25 bg-blue-500/15 text-blue-400";
        case "follow_up":
            return "border-amber-500/25 bg-amber-500/15 text-amber-400";
        case "review_request":
            return "border-purple-500/25 bg-purple-500/15 text-purple-400";
        default:
            return "border-border bg-secondary text-muted-foreground";
    }
};

export const getChannelClass = (channel: TemplateChannel) => {
    switch (channel) {
        case "whatsapp":
            return "border-emerald-500/25 bg-emerald-500/15 text-emerald-400";
        case "sms":
            return "border-blue-500/25 bg-blue-500/15 text-blue-400";
        case "email":
            return "border-purple-500/25 bg-purple-500/15 text-purple-400";
        case "webchat":
            return "border-cyan-500/25 bg-cyan-500/15 text-cyan-400";
        default:
            return "border-primary/25 bg-primary/15 text-primary";
    }
};