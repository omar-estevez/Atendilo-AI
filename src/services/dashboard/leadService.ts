import { supabase } from "@/lib/supabase";
import type { Channel } from "@/services/dashboard/channelsService";
import type { Contact } from "@/services/dashboard/contactsService";
import type { ConversationStatus } from "@/services/dashboard/conversationsService";

export interface LeadConversation {
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
    contacts: Contact | null;
    channels: Channel | null;
    follow_up_required: boolean | null;
    follow_up_at: string | null;
    follow_up_note: string | null;
}

export type LeadStatus = "hot" | "warm" | "cold";

export interface LeadItem {
    id: string;
    contactId: string | null;
    contactName: string;
    email: string | null;
    phone: string | null;
    source: string | null;
    channelName: string;
    channelType: string | null;
    status: LeadStatus;
    conversationStatus: ConversationStatus;
    intent: string | null;
    urgency: string | null;
    sentiment: string | null;
    aiScore: number;
    aiSummary: string | null;
    lastActivityAt: string | null;
    createdAt: string;
    conversationId: string;
    followUpRequired: boolean;
    followUpAt: string | null;
    followUpNote: string | null;
}

const getLeadStatus = (score: number): LeadStatus => {
    if (score >= 85) return "hot";
    if (score >= 60) return "warm";

    return "cold";
};

export const leadsService = {
    async getLeads(limit = 100) {
        const leadIntents = [
            "booking_request",
            "price_question",
            "service_question",
            "human_handoff",
            "complaint",
        ];

        const { data, error } = await supabase
            .from("conversations")
            .select(`
      *,
      contacts (*),
      channels (*)
    `)
            .not("ai_score", "is", null)
            .order("last_message_at", {
                ascending: false,
                nullsFirst: false,
            })
            .limit(limit);

        if (error) {
            throw new Error(error.message);
        }

        const conversations = data as LeadConversation[];

        return conversations
            .filter((conversation) => {
                const score = conversation.ai_score || 0;
                const intent = conversation.intent || "";

                return leadIntents.includes(intent) || score >= 75;
            })
            .map((conversation) => {
                const score = conversation.ai_score || 0;

                return {
                    id: conversation.id,
                    contactId: conversation.contact_id,
                    conversationId: conversation.id,
                    contactName: conversation.contacts?.full_name || "Unknown Contact",
                    email: conversation.contacts?.email || null,
                    phone: conversation.contacts?.phone || null,
                    source: conversation.contacts?.source || conversation.channels?.type || null,
                    channelName: conversation.channels?.name || "Unknown Channel",
                    channelType: conversation.channels?.type || null,
                    status: getLeadStatus(score),
                    conversationStatus: conversation.status,
                    intent: conversation.intent,
                    urgency: conversation.urgency,
                    sentiment: conversation.sentiment,
                    aiScore: score,
                    aiSummary: conversation.ai_summary,
                    lastActivityAt: conversation.last_message_at,
                    createdAt: conversation.created_at,
                    followUpRequired: conversation.follow_up_required || false,
                    followUpAt: conversation.follow_up_at || null,
                    followUpNote: conversation.follow_up_note || null,
                } satisfies LeadItem;
            });
    },

    async markFollowUp(conversationId: string, note?: string) {
        const { data, error } = await supabase
            .from("conversations")
            .update({
                follow_up_required: true,
                follow_up_at: new Date().toISOString(),
                follow_up_note: note || null,
            })
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

        return data;
    },

    async clearFollowUp(conversationId: string) {
        const { error } = await supabase
            .from("conversations")
            .update({
                follow_up_required: false,
                follow_up_at: null,
                follow_up_note: null,
            })
            .eq("id", conversationId);

        if (error) {
            throw new Error(error.message);
        }
    }
};