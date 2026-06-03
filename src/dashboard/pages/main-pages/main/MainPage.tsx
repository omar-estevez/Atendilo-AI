import { useEffect } from "react";
import { motion } from "framer-motion";
import {
    ArrowUpRight,
    Brain,
    Crown,
    MessageSquare,
    RotateCcw,
    Target,
} from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { useDashboardDataStore } from "@/store/dashboard/dashboardDataStore";
import { useBillingStore } from "@/store/dashboard/billingStore";
import { useAuthStore } from "@/store/authStore";

import { ConversationSection } from "./sections/ConversationSection";
import { AiActivitySection } from "./sections/AiActivitySection";
import { BannerSection } from "./sections/BannerSection";
import { BookingsSection } from "./sections/BookingsSection";
import { AiFlowsSection } from "./sections/AiFlowsSection";
import { getUsageColor, getUsagePercentage } from "./helpers/BillingMainHelpers";
import { FollowUpsSection } from "./sections/FollowUpsSection";

export const MainPage = () => {
    const navigate = useNavigate();

    const {
        loadDashboardData,
        stats,
        isLoading,
    } = useDashboardDataStore();

    const {
        loadBilling,
        usageMetrics,
        subscription,
        isLoading: isBillingLoading,
    } = useBillingStore();

    const { hasModule, hasPermission } = useAuthStore();

    const canViewConversations =
        hasModule("conversations") && hasPermission("conversations.view");

    const canViewAiActivity =
        hasModule("ai_activity") && hasPermission("ai_activity.view");

    const canViewBookings =
        hasModule("bookings") && hasPermission("bookings.view");

    const canViewAiFlows =
        hasModule("ai_flows") && hasPermission("ai_flows.view");

    const canViewBilling =
        hasModule("billing") && hasPermission("billing.view");

    useEffect(() => {
        loadDashboardData();

        if (canViewBilling) {
            loadBilling();
        }
    }, [loadDashboardData, loadBilling, canViewBilling]);

    useEffect(() => {
        const refresh = () => {
            loadDashboardData();

            if (canViewBilling) {
                loadBilling();
            }
        };

        window.addEventListener("Atendilo:refresh", refresh);

        return () => {
            window.removeEventListener("Atendilo:refresh", refresh);
        };
    }, [loadDashboardData, loadBilling, canViewBilling]);

    const kpiCards = [
        {
            id: "conversations",
            label: "Total Conversations",
            value: stats.totalConversations.toLocaleString(),
            change: "All customer conversations",
            icon: MessageSquare,
        },
        {
            id: "pending",
            label: "Pending Conversations",
            value: stats.pendingConversations.toLocaleString(),
            change: "Need human attention",
            icon: Target,
        },
        {
            id: "hot-leads",
            label: "Hot Leads",
            value: stats.hotLeads.toLocaleString(),
            change: "High conversion opportunity",
            icon: Crown,
        },
        {
            id: "follow-ups",
            label: "Pending Follow-ups",
            value: stats.pendingFollowUps.toLocaleString(),
            change: "Marked from Leads",
            icon: RotateCcw,
        },
    ];

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="rounded-2xl border border-border/50 bg-card/60 px-6 py-5 text-center">
                    <Brain className="mx-auto mb-3 h-8 w-8 animate-pulse text-primary" />
                    <p className="font-medium">Loading dashboard data...</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Preparing your Atendilo workspace.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 px-5 py-6 sm:px-7 lg:px-8">
            <BannerSection />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {kpiCards.map((stat, index) => {
                    const Icon = stat.icon;

                    return (
                        <motion.div
                            key={stat.id}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.06 }}
                        >
                            <Card className="relative overflow-hidden border-border/50 bg-linear-to-r from-primary/10 to-accent/5 p-5 backdrop-blur-xl">
                                <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />

                                <div className="relative">
                                    <div className="mb-4 flex items-start justify-between">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/50 bg-background/50 backdrop-blur">
                                            <Icon className="h-5 w-5 text-primary" />
                                        </div>

                                        <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-medium text-emerald-400">
                                            <ArrowUpRight className="h-3 w-3" />
                                            {stat.change}
                                        </span>
                                    </div>

                                    <p className="mb-1 text-3xl font-bold">
                                        {stat.value}
                                    </p>

                                    <p className="text-sm text-muted-foreground">
                                        {stat.label}
                                    </p>

                                    <div className="mt-4 flex h-8 items-end gap-0.5">
                                        {[35, 45, 30, 55, 42, 70, 62, 80, 72, 90, 84, 96].map(
                                            (value, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${value}%` }}
                                                    transition={{
                                                        delay: 0.25 + i * 0.03,
                                                    }}
                                                    className="min-h-[2px] flex-1 rounded-sm bg-primary/30"
                                                />
                                            )
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {canViewConversations && <FollowUpsSection />}

            {(canViewAiActivity || canViewConversations) && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {canViewAiActivity && <AiActivitySection />}
                    {canViewConversations && <ConversationSection />}
                </div>
            )}

            {(canViewBookings || canViewAiFlows) && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {canViewBookings && <BookingsSection />}
                    {canViewAiFlows && <AiFlowsSection />}
                </div>
            )}

            {canViewBilling && (
                <Card className="overflow-hidden border-border/50 bg-card/60">
                    <div className="flex flex-col gap-3 border-b border-border/50 bg-background/30 p-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h3 className="font-semibold">
                                {subscription?.plans?.name || "Current"} Plan Usage
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Current monthly usage across your plan limits.
                            </p>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate("/dashboard/billing")}
                        >
                            <Crown className="mr-2 h-4 w-4" />
                            Manage Plan
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-3 xl:grid-cols-6">
                        {isBillingLoading ? (
                            <div className="col-span-full text-sm text-muted-foreground">
                                Loading usage...
                            </div>
                        ) : usageMetrics.length > 0 ? (
                            usageMetrics.map((metric) => {
                                const percentage = getUsagePercentage(
                                    metric.used,
                                    metric.limit
                                );

                                return (
                                    <div key={metric.id} className="space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            {metric.label}
                                        </p>

                                        <div className="flex items-end justify-between gap-2">
                                            <p className="font-bold">
                                                {metric.used.toLocaleString()}
                                                {metric.unit ? ` ${metric.unit}` : ""}
                                            </p>

                                            <p className="text-xs text-muted-foreground">
                                                / {metric.limit.toLocaleString()}
                                                {metric.unit ? ` ${metric.unit}` : ""}
                                            </p>
                                        </div>

                                        <div className="h-2 overflow-hidden rounded-full bg-secondary">
                                            <div
                                                className={`h-full rounded-full ${getUsageColor(
                                                    percentage
                                                )}`}
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />
                                        </div>

                                        <p className="text-xs text-muted-foreground">
                                            {Math.round(percentage)}% used
                                        </p>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 p-8 text-center">
                                <RotateCcw className="mb-3 h-8 w-8 text-muted-foreground" />
                                <p className="font-medium">No usage data available</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Usage will appear here after billing data loads.
                                </p>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default MainPage;
