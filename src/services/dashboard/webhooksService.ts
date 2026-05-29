import { supabase } from "@/lib/supabase";

export type WebhookStatus = "active" | "paused" | "failed";

export interface Webhook {
    id: string;
    business_id: string;

    name: string;
    endpoint_url: string;
    events: string[];

    status: WebhookStatus;

    secret: string | null;
    last_triggered_at: string | null;
    failure_count: number;

    created_at: string;
    updated_at: string;
}

export interface CreateWebhookPayload {
    business_id: string;
    name: string;
    endpoint_url: string;
    events: string[];
    status?: WebhookStatus;
}

const generateWebhookSecret = () => {
    return `whsec_${crypto.randomUUID().replace(/-/g, "")}`;
};

export const webhooksService = {
    async getWebhooks() {
        const { data, error } = await supabase
            .from("webhooks")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return data as Webhook[];
    },

    async createWebhook(payload: CreateWebhookPayload) {
        const { data, error } = await supabase
            .from("webhooks")
            .insert({
                business_id: payload.business_id,
                name: payload.name,
                endpoint_url: payload.endpoint_url,
                events: payload.events,
                status: payload.status || "active",
                secret: generateWebhookSecret(),
                failure_count: 0,
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as Webhook;
    },

    async updateWebhookStatus(webhookId: string, status: WebhookStatus) {
        const { data, error } = await supabase
            .from("webhooks")
            .update({
                status,
                updated_at: new Date().toISOString(),
            })
            .eq("id", webhookId)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as Webhook;
    },

    async deleteWebhook(webhookId: string) {
        const { error } = await supabase
            .from("webhooks")
            .delete()
            .eq("id", webhookId);

        if (error) {
            throw new Error(error.message);
        }

        return true;
    },

    async testWebhook(webhookId: string) {
        /**
         * MVP:
         * This only simulates a test trigger.
         * Later, backend should actually send a signed POST request.
         */
        const { data, error } = await supabase
            .from("webhooks")
            .update({
                last_triggered_at: new Date().toISOString(),
                failure_count: 0,
                status: "active",
                updated_at: new Date().toISOString(),
            })
            .eq("id", webhookId)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as Webhook;
    },
};