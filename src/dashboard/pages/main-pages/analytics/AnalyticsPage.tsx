import { useEffect } from "react";
import {
    Activity,
    BarChart3,
    CalendarCheck,
    CheckCircle2,
    DollarSign,
    MessageSquare,
    RefreshCw,
    TrendingUp,
    Users,
    Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAnalyticsStore } from "@/store/dashboard/analyticsStore";

const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
};

const getPercent = (value: number, total: number) => {
    if (!total) return 0;
    return Math.round((value / total) * 100);
};

export const AnalyticsPage = () => {
    const {
        overview,
        channelAnalytics,
        bookingAnalytics,
        isLoading,
        error,
        loadAnalytics,
    } = useAnalyticsStore();

    useEffect(() => {
        loadAnalytics();
    }, [loadAnalytics]);

    const conversionRate = overview
        ? getPercent(overview.closedConversations, overview.totalConversations)
        : 0;

    const aiAutomationRate = overview
        ? getPercent(overview.aiMessages, overview.totalMessages)
        : 0;

    return (
        <div className="h-full px-5 py-6 sm:px-7 lg:px-8">
            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Analytics
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Track performance across conversations, AI activity,
                        bookings, channels and revenue.
                    </p>
                </div>

                <Button
                    variant="outline"
                    onClick={loadAnalytics}
                    disabled={isLoading}
                >
                    <RefreshCw
                        className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""
                            }`}
                    />
                    Refresh
                </Button>
            </div>

            {error && (
                <Card className="mb-4 border-red-500/30 bg-red-500/10 p-4">
                    <p className="text-sm text-red-400">{error}</p>
                </Card>
            )}

            <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="border-border/50 bg-card/60 p-5">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15">
                        <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Conversations
                    </p>
                    <h3 className="mt-2 text-3xl font-bold">
                        {isLoading || !overview
                            ? "..."
                            : formatNumber(overview.totalConversations)}
                    </h3>
                    <p className="mt-2 text-xs text-muted-foreground">
                        {overview?.openConversations || 0} open conversations
                    </p>
                </Card>

                <Card className="border-border/50 bg-card/60 p-5">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15">
                        <DollarSign className="h-5 w-5 text-emerald-400" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Estimated Revenue
                    </p>
                    <h3 className="mt-2 text-3xl font-bold text-emerald-400">
                        {isLoading || !overview
                            ? "..."
                            : formatCurrency(overview.estimatedRevenue)}
                    </h3>
                    <p className="mt-2 text-xs text-muted-foreground">
                        From current booking pipeline
                    </p>
                </Card>

                <Card className="border-border/50 bg-card/60 p-5">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15">
                        <img
                            src="/icon.png"
                            alt="Icono"
                            className="w-6 h-6 object-contain"
                        />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        AI Automation
                    </p>
                    <h3 className="mt-2 text-3xl font-bold text-blue-400">
                        {isLoading || !overview
                            ? "..."
                            : `${aiAutomationRate}%`}
                    </h3>
                    <p className="mt-2 text-xs text-muted-foreground">
                        {overview?.aiMessages || 0} AI messages sent
                    </p>
                </Card>

                <Card className="border-border/50 bg-card/60 p-5">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15">
                        <TrendingUp className="h-5 w-5 text-amber-400" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Conversion Rate
                    </p>
                    <h3 className="mt-2 text-3xl font-bold text-amber-400">
                        {isLoading || !overview ? "..." : `${conversionRate}%`}
                    </h3>
                    <p className="mt-2 text-xs text-muted-foreground">
                        Based on closed conversations
                    </p>
                </Card>
            </div>

            <div className="mb-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                <Card className="border-border/50 bg-card/60">
                    <div className="border-b border-border/50 bg-background/30 p-5">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            <h2 className="font-semibold">
                                Channel Performance
                            </h2>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Conversations and messages grouped by channel.
                        </p>
                    </div>

                    <div className="p-5">
                        {channelAnalytics.length > 0 ? (
                            <div className="space-y-4">
                                {channelAnalytics.map((channel) => {
                                    const maxConversations = Math.max(
                                        ...channelAnalytics.map(
                                            (item) => item.totalConversations
                                        )
                                    );

                                    const width = getPercent(
                                        channel.totalConversations,
                                        maxConversations
                                    );

                                    return (
                                        <div key={channel.channel}>
                                            <div className="mb-2 flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium capitalize">
                                                        {channel.channel}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {channel.totalMessages}{" "}
                                                        messages
                                                    </p>
                                                </div>

                                                <p className="text-sm font-semibold">
                                                    {
                                                        channel.totalConversations
                                                    }{" "}
                                                    conversations
                                                </p>
                                            </div>

                                            <div className="h-2 overflow-hidden rounded-full bg-secondary">
                                                <div
                                                    className="h-full rounded-full bg-primary"
                                                    style={{
                                                        width: `${width}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex min-h-[240px] flex-col items-center justify-center text-center">
                                <Activity className="mb-3 h-10 w-10 text-muted-foreground" />
                                <p className="font-medium">
                                    No channel analytics yet
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Channel metrics will appear once
                                    conversations are created.
                                </p>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="border-border/50 bg-card/60">
                    <div className="border-b border-border/50 bg-background/30 p-5">
                        <div className="flex items-center gap-2">
                            <CalendarCheck className="h-5 w-5 text-primary" />
                            <h2 className="font-semibold">
                                Booking Pipeline
                            </h2>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Booking value and count by status.
                        </p>
                    </div>

                    <div className="p-5">
                        {bookingAnalytics.length > 0 ? (
                            <div className="space-y-4">
                                {bookingAnalytics.map((item) => (
                                    <div
                                        key={item.status}
                                        className="rounded-xl border border-border/60 bg-background/40 p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium capitalize">
                                                    {item.status}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.count} bookings
                                                </p>
                                            </div>

                                            <p className="font-semibold text-emerald-400">
                                                {formatCurrency(item.value)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex min-h-[240px] flex-col items-center justify-center text-center">
                                <CalendarCheck className="mb-3 h-10 w-10 text-muted-foreground" />
                                <p className="font-medium">
                                    No booking analytics yet
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Create bookings to see pipeline analytics.
                                </p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <Card className="border-border/50 bg-card/60 p-5">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                        <Users className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Total Contacts
                    </p>
                    <h3 className="mt-2 text-2xl font-bold">
                        {overview ? formatNumber(overview.totalContacts) : "..."}
                    </h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-5">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Confirmed Bookings
                    </p>
                    <h3 className="mt-2 text-2xl font-bold">
                        {overview
                            ? formatNumber(overview.confirmedBookings)
                            : "..."}
                    </h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-5">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15">
                        <Zap className="h-5 w-5 text-blue-400" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        AI Events
                    </p>
                    <h3 className="mt-2 text-2xl font-bold">
                        {overview
                            ? formatNumber(overview.aiActivityEvents)
                            : "..."}
                    </h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-5">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15">
                        <Activity className="h-5 w-5 text-cyan-400" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Active Channels
                    </p>
                    <h3 className="mt-2 text-2xl font-bold">
                        {overview
                            ? formatNumber(overview.activeChannels)
                            : "..."}
                    </h3>
                </Card>
            </div>
        </div>
    );
};

export default AnalyticsPage;