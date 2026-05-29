import type { VoiceCallStatus } from "@/services/dashboard/voiceAiService";
import { Phone, PhoneCall, PhoneMissed, Smile, ThumbsUp, XCircle } from "lucide-react";

export const formatDuration = (seconds: number) => {
    if (!seconds) return "-";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

export const formatTimeAgo = (date?: string | null) => {
    if (!date) return "-";

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

export const getStatusClass = (status: VoiceCallStatus) => {
    switch (status) {
        case "completed":
            return "border-emerald-500/25 bg-emerald-500/15 text-emerald-400";
        case "missed":
            return "border-red-500/25 bg-red-500/15 text-red-400";
        case "failed":
            return "border-amber-500/25 bg-amber-500/15 text-amber-400";
        default:
            return "border-border bg-secondary text-muted-foreground";
    }
};

export const getStatusIcon = (status: VoiceCallStatus) => {
    switch (status) {
        case "completed":
            return <PhoneCall className="h-5 w-5 text-emerald-400" />;
        case "missed":
            return <PhoneMissed className="h-5 w-5 text-red-400" />;
        case "failed":
            return <XCircle className="h-5 w-5 text-amber-400" />;
        default:
            return <Phone className="h-5 w-5 text-primary" />;
    }
};

export const getSentimentIcon = (sentiment?: string | null) => {
    switch (sentiment) {
        case "positive":
            return <ThumbsUp className="h-4 w-4 text-emerald-400" />;
        case "neutral":
            return <Smile className="h-4 w-4 text-amber-400" />;
        case "negative":
            return <XCircle className="h-4 w-4 text-red-400" />;
        default:
            return null;
    }
};