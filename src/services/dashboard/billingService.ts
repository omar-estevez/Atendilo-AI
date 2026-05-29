import { supabase } from "@/lib/supabase";

export interface BillingPlan {
    id: string;
    name: string;
    price: number;
    description: string | null;
    max_channels: number;
    max_ai_agents: number;
    max_messages_per_month: number;
    created_at: string;
}

export interface BillingSubscription {
    id: string;
    business_id: string;
    plan_id: string;
    status: "trial" | "active" | "past_due" | "cancelled";
    started_at: string;
    ends_at: string | null;
    created_at: string;
    plans?: BillingPlan;
}

export interface BillingUsageMetric {
    id: string;
    label: string;
    used: number;
    limit: number;
    unit?: string;
}

const getMonthStart = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
};

export const billingService = {
    async getPlans() {
        const { data, error } = await supabase
            .from("plans")
            .select("*")
            .order("price", { ascending: true });

        if (error) {
            throw new Error(error.message);
        }

        return data as BillingPlan[];
    },

    async getCurrentSubscription() {
        const { data, error } = await supabase
            .from("subscriptions")
            .select(`
            *,
            plans (*)
        `)
            .in("status", ["trial", "active", "past_due"])
            .order("created_at", { ascending: false })
            .limit(1);

        if (error) {
            throw new Error(error.message);
        }

        return (data?.[0] || null) as BillingSubscription | null;
    },

    async changePlan(subscriptionId: string, planId: string) {
        const { data, error } = await supabase
            .from("subscriptions")
            .update({
                plan_id: planId,
                status: "active",
                updated_at: new Date().toISOString(),
            })
            .eq("id", subscriptionId)
            .select(`
            *,
            plans (*)
        `)
            .limit(1);

        if (error) {
            throw new Error(error.message);
        }

        const subscription = data?.[0];

        if (!subscription) {
            throw new Error(
                "Subscription was not updated. Check RLS policies for subscriptions."
            );
        }

        return subscription as BillingSubscription;
    },

    async getUsage(plan: BillingPlan) {
        const monthStart = getMonthStart();

        const [
            messagesResult,
            channelsResult,
            aiAgentsResult,
            conversationsResult,
            bookingsResult,
            teamResult,
        ] = await Promise.all([
            supabase
                .from("messages")
                .select("id", { count: "exact", head: true })
                .gte("created_at", monthStart),

            supabase
                .from("channels")
                .select("id", { count: "exact", head: true }),

            supabase
                .from("ai_agents")
                .select("id", { count: "exact", head: true }),

            supabase
                .from("conversations")
                .select("id", { count: "exact", head: true })
                .gte("created_at", monthStart),

            supabase
                .from("bookings")
                .select("id", { count: "exact", head: true })
                .gte("created_at", monthStart),

            supabase
                .from("profiles")
                .select("id", { count: "exact", head: true }),
        ]);

        const results = [
            messagesResult,
            channelsResult,
            aiAgentsResult,
            conversationsResult,
            bookingsResult,
            teamResult,
        ];

        const firstError = results.find((result) => result.error)?.error;

        if (firstError) {
            throw new Error(firstError.message);
        }

        const metrics: BillingUsageMetric[] = [
            {
                id: "messages",
                label: "Messages This Month",
                used: messagesResult.count || 0,
                limit: plan.max_messages_per_month || 1,
            },
            {
                id: "channels",
                label: "Connected Channels",
                used: channelsResult.count || 0,
                limit: plan.max_channels || 1,
            },
            {
                id: "ai_agents",
                label: "AI Agents",
                used: aiAgentsResult.count || 0,
                limit: plan.max_ai_agents || 1,
            },
            {
                id: "conversations",
                label: "Conversations This Month",
                used: conversationsResult.count || 0,
                limit: plan.max_messages_per_month || 1,
            },
            {
                id: "bookings",
                label: "Bookings This Month",
                used: bookingsResult.count || 0,
                limit: 500,
            },
            {
                id: "team",
                label: "Team Members",
                used: teamResult.count || 0,
                limit: 25,
            },
        ];

        return metrics;
    },
};