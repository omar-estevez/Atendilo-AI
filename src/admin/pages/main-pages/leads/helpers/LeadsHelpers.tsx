import type { LeadStatus } from "@/services/dashboard/leadService";
import { Flame, Thermometer, Snowflake, User } from "lucide-react";

export const formatLabel = (value?: string | null) => {
    if (!value) return "Unknown";

    return value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
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

export const getInitials = (name?: string | null) => {
    if (!name) return "NA";

    return name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
};

export const getLeadStatusClass = (status: LeadStatus) => {
    switch (status) {
        case "hot":
            return "border-red-500/25 bg-red-500/15 text-red-400";
        case "warm":
            return "border-amber-500/25 bg-amber-500/15 text-amber-400";
        case "cold":
            return "border-blue-500/25 bg-blue-500/15 text-blue-400";
        default:
            return "border-border bg-secondary text-muted-foreground";
    }
};

export const getLeadIcon = (status: LeadStatus) => {
    switch (status) {
        case "hot":
            return <Flame className="h-4 w-4 text-red-400" />;
        case "warm":
            return <Thermometer className="h-4 w-4 text-amber-400" />;
        case "cold":
            return <Snowflake className="h-4 w-4 text-blue-400" />;
        default:
            return <User className="h-4 w-4 text-muted-foreground" />;
    }
};

export const getScoreClass = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-blue-400";
    if (score >= 40) return "text-amber-400";
    return "text-red-400";
};