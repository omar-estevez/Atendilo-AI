import { supabase } from "@/lib/supabase";

export type MessageSenderType = "contact" | "agent" | "ai" | "system";

export interface Message {
    id: string;
    business_id: string;
    conversation_id: string;
    sender_type: MessageSenderType;
    sender_profile_id: string | null;
    content: string;
    metadata: Record<string, unknown>;
    created_at: string;
}

export const messagesService = {
    async getMessagesByConversation(conversationId: string, limit = 50, from = 0) {
        const to = from + limit - 1;

        const { data, error } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: true })
            .range(from, to);

        if (error) {
            throw new Error(error.message);
        }

        return data as Message[];
    },

    async getLatestMessages(limit = 20) {
        const { data, error } = await supabase
            .from("messages")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) {
            throw new Error(error.message);
        }

        return data as Message[];
    },

    async createMessage(payload: {
        business_id: string;
        conversation_id: string;
        sender_type: MessageSenderType;
        sender_profile_id?: string | null;
        content: string;
        metadata?: Record<string, unknown>;
    }) {
        const { data, error } = await supabase
            .from("messages")
            .insert({
                business_id: payload.business_id,
                conversation_id: payload.conversation_id,
                sender_type: payload.sender_type,
                sender_profile_id: payload.sender_profile_id || null,
                content: payload.content,
                metadata: payload.metadata || {},
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        await supabase
            .from("conversations")
            .update({
                last_message_at: new Date().toISOString(),
            })
            .eq("id", payload.conversation_id);

        return data as Message;
    },
};