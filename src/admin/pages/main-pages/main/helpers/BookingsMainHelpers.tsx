export const formatBookingDate = (date: string) => {
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

export const formatBookingTime = (date: string) => {
    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(date));
};

export const getBookingStatusClass = (status: string) => {
    switch (status) {
        case "confirmed":
            return "text-emerald-400";
        case "pending":
            return "text-amber-400";
        case "completed":
            return "text-blue-400";
        case "cancelled":
            return "text-red-400";
        default:
            return "text-muted-foreground";
    }
};