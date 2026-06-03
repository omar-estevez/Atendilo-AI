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
import { getPercent, formatNumber, formatCurrency, formatLabel, getBreakdownPercent } from "./helpers/AnalyticsHelpers";



export const AnalyticsPage = () => {
    const {
        overview,
        channelAnalytics,
        bookingAnalytics,
        leadIntelligence,
        intentBreakdown,
        sentimentBreakdown,
        isLoading,
        error,
        loadAnalytics,
    } = useAnalyticsStore();

    useEffect(() => {
        loadAnalytics();
    }, [loadAnalytics]);

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
                    <p className="text-sm text-muted-foreground">Human Handoff</p>
                    <h3 className="text-3xl font-bold text-yellow-400">
                        {isLoading || !leadIntelligence
                            ? "..."
                            : formatNumber(leadIntelligence.humanHandoffs)}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Conversations needing human attention
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

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-4">
                <Card className="p-5 border-border/60 bg-card/60">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <div>
                            <h3 className="font-semibold">Lead Intelligence</h3>
                            <p className="text-sm text-muted-foreground">
                                Lead temperature and follow-up opportunities.
                            </p>
                        </div>
                    </div>

                    {leadIntelligence ? (
                        <div className="space-y-3">
                            <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                <p className="text-xs text-muted-foreground">Total Leads</p>
                                <p className="mt-1 text-2xl font-bold">
                                    {formatNumber(leadIntelligence.totalLeads)}
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                                    <p className="text-xs text-red-400">Hot</p>
                                    <p className="mt-1 text-xl font-bold text-red-400">
                                        {leadIntelligence.hotLeads}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3">
                                    <p className="text-xs text-yellow-400">Warm</p>
                                    <p className="mt-1 text-xl font-bold text-yellow-400">
                                        {leadIntelligence.warmLeads}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
                                    <p className="text-xs text-blue-400">Cold</p>
                                    <p className="mt-1 text-xl font-bold text-blue-400">
                                        {leadIntelligence.coldLeads}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Pending Follow-ups</span>
                                    <span className="font-semibold">
                                        {leadIntelligence.pendingFollowUps}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Human Handoffs</span>
                                    <span className="font-semibold">
                                        {leadIntelligence.humanHandoffs}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">
                            No lead intelligence yet.
                        </div>
                    )}
                </Card>

                <Card className="p-5 border-border/60 bg-card/60">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        <div>
                            <h3 className="font-semibold">Intent Breakdown</h3>
                            <p className="text-sm text-muted-foreground">
                                What customers are asking for.
                            </p>
                        </div>
                    </div>

                    {intentBreakdown.length > 0 ? (
                        <div className="space-y-4">
                            {intentBreakdown.slice(0, 6).sort((a, b) => b.count - a.count).map((item) => {
                                const percentage = getBreakdownPercent(item.count, intentBreakdown);

                                return (
                                    <div key={item.label} className="space-y-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-sm font-medium">
                                                {formatLabel(item.label)}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {item.count}
                                            </span>
                                        </div>

                                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-primary"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">
                            No intent data yet.
                        </div>
                    )}
                </Card>

                <Card className="p-5 border-border/60 bg-card/60">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-4 h-4 text-primary" />
                        <div>
                            <h3 className="font-semibold">Sentiment Breakdown</h3>
                            <p className="text-sm text-muted-foreground">
                                Customer mood across conversations.
                            </p>
                        </div>
                    </div>

                    {sentimentBreakdown.length > 0 ? (
                        <div className="space-y-4">
                            {sentimentBreakdown.map((item) => {
                                const percentage = getBreakdownPercent(
                                    item.count,
                                    sentimentBreakdown
                                );

                                return (
                                    <div key={item.label} className="space-y-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-sm font-medium">
                                                {formatLabel(item.label)}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {item.count}
                                            </span>
                                        </div>

                                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-primary"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>

                                        <p className="text-xs text-muted-foreground">
                                            {percentage}% of analyzed conversations
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">
                            No sentiment data yet.
                        </div>
                    )}
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