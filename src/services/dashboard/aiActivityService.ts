import { supabase } from "@/lib/supabase";

export type AIActivityType =
    | "ai_reply"
    | "lead_captured"
    | "appointment_scheduled"
    | "call_completed"
    | "follow_up_sent"
    | "case_escalated"
    | "message_analyzed"
    | "workflow_triggered";

export type AIActivityStatus = "success" | "warning" | "error" | "info";

export interface AIActivityLog {
    id: string;
    business_id: string;
    conversation_id: string | null;
    contact_id: string | null;
    type: AIActivityType;
    status: AIActivityStatus;
    title: string;
    description: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
}

export const aiActivityService = {
    async getRecentActivity(limit = 10) {
        const { data, error } = await supabase
            .from("ai_activity_logs")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) {
            throw new Error(error.message);
        }

        return data as AIActivityLog[];
    },

    async getActivityLogs(params?: {
        type?: AIActivityType | "all";
        status?: AIActivityStatus | "all";
        limit?: number;
        from?: number;
    }) {
        const limit = params?.limit ?? 50;
        const from = params?.from ?? 0;
        const to = from + limit - 1;

        let query = supabase
            .from("ai_activity_logs")
            .select("*")
            .order("created_at", { ascending: false })
            .range(from, to);

        if (params?.type && params.type !== "all") {
            query = query.eq("type", params.type);
        }

        if (params?.status && params.status !== "all") {
            query = query.eq("status", params.status);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(error.message);
        }

        return data as AIActivityLog[];
    },

    async createActivityLog(payload: {
        business_id: string;
        conversation_id?: string | null;
        contact_id?: string | null;
        type: AIActivityType;
        status?: AIActivityStatus;
        title: string;
        description?: string | null;
        metadata?: Record<string, unknown>;
    }) {
        const { data, error } = await supabase
            .from("ai_activity_logs")
            .insert({
                business_id: payload.business_id,
                conversation_id: payload.conversation_id || null,
                contact_id: payload.contact_id || null,
                type: payload.type,
                status: payload.status || "info",
                title: payload.title,
                description: payload.description || null,
                metadata: payload.metadata || {},
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as AIActivityLog;
    },
};