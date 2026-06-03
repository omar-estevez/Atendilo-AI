import { supabase } from "@/lib/supabase";
import type {
    CreateKnowledgeBasePayload,
    KnowledgeBaseItem,
    UpdateKnowledgeBasePayload,
} from "@/dashboard/types";

export const knowledgeBaseService = {
    async getByBusinessId(businessId: string) {
        const { data, error } = await supabase
            .from("knowledge_base")
            .select("*")
            .eq("business_id", businessId)
            .order("priority", { ascending: false })
            .order("created_at", { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return (data || []) as KnowledgeBaseItem[];
    },

    async create(payload: CreateKnowledgeBasePayload) {
        const { data, error } = await supabase
            .from("knowledge_base")
            .insert({
                business_id: payload.business_id,
                title: payload.title,
                content: payload.content,
                category: payload.category,
                status: payload.status || "active",
                priority: payload.priority ?? 1,
                metadata: payload.metadata || {},
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as KnowledgeBaseItem;
    },

    async update(id: string, payload: UpdateKnowledgeBasePayload) {
        const { data, error } = await supabase
            .from("knowledge_base")
            .update({
                ...payload,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as KnowledgeBaseItem;
    },

    async remove(id: string) {
        const { error } = await supabase.from("knowledge_base").delete().eq("id", id);

        if (error) {
            throw new Error(error.message);
        }

        return true;
    },
};