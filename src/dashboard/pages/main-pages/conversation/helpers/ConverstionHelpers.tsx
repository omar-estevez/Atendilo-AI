import { MessageCircle, Smartphone, Mail, MessageSquare, Inbox, Phone } from "lucide-react";

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



export function safeText(value: unknown, fallback = ""): string {
    if (value === null || value === undefined || value === "") {
        return fallback;
    }

    if (typeof value === "string") {
        return value;
    }

    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }

    if (Array.isArray(value)) {
        return value
            .map((item) => safeText(item, ""))
            .filter(Boolean)
            .join(", ");
    }

    return fallback;
}

export function safeLower(value: unknown) {
    return safeText(value).toLowerCase();
}

export function formatDateSafe(value: unknown) {
    const rawValue = safeText(value);

    if (!rawValue) return "";

    const date = new Date(rawValue);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export function formatLabelSafe(value: unknown, fallback = "Not set") {
    const text = safeText(value, fallback);

    return text
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getInitialsSafe(value: unknown) {
    const text = safeText(value, "Unknown Contact").trim();

    const parts = text.split(" ").filter(Boolean);

    if (parts.length === 0) return "UC";

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function getStatusClassSafe(status: unknown) {
    const value = safeLower(status);

    if (value === "open") {
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    }

    if (value === "pending") {
        return "border-amber-500/30 bg-amber-500/10 text-amber-300";
    }

    if (value === "closed") {
        return "border-muted bg-muted/40 text-muted-foreground";
    }

    return "border-border bg-secondary/40 text-muted-foreground";
}

export function getUrgencyClassSafe(urgency: unknown) {
    const value = safeLower(urgency);

    if (value === "high") {
        return "border-red-500/30 bg-red-500/10 text-red-300";
    }

    if (value === "medium") {
        return "border-amber-500/30 bg-amber-500/10 text-amber-300";
    }

    return "border-border bg-secondary/40 text-muted-foreground";
}

export function getScoreClassSafe(score: unknown) {
    const value = Number(score || 0);

    if (value >= 85) {
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    }

    if (value >= 65) {
        return "border-blue-500/30 bg-blue-500/10 text-blue-300";
    }

    return "border-border bg-secondary/40 text-muted-foreground";
}

export function getChannelIconSafe(type: unknown) {
    const value = safeLower(type);

    if (value === "email") {
        return <Mail className="h-3.5 w-3.5" />;
    }

    if (value === "sms" || value === "whatsapp") {
        return <Phone className="h-3.5 w-3.5" />;
    }

    return <MessageSquare className="h-3.5 w-3.5" />;
}