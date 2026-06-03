export const getUsagePercentage = (
    used?: number | null,
    limit?: number | null
) => {
    const safeUsed = Number(used ?? 0);
    const safeLimit = Number(limit ?? 0);

    if (!Number.isFinite(safeUsed) || !Number.isFinite(safeLimit)) return 0;
    if (safeLimit <= 0) return 0;

    return Math.min(100, Math.max(0, (safeUsed / safeLimit) * 100));
};

export const getUsageColor = (percentage: number) => {
    if (!Number.isFinite(percentage)) return "bg-primary";
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-primary";
};