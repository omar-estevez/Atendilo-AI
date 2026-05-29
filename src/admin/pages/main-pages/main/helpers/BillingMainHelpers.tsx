export const getUsagePercentage = (used: number, limit: number) => {
    if (!limit) return 0;
    return Math.min((used / limit) * 100, 100);
};

export const getUsageColor = (percentage: number) => {
    if (percentage >= 95) return "bg-red-400";
    if (percentage >= 85) return "bg-amber-400";
    return "bg-primary";
};