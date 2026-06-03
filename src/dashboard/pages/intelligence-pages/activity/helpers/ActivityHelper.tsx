import type { AIActivityStatus, AIActivityType } from "@/services/dashboard/aiActivityService";
import { Calendar, MessageSquare, UserPlus, Phone, Send, AlertTriangle, Workflow, CheckCircle2, XCircle, Clock } from "lucide-react";

export const formatLabel = (value?: string | null) => {
    if (!value) return "Unknown";

    return value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const formatTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(date));
};

export const getActivityIcon = (type: string) => {
    switch (type) {
        case "appointment_scheduled":
            return <Calendar className="h-5 w-5 text-emerald-400" />;
        case "ai_reply":
            return <MessageSquare className="h-5 w-5 text-primary" />;
        case "lead_captured":
            return <UserPlus className="h-5 w-5 text-yellow-400" />;
        case "call_completed":
            return <Phone className="h-5 w-5 text-purple-400" />;
        case "follow_up_sent":
            return <Send className="h-5 w-5 text-cyan-400" />;
        case "case_escalated":
            return <AlertTriangle className="h-5 w-5 text-red-400" />;
        case "workflow_triggered":
            return <Workflow className="h-5 w-5 text-blue-400" />;
        default:
            return <img
                src="/icon.png"
                alt="Icono"
                className="w-6 h-6 object-contain"
            />;
    }
};

export const getStatusIcon = (status: string) => {
    switch (status) {
        case "success":
            return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
        case "warning":
            return <AlertTriangle className="h-4 w-4 text-amber-400" />;
        case "error":
            return <XCircle className="h-4 w-4 text-red-400" />;
        default:
            return <Clock className="h-4 w-4 text-primary" />;
    }
};

export const getStatusClass = (status: string) => {
    switch (status) {
        case "success":
            return "border-emerald-500/25 bg-emerald-500/15 text-emerald-400";
        case "warning":
            return "border-amber-500/25 bg-amber-500/15 text-amber-400";
        case "error":
            return "border-red-500/25 bg-red-500/15 text-red-400";
        default:
            return "border-primary/25 bg-primary/15 text-primary";
    }
};

export const getActivityContainerClass = (status: string) => {
    switch (status) {
        case "success":
            return "border-emerald-500/20 bg-emerald-500/10";
        case "warning":
            return "border-amber-500/20 bg-amber-500/10";
        case "error":
            return "border-red-500/20 bg-red-500/10";
        default:
            return "border-primary/20 bg-primary/10";
    }
};

export const getContactDisplayName = (log?: {
    contact?: { full_name: string | null; email: string | null; phone: string | null } | null;
}) => {
    if (!log?.contact) return "No contact linked";

    return (
        log.contact.full_name ||
        log.contact.email ||
        log.contact.phone ||
        "Unknown Contact"
    );
};

export const getConversationDescription = (log?: {
    conversation?: {
        status: string | null;
        intent: string | null;
        ai_score: number | null;
        channels?: { name: string | null; type: string | null } | null;
    } | null;
}) => {
    if (!log?.conversation) return "No conversation linked";

    const channel =
        log.conversation.channels?.name ||
        log.conversation.channels?.type ||
        "Unknown channel";

    const intent = formatLabel(log.conversation.intent);
    const status = formatLabel(log.conversation.status);
    const score = log.conversation.ai_score ?? 0;

    return `${channel} · ${intent} · ${status} · Score ${score}%`;
};

export type AIActivityTypeFilter = AIActivityType | "all";
export type AIActivityStatusFilter = AIActivityStatus | "all";

export const activityTypes: AIActivityTypeFilter[] = [
    "all",
    "ai_reply",
    "lead_captured",
    "appointment_scheduled",
    "call_completed",
    "follow_up_sent",
    "case_escalated",
    "message_analyzed",
    "workflow_triggered",
];

export const activityStatuses: AIActivityStatusFilter[] = [
    "all",
    "success",
    "warning",
    "error",
    "info",
];