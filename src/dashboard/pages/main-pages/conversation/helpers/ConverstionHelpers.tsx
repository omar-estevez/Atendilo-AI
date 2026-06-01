import { MessageCircle, Smartphone, Mail, MessageSquare, Inbox } from "lucide-react";

export const getInitials = (name?: string | null) => {
    if (!name) return "NA";

    return name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
};

export const formatDate = (date?: string | null) => {
    if (!date) return "No activity";

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(date));
};

export const formatLabel = (value?: string | null) => {
    if (!value) return "Unknown";

    return value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const getChannelIcon = (type?: string | null) => {
    switch (type) {
        case "whatsapp":
            return <MessageCircle className="h-4 w-4 text-emerald-400" />;
        case "sms":
            return <Smartphone className="h-4 w-4 text-blue-400" />;
        case "email":
            return <Mail className="h-4 w-4 text-primary" />;
        case "webchat":
            return <MessageSquare className="h-4 w-4 text-cyan-400" />;
        default:
            return <Inbox className="h-4 w-4 text-muted-foreground" />;
    }
};

export const getStatusClass = (status?: string | null) => {
    switch (status) {
        case "open":
            return "border-emerald-500/25 bg-emerald-500/15 text-emerald-400";
        case "pending":
            return "border-amber-500/25 bg-amber-500/15 text-amber-400";
        case "closed":
            return "border-muted bg-secondary text-muted-foreground";
        default:
            return "border-border bg-secondary text-muted-foreground";
    }
};

export const getUrgencyClass = (urgency?: string | null) => {
    switch (urgency) {
        case "high":
            return "border-red-500/25 bg-red-500/15 text-red-400";
        case "medium":
            return "border-amber-500/25 bg-amber-500/15 text-amber-400";
        case "low":
            return "border-blue-500/25 bg-blue-500/15 text-blue-400";
        default:
            return "border-border bg-secondary text-muted-foreground";
    }
};

export const getScoreClass = (score?: number | null) => {
    if (!score) return "border-border bg-secondary text-muted-foreground";
    if (score >= 80) return "border-emerald-500/25 bg-emerald-500/15 text-emerald-400";
    if (score >= 60) return "border-blue-500/25 bg-blue-500/15 text-blue-400";
    if (score >= 40) return "border-amber-500/25 bg-amber-500/15 text-amber-400";
    return "border-red-500/25 bg-red-500/15 text-red-400";
};