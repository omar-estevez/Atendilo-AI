import { supabase } from "@/lib/supabase";
import type { Contact } from "./contactsService";
import type { Channel } from "./channelsService";

export type ConversationStatus = "open" | "pending" | "closed";

export interface Conversation {
    id: string;
    business_id: string;
    contact_id: string | null;
    channel_id: string | null;
    status: ConversationStatus;
    assigned_to: string | null;
    last_message_at: string | null;
    created_at: string;

    intent: string | null;
    urgency: string | null;
    sentiment: string | null;
    ai_score: number | null;
    ai_summary: string | null;
}

export interface ConversationWithRelations extends Conversation {
    contacts: Contact | null;
    channels: Channel | null;
    messages?: ConversationPreviewMessage[];
}

export interface RecentConversation extends ConversationWithRelations {
    messages?: {
        id: string;
        content: string;
        sender_type: "contact" | "agent" | "ai" | "system";
        created_at: string;
    }[];
}

export interface ConversationPreviewMessage {
    id: string;
    content: string;
    sender_type: "contact" | "agent" | "ai" | "system";
    created_at: string;
}

export const conversationsService = {
    async getConversations(params?: {
        status?: ConversationStatus;
        limit?: number;
        from?: number;
    }) {
        const limit = params?.limit ?? 30;
        const from = params?.from ?? 0;
        const to = from + limit - 1;

        let query = supabase
            .from("conversations")
            .select(`
            *,
            contacts (*),
            channels (*),
            messages (
                id,
                content,
                sender_type,
                created_at
            )
        `)
            .order("last_message_at", {
                ascending: false,
                nullsFirst: false,
            })
            .range(from, to);

        if (params?.status) {
            query = query.eq("status", params.status);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(error.message);
        }

        return data as ConversationWithRelations[];
    },

    async getConversationById(conversationId: string) {
        const { data, error } = await supabase
            .from("conversations")
            .select(`
                *,
                contacts (*),
                channels (*)
            `)
            .eq("id", conversationId)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as ConversationWithRelations;
    },

    async createConversation(payload: {
        business_id: string;
        contact_id?: string | null;
        channel_id?: string | null;
        status?: ConversationStatus;
        assigned_to?: string | null;
    }) {
        const { data, error } = await supabase
            .from("conversations")
            .insert({
                business_id: payload.business_id,
                contact_id: payload.contact_id || null,
                channel_id: payload.channel_id || null,
                status: payload.status || "open",
                assigned_to: payload.assigned_to || null,
                last_message_at: new Date().toISOString(),
            })
            .select(`
                *,
                contacts (*),
                channels (*)
            `)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as ConversationWithRelations;
    },

    async updateConversationStatus(
        conversationId: string,
        status: ConversationStatus
    ) {
        const { data, error } = await supabase
            .from("conversations")
            .update({ status })
            .eq("id", conversationId)
            .select(`
                *,
                contacts (*),
                channels (*)
            `)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as ConversationWithRelations;
    },

    async getRecentConversations(limit = 5) {
        const { data, error } = await supabase
            .from("conversations")
            .select(`
            *,
            contacts (*),
            channels (*),
            messages (
                id,
                content,
                sender_type,
                created_at
            )
        `)
            .order("last_message_at", {
                ascending: false,
                nullsFirst: false,
            })
            .limit(limit);

        if (error) {
            throw new Error(error.message);
        }

        return data as RecentConversation[];
    },
};