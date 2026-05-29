import type { BookingStatus } from "@/services/dashboard/bookingsService";
import { CheckCircle2, Clock, XCircle, Calendar } from "lucide-react";

export const formatStatus = (status: BookingStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
};

export const formatDate = (date: string) => {
    const targetDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date();

    tomorrow.setDate(today.getDate() + 1);

    if (targetDate.toDateString() === today.toDateString()) {
        return "Today";
    }

    if (targetDate.toDateString() === tomorrow.toDateString()) {
        return "Tomorrow";
    }

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
    }).format(targetDate);
};

export const formatFullDate = (date: string) => {
    return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(new Date(date));
};

export const formatTime = (date: string) => {
    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(date));
};

export const isToday = (date: string) => {
    const targetDate = new Date(date);
    const today = new Date();

    return targetDate.toDateString() === today.toDateString();
};

export const isThisWeek = (date: string) => {
    const targetDate = new Date(date);
    const today = new Date();

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return targetDate >= startOfWeek && targetDate < endOfWeek;
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

export const getStatusClass = (status: BookingStatus) => {
    switch (status) {
        case "confirmed":
            return "border-emerald-500/25 bg-emerald-500/15 text-emerald-400";
        case "pending":
            return "border-amber-500/25 bg-amber-500/15 text-amber-400";
        case "completed":
            return "border-blue-500/25 bg-blue-500/15 text-blue-400";
        case "cancelled":
            return "border-red-500/25 bg-red-500/15 text-red-400";
        default:
            return "border-border bg-secondary text-muted-foreground";
    }
};

export const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
        case "confirmed":
            return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
        case "pending":
            return <Clock className="h-4 w-4 text-amber-400" />;
        case "completed":
            return <CheckCircle2 className="h-4 w-4 text-blue-400" />;
        case "cancelled":
            return <XCircle className="h-4 w-4 text-red-400" />;
        default:
            return <Calendar className="h-4 w-4 text-muted-foreground" />;
    }
};

export const getStatusContainerClass = (status: BookingStatus) => {
    switch (status) {
        case "confirmed":
            return "border-emerald-500/20 bg-emerald-500/10";
        case "pending":
            return "border-amber-500/20 bg-amber-500/10";
        case "completed":
            return "border-blue-500/20 bg-blue-500/10";
        case "cancelled":
            return "border-red-500/20 bg-red-500/10";
        default:
            return "border-primary/20 bg-primary/10";
    }
};