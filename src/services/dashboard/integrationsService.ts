import { supabase } from "@/lib/supabase";

export type IntegrationStatus = "connected" | "disconnected" | "error";

export type IntegrationProvider =
    | "twilio"
    | "stripe"
    | "google_calendar"
    | "zapier"
    | "meta_whatsapp"
    | "smtp_email"
    | "custom";

export interface Integration {
    id: string;
    business_id: string;

    provider: IntegrationProvider;
    name: string;
    description: string | null;

    status: IntegrationStatus;

    config: Record<string, unknown>;

    last_synced_at: string | null;

    created_at: string;
    updated_at: string;
}

export interface CreateIntegrationPayload {
    business_id: string;
    provider: IntegrationProvider;
    name: string;
    description?: string | null;
    status?: IntegrationStatus;
    config?: Record<string, unknown>;
}

export const integrationsService = {
    async getIntegrations() {
        const { data, error } = await supabase
            .from("integrations")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return data as Integration[];
    },

    async createIntegration(payload: CreateIntegrationPayload) {
        const { data, error } = await supabase
            .from("integrations")
            .insert({
                business_id: payload.business_id,
                provider: payload.provider,
                name: payload.name,
                description: payload.description || null,
                status: payload.status || "disconnected",
                config: payload.config || {},
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as Integration;
    },

    async updateIntegration(
        integrationId: string,
        payload: Partial<
            Pick<
                Integration,
                "name" | "description" | "status" | "config" | "last_synced_at"
            >
        >
    ) {
        const { data, error } = await supabase
            .from("integrations")
            .update({
                ...payload,
                updated_at: new Date().toISOString(),
            })
            .eq("id", integrationId)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as Integration;
    },

    async connectIntegration(integrationId: string) {
        return this.updateIntegration(integrationId, {
            status: "connected",
            last_synced_at: new Date().toISOString(),
        });
    },

    async disconnectIntegration(integrationId: string) {
        return this.updateIntegration(integrationId, {
            status: "disconnected",
        });
    },

    async syncIntegration(integrationId: string) {
        return this.updateIntegration(integrationId, {
            status: "connected",
            last_synced_at: new Date().toISOString(),
        });
    },

    async deleteIntegration(integrationId: string) {
        const { error } = await supabase
            .from("integrations")
            .delete()
            .eq("id", integrationId);

        if (error) {
            throw new Error(error.message);
        }

        return true;
    },
};