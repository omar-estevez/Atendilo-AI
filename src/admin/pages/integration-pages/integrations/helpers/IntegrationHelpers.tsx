import type { IntegrationProvider, IntegrationStatus } from "@/services/dashboard/integrationsService";
import { MessageCircle, CreditCard, Calendar, Zap, Mail, Plug, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export const formatLabel = (value?: string | null) => {
    if (!value) return "Unknown";

    return value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const formatTimeAgo = (date?: string | null) => {
    if (!date) return "Never";

    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;

    return `${days}d ago`;
};

export const getProviderIcon = (provider: IntegrationProvider) => {
    switch (provider) {
        case "twilio":
            return <MessageCircle className="h-5 w-5 text-blue-400" />;
        case "stripe":
            return <CreditCard className="h-5 w-5 text-purple-400" />;
        case "google_calendar":
            return <Calendar className="h-5 w-5 text-emerald-400" />;
        case "zapier":
            return <Zap className="h-5 w-5 text-amber-400" />;
        case "meta_whatsapp":
            return <MessageCircle className="h-5 w-5 text-emerald-400" />;
        case "smtp_email":
            return <Mail className="h-5 w-5 text-cyan-400" />;
        default:
            return <Plug className="h-5 w-5 text-primary" />;
    }
};

export const getStatusClass = (status: IntegrationStatus) => {
    switch (status) {
        case "connected":
            return "border-emerald-500/25 bg-emerald-500/15 text-emerald-400";
        case "disconnected":
            return "border-amber-500/25 bg-amber-500/15 text-amber-400";
        case "error":
            return "border-red-500/25 bg-red-500/15 text-red-400";
        default:
            return "border-border bg-secondary text-muted-foreground";
    }
};

export const getStatusIcon = (status: IntegrationStatus) => {
    switch (status) {
        case "connected":
            return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
        case "disconnected":
            return <AlertTriangle className="h-4 w-4 text-amber-400" />;
        case "error":
            return <XCircle className="h-4 w-4 text-red-400" />;
        default:
            return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
};