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
}

const getLeadStatus = (score: number): LeadStatus => {
    if (score >= 80) return "hot";
    if (score >= 50) return "warm";
    return "cold";
};

export const leadsService = {
    async getLeads(limit = 100) {
        const { data, error } = await supabase
            .from("conversations")
            .select(`
                *,
                contacts (*),
                channels (*)
            `)
            .order("last_message_at", {
                ascending: false,
                nullsFirst: false,
            })
            .limit(limit);

        if (error) {
            throw new Error(error.message);
        }

        const conversations = data as LeadConversation[];

        return conversations.map((conversation) => {
            const score = conversation.ai_score || 0;

            return {
                id: conversation.id,
                contactId: conversation.contact_id,
                conversationId: conversation.id,
                contactName:
                    conversation.contacts?.full_name || "Unknown Contact",
                email: conversation.contacts?.email || null,
                phone: conversation.contacts?.phone || null,
                source: conversation.contacts?.source || null,
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
            } satisfies LeadItem;
        });
    },
};