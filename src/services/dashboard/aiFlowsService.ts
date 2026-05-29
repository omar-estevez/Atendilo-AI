import { supabase } from "@/lib/supabase";

export type AIFlowStatus = "active" | "draft" | "paused" | "archived";

export interface AIFlow {
    id: string;
    business_id: string;

    name: string;
    description: string | null;
    status: AIFlowStatus;

    trigger_type: string;
    nodes_count: number;
    runs_count: number;
    conversion_rate: number;

    last_run_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateAIFlowPayload {
    business_id: string;
    name: string;
    description?: string | null;
    status?: AIFlowStatus;
    trigger_type?: string;
    nodes_count?: number;
}

export const aiFlowsService = {
    async getFlows() {
        const { data, error } = await supabase
            .from("ai_flows")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return data as AIFlow[];
    },

    async getActiveFlows(limit = 10) {
        const { data, error } = await supabase
            .from("ai_flows")
            .select("*")
            .eq("status", "active")
            .order("runs_count", { ascending: false })
            .limit(limit);

        if (error) {
            throw new Error(error.message);
        }

        return data as AIFlow[];
    },

    async createFlow(payload: CreateAIFlowPayload) {
        const { data, error } = await supabase
            .from("ai_flows")
            .insert({
                business_id: payload.business_id,
                name: payload.name,
                description: payload.description || null,
                status: payload.status || "draft",
                trigger_type: payload.trigger_type || "manual",
                nodes_count: payload.nodes_count || 0,
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as AIFlow;
    },

    async updateFlowStatus(flowId: string, status: AIFlowStatus) {
        const { data, error } = await supabase
            .from("ai_flows")
            .update({
                status,
                updated_at: new Date().toISOString(),
            })
            .eq("id", flowId)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as AIFlow;
    },

    async deleteFlow(flowId: string) {
        const { error } = await supabase
            .from("ai_flows")
            .delete()
            .eq("id", flowId);

        if (error) {
            throw new Error(error.message);
        }

        return true;
    },
};