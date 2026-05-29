import type { WebhookStatus } from "@/services/dashboard/webhooksService";
import { CheckCircle2, PauseCircle, XCircle, AlertTriangle } from "lucide-react";

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

export const getStatusClass = (status: WebhookStatus) => {
    switch (status) {
        case "active":
            return "border-emerald-500/25 bg-emerald-500/15 text-emerald-400";
        case "paused":
            return "border-amber-500/25 bg-amber-500/15 text-amber-400";
        case "failed":
            return "border-red-500/25 bg-red-500/15 text-red-400";
        default:
            return "border-border bg-secondary text-muted-foreground";
    }
};

export const getStatusIcon = (status: WebhookStatus) => {
    switch (status) {
        case "active":
            return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
        case "paused":
            return <PauseCircle className="h-4 w-4 text-amber-400" />;
        case "failed":
            return <XCircle className="h-4 w-4 text-red-400" />;
        default:
            return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
};