export const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
};

export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
};

export const getPercent = (value: number, total: number) => {
    if (!total) return 0;
    return Math.round((value / total) * 100);
};

export const formatLabel = (value?: string | null) => {
    if (!value) return "Unknown";

    return value
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const getBreakdownPercent = (count: number, items: { count: number }[]) => {
    const total = items.reduce((sum, item) => sum + item.count, 0);

    if (!total) return 0;

    return Math.round((count / total) * 100);
};