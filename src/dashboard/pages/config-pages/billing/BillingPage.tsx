import { useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    CreditCard,
    Crown,
    Download,
    RefreshCw,
    ShieldCheck,
    Sparkles,
    Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useBillingStore } from "@/store/dashboard/billingStore";
import { useAuthStore } from "@/store/authStore";
import type { BillingPlan } from "@/services/dashboard/billingService";

const premiumFeatures = [
    "Advanced AI flows",
    "Webhooks",
    "API keys",
    "Integrations",
    "Priority support",
    "Multiple channels",
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
};

const getPlanLevel = (name: string) => {
    const value = name.toLowerCase();

    if (value.includes("starter")) return 1;
    if (value.includes("growth")) return 2;
    if (value.includes("scale")) return 3;

    return 0;
};

const getUsagePercentage = (used: number, limit: number) => {
    if (!limit) return 0;
    return Math.min((used / limit) * 100, 100);
};

const getUsageColor = (used: number, limit: number) => {
    const percentage = getUsagePercentage(used, limit);

    if (percentage >= 95) return "bg-red-400";
    if (percentage >= 85) return "bg-amber-400";

    return "bg-primary";
};

const getSubscriptionStatusClass = (status?: string) => {
    switch (status) {
        case "active":
            return "border-emerald-500/25 bg-emerald-500/15 text-emerald-400";
        case "trial":
            return "border-primary/25 bg-primary/15 text-primary";
        case "past_due":
            return "border-amber-500/25 bg-amber-500/15 text-amber-400";
        case "cancelled":
            return "border-red-500/25 bg-red-500/15 text-red-400";
        default:
            return "border-border bg-secondary text-muted-foreground";
    }
};

export const BillingPage = () => {
    const {
        plans,
        subscription,
        usageMetrics,
        isLoading,
        isChangingPlan,
        error,
        loadBilling,
        changePlan,
    } = useBillingStore();

    const { hasPermission, initializeAuth } = useAuthStore();

    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        loadBilling();
    }, [loadBilling]);

    const canManageBilling = hasPermission("billing.manage");

    const currentPlan = subscription?.plans || null;

    const scalePlan = useMemo(() => {
        return plans.find((plan) =>
            plan.name.toLowerCase().includes("scale")
        );
    }, [plans]);

    const currentPlanLevel = currentPlan ? getPlanLevel(currentPlan.name) : 0;

    const handleChangePlan = async (plan: BillingPlan) => {
        if (!subscription) return;

        if (plan.id === subscription.plan_id) return;

        try {
            setSelectedPlanId(plan.id);

            await changePlan(plan.id);

            /**
             * Important:
             * This reloads authStore business/modules after plan change.
             * Your DB trigger should sync business_modules from plan_modules.
             */
            await initializeAuth();

            setSuccessMessage(`Plan changed to ${plan.name}.`);

            window.setTimeout(() => {
                setSuccessMessage("");
            }, 2500);
        } finally {
            setSelectedPlanId(null);
        }
    };

    const handleDownloadInvoice = () => {
        console.log("Stripe invoices not connected yet.");
    };

    return (
        <div className="space-y-6 px-5 py-6 sm:px-7 lg:px-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Billing</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage your Atendilo plan, usage, payment method and billing history.
                    </p>
                </div>

                <Button
                    variant="outline"
                    onClick={loadBilling}
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
                <Card className="border-red-500/30 bg-red-500/10 p-4">
                    <p className="text-sm text-red-400">{error}</p>
                </Card>
            )}

            {successMessage && (
                <Card className="border-emerald-500/30 bg-emerald-500/10 p-4">
                    <p className="flex items-center gap-2 text-sm text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                        {successMessage}
                    </p>
                </Card>
            )}

            <Card className="overflow-hidden border-primary/30 bg-gradient-to-r from-primary/15 via-card to-cyan-500/10">
                <div className="p-6">
                    {isLoading ? (
                        <p className="text-sm text-muted-foreground">
                            Loading billing...
                        </p>
                    ) : currentPlan ? (
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <p className="text-sm text-muted-foreground">
                                        Current Plan
                                    </p>

                                    <span
                                        className={`rounded-full border px-2.5 py-1 text-xs capitalize ${getSubscriptionStatusClass(
                                            subscription?.status
                                        )}`}
                                    >
                                        {subscription?.status}
                                    </span>
                                </div>

                                <h3 className="text-3xl font-bold">
                                    {currentPlan.name}
                                </h3>

                                <div className="mt-4 flex items-end gap-1">
                                    <span className="text-4xl font-bold">
                                        {formatCurrency(currentPlan.price)}
                                    </span>
                                    <span className="mb-1 text-sm text-muted-foreground">
                                        /month
                                    </span>
                                </div>

                                {currentPlan.description && (
                                    <p className="mt-4 max-w-xl text-sm text-muted-foreground">
                                        {currentPlan.description}
                                    </p>
                                )}

                                <div className="mt-5 flex flex-wrap gap-3 text-sm text-muted-foreground">
                                    <span>
                                        {currentPlan.max_channels} channels
                                    </span>
                                    <span>•</span>
                                    <span>
                                        {currentPlan.max_ai_agents} AI agents
                                    </span>
                                    <span>•</span>
                                    <span>
                                        {currentPlan.max_messages_per_month.toLocaleString()} messages/month
                                    </span>
                                </div>
                            </div>

                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/15">
                                <Crown className="h-10 w-10 text-primary" />
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
                            <p className="font-semibold text-amber-400">
                                No subscription found
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                This business does not have a subscription record yet.
                            </p>
                        </div>
                    )}
                </div>
            </Card>

            <Card className="overflow-hidden border-border/50 bg-card/60">
                <div className="border-b border-border/50 bg-background/30 p-5">
                    <h3 className="font-semibold">Monthly Usage</h3>
                    <p className="text-sm text-muted-foreground">
                        Usage is calculated from real workspace data for the current month.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
                    {usageMetrics.length > 0 ? (
                        usageMetrics.map((metric) => {
                            const percentage = getUsagePercentage(
                                metric.used,
                                metric.limit
                            );

                            return (
                                <div
                                    key={metric.id}
                                    className="rounded-xl border border-border/50 bg-background/40 p-4"
                                >
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">
                                            {metric.label}
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            {Math.round(percentage)}% used
                                        </p>
                                    </div>

                                    <div className="flex items-end justify-between">
                                        <p className="text-2xl font-bold">
                                            {metric.used.toLocaleString()}
                                            {metric.unit ? ` ${metric.unit}` : ""}
                                        </p>

                                        <p className="text-sm text-muted-foreground">
                                            / {metric.limit.toLocaleString()}
                                            {metric.unit ? ` ${metric.unit}` : ""}
                                        </p>
                                    </div>

                                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
                                        <div
                                            className={`h-full rounded-full ${getUsageColor(
                                                metric.used,
                                                metric.limit
                                            )}`}
                                            style={{
                                                width: `${percentage}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full p-6 text-center text-sm text-muted-foreground">
                            No usage metrics available.
                        </div>
                    )}
                </div>
            </Card>

            <Card className="overflow-hidden border-border/50 bg-card/60">
                <div className="border-b border-border/50 bg-background/30 p-5">
                    <h3 className="font-semibold">Available Plans</h3>
                    <p className="text-sm text-muted-foreground">
                        Change your plan. Module access updates from your database plan rules.
                    </p>
                </div>

                <div className="grid gap-4 p-5 xl:grid-cols-3">
                    {plans.map((plan) => {
                        const isCurrent = subscription?.plan_id === plan.id;
                        const isUpgrade =
                            currentPlanLevel > 0 &&
                            getPlanLevel(plan.name) > currentPlanLevel;
                        const isDowngrade =
                            currentPlanLevel > 0 &&
                            getPlanLevel(plan.name) < currentPlanLevel;

                        return (
                            <div
                                key={plan.id}
                                className={[
                                    "rounded-2xl border p-5 transition-colors",
                                    isCurrent
                                        ? "border-primary/40 bg-primary/10"
                                        : "border-border/60 bg-background/40",
                                ].join(" ")}
                            >
                                <div className="mb-4 flex items-start justify-between gap-3">
                                    <div>
                                        <h4 className="text-xl font-bold">
                                            {plan.name}
                                        </h4>

                                        {plan.description && (
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {plan.description}
                                            </p>
                                        )}
                                    </div>

                                    {isCurrent && (
                                        <span className="rounded-full border border-primary/25 bg-primary/15 px-2.5 py-1 text-xs text-primary">
                                            Current
                                        </span>
                                    )}
                                </div>

                                <div className="mb-5 flex items-end gap-1">
                                    <span className="text-3xl font-bold">
                                        {formatCurrency(plan.price)}
                                    </span>
                                    <span className="mb-1 text-sm text-muted-foreground">
                                        /month
                                    </span>
                                </div>

                                <div className="mb-5 space-y-2 text-sm text-muted-foreground">
                                    <p className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                        {plan.max_channels} channels
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                        {plan.max_ai_agents} AI agents
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                        {plan.max_messages_per_month.toLocaleString()} messages/month
                                    </p>
                                </div>

                                {canManageBilling && (
                                    <Button
                                        variant={isCurrent ? "outline" : "default"}
                                        disabled={
                                            isCurrent ||
                                            isChangingPlan ||
                                            !subscription
                                        }
                                        onClick={() => handleChangePlan(plan)}
                                        className={
                                            isCurrent
                                                ? "w-full"
                                                : "w-full bg-primary hover:bg-primary/90"
                                        }
                                    >
                                        {selectedPlanId === plan.id
                                            ? "Changing..."
                                            : isCurrent
                                                ? "Current Plan"
                                                : isUpgrade
                                                    ? "Upgrade"
                                                    : isDowngrade
                                                        ? "Downgrade"
                                                        : "Select Plan"}
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>

            {scalePlan && currentPlan?.id !== scalePlan.id && (
                <Card className="overflow-hidden border-amber-500/25 bg-amber-500/5">
                    <div className="border-b border-border/50 p-5">
                        <h3 className="flex items-center gap-2 font-semibold">
                            <Sparkles className="h-5 w-5 text-amber-400" />
                            Scale Features
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Upgrade to Scale to unlock advanced automation and enterprise tools.
                        </p>
                    </div>

                    <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
                        {premiumFeatures.map((feature) => (
                            <div
                                key={feature}
                                className="flex items-center gap-2 rounded-xl border border-border/50 bg-background/40 px-4 py-3"
                            >
                                <Zap className="h-4 w-4 text-amber-400" />
                                <span className="font-medium">{feature}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
                <Card className="overflow-hidden border-border/50 bg-card/60">
                    <div className="border-b border-border/50 bg-background/30 p-5">
                        <h3 className="font-semibold">Payment Method</h3>
                        <p className="text-sm text-muted-foreground">
                            Stripe payment method management will be connected later.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/40">
                                <CreditCard className="h-5 w-5 text-muted-foreground" />
                            </div>

                            <div>
                                <p className="font-medium">
                                    No payment method connected
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Connect Stripe before accepting real payments.
                                </p>
                            </div>
                        </div>

                        <Button variant="outline" disabled>
                            Manage Payment
                        </Button>
                    </div>
                </Card>

                <Card className="overflow-hidden border-border/50 bg-card/60">
                    <div className="border-b border-border/50 bg-background/30 p-5">
                        <h3 className="font-semibold">Invoice History</h3>
                        <p className="text-sm text-muted-foreground">
                            Invoice downloads will come from Stripe later.
                        </p>
                    </div>

                    <div className="p-5">
                        <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
                            <p className="flex items-center gap-2 font-semibold text-amber-400">
                                <AlertTriangle className="h-4 w-4" />
                                Not connected yet
                            </p>

                            <p className="mt-2 text-sm text-muted-foreground">
                                For MVP, plans and usage are real. Payments and invoices should be handled by Stripe Checkout and Stripe Billing.
                            </p>

                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={handleDownloadInvoice}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download demo invoice
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="border-primary/20 bg-primary/10 p-5">
                <p className="flex items-center gap-2 font-semibold text-primary">
                    <ShieldCheck className="h-5 w-5" />
                    MVP Billing Mode
                </p>

                <p className="mt-2 text-sm text-muted-foreground">
                    This page now uses real plans, subscription and usage from Supabase.
                    Payment collection, invoices and cancellation should be connected with Stripe later.
                </p>
            </Card>
        </div>
    );
};

export default BillingPage;