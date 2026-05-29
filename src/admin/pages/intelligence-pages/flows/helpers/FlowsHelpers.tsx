import type { AIFlowStatus } from "@/services/dashboard/aiFlowsService";
import { PlayCircle, Clock, PauseCircle, XCircle, Workflow } from "lucide-react";

export const formatLabel = (value?: string | null) => {
    if (!value) return "Unknown";

    return value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const formatTime = (date?: string | null) => {
    if (!date) return "Never";

    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
    }).format(new Date(date));
};

export const getStatusClass = (status: AIFlowStatus) => {
    switch (status) {
        case "active":
            return "border-emerald-500/25 bg-emerald-500/15 text-emerald-400";
        case "draft":
            return "border-amber-500/25 bg-amber-500/15 text-amber-400";
        case "paused":
            return "border-blue-500/25 bg-blue-500/15 text-blue-400";
        case "archived":
            return "border-red-500/25 bg-red-500/15 text-red-400";
        default:
            return "border-border bg-secondary text-muted-foreground";
    }
};

export const getStatusIcon = (status: AIFlowStatus) => {
    switch (status) {
        case "active":
            return <PlayCircle className="h-4 w-4 text-emerald-400" />;
        case "draft":
            return <Clock className="h-4 w-4 text-amber-400" />;
        case "paused":
            return <PauseCircle className="h-4 w-4 text-blue-400" />;
        case "archived":
            return <XCircle className="h-4 w-4 text-red-400" />;
        default:
            return <Workflow className="h-4 w-4 text-muted-foreground" />;
    }
};

export const getConversionClass = (rate: number) => {
    if (rate >= 75) return "text-emerald-400";
    if (rate >= 50) return "text-blue-400";
    if (rate >= 30) return "text-amber-400";
    return "text-red-400";
};