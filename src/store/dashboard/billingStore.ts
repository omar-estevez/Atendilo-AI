import { create } from "zustand";
import {
    billingService,
    type BillingPlan,
    type BillingSubscription,
    type BillingUsageMetric,
} from "@/services/dashboard/billingService";

interface BillingStore {
    plans: BillingPlan[];
    subscription: BillingSubscription | null;
    usageMetrics: BillingUsageMetric[];

    isLoading: boolean;
    isChangingPlan: boolean;
    error: string | null;

    loadBilling: () => Promise<void>;
    changePlan: (planId: string) => Promise<void>;
    clearError: () => void;
}

export const useBillingStore = create<BillingStore>((set, get) => ({
    plans: [],
    subscription: null,
    usageMetrics: [],

    isLoading: false,
    isChangingPlan: false,
    error: null,

    loadBilling: async () => {
        try {
            set({ isLoading: true, error: null });

            const [plans, subscription] = await Promise.all([
                billingService.getPlans(),
                billingService.getCurrentSubscription(),
            ]);

            const currentPlan = subscription?.plans;

            const usageMetrics = currentPlan
                ? await billingService.getUsage(currentPlan)
                : [];

            set({
                plans,
                subscription,
                usageMetrics,
                isLoading: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load billing",
                isLoading: false,
            });
        }
    },

    changePlan: async (planId) => {
        const subscription = get().subscription;

        if (!subscription) {
            throw new Error("No subscription found.");
        }

        try {
            set({ isChangingPlan: true, error: null });

            const updatedSubscription = await billingService.changePlan(
                subscription.id,
                planId
            );

            const usageMetrics = updatedSubscription.plans
                ? await billingService.getUsage(updatedSubscription.plans)
                : [];

            set({
                subscription: updatedSubscription,
                usageMetrics,
                isChangingPlan: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to change plan",
                isChangingPlan: false,
            });

            throw error;
        }
    },

    clearError: () => {
        set({ error: null });
    },
}));