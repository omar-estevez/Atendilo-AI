import {
    Calendar,
    MessageSquare,
    UserPlus,
    Phone,
    Send,
    AlertTriangle,
    Workflow,
} from "lucide-react";

export const getActivityIcon = (type: string) => {
    switch (type) {
        case "appointment_scheduled":
            return <Calendar className="h-4 w-4 text-emerald-400" />;
        case "ai_reply":
            return <MessageSquare className="h-4 w-4 text-primary" />;
        case "lead_captured":
            return <UserPlus className="h-4 w-4 text-yellow-400" />;
        case "call_completed":
            return <Phone className="h-4 w-4 text-purple-400" />;
        case "follow_up_sent":
            return <Send className="h-4 w-4 text-cyan-400" />;
        case "case_escalated":
            return <AlertTriangle className="h-4 w-4 text-red-400" />;
        case "workflow_triggered":
            return <Workflow className="h-4 w-4 text-blue-400" />;
        default:
            return <img
                src="/icon.png"
                alt="Icono"
                className="w-4 h-4 object-contain"
            />;
    }
};

export const getActivityStatusClass = (status: string) => {
    switch (status) {
        case "success":
            return "bg-emerald-500/10 border-emerald-500/25";
        case "warning":
            return "bg-amber-500/10 border-amber-500/25";
        case "error":
            return "bg-red-500/10 border-red-500/25";
        default:
            return "bg-primary/10 border-primary/25";
    }
};

export const formatActivityTime = (date: string) => {
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
    }).format(new Date(date));
};