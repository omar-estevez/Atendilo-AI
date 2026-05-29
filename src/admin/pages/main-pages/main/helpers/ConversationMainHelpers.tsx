export const formatLabel = (value?: string | null) => {
    if (!value) return "Unknown";

    return value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const getLastMessage = (messages?: {
    id: string;
    content: string;
    sender_type: string;
    created_at: string;
}[]) => {
    if (!messages || messages.length === 0) {
        return "No messages yet";
    }

    const sortedMessages = [...messages].sort(
        (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
    );

    return sortedMessages[0].content;
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

export const getUrgencyClass = (urgency?: string | null) => {
    switch (urgency) {
        case "high":
            return "bg-red-500/15 text-red-400 border-red-500/25";
        case "medium":
            return "bg-amber-500/15 text-amber-400 border-amber-500/25";
        case "low":
            return "bg-blue-500/15 text-blue-400 border-blue-500/25";
        default:
            return "bg-secondary text-muted-foreground border-border";
    }
};

export const getSentimentClass = (sentiment?: string | null) => {
    switch (sentiment) {
        case "positive":
            return "bg-emerald-500/15 text-emerald-400 border-emerald-500/25";
        case "negative":
            return "bg-red-500/15 text-red-400 border-red-500/25";
        case "neutral":
            return "bg-yellow-500/15 text-yellow-400 border-yellow-500/25";
        default:
            return "bg-secondary text-muted-foreground border-border";
    }
};

export const getScoreClass = (score?: number | null) => {
    if (!score) return "bg-secondary text-muted-foreground border-border";
    if (score >= 80) return "bg-emerald-500/15 text-emerald-400 border-emerald-500/25";
    if (score >= 60) return "bg-blue-500/15 text-blue-400 border-blue-500/25";
    if (score >= 40) return "bg-amber-500/15 text-amber-400 border-amber-500/25";
    return "bg-red-500/15 text-red-400 border-red-500/25";
};