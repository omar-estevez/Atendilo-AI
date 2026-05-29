import { supabase } from "@/lib/supabase";

export interface DashboardStats {
    totalContacts: number;
    totalConversations: number;
    openConversations: number;
    activeChannels: number;
    totalMessages: number;
}

export interface ChannelOverview {
    type: "whatsapp" | "sms" | "email" | "webchat" | "instagram" | "facebook";
    name: string;
    status: "inactive" | "active" | "error";
}

export const dashboardService = {
    async getDashboardStats(): Promise<DashboardStats> {
        const [
            contactsResult,
            conversationsResult,
            openConversationsResult,
            activeChannelsResult,
            messagesResult,
        ] = await Promise.all([
            supabase
                .from("contacts")
                .select("id", { count: "exact", head: true }),

            supabase
                .from("conversations")
                .select("id", { count: "exact", head: true }),

            supabase
                .from("conversations")
                .select("id", { count: "exact", head: true })
                .eq("status", "open"),

            supabase
                .from("channels")
                .select("id", { count: "exact", head: true })
                .eq("status", "active"),

            supabase
                .from("messages")
                .select("id", { count: "exact", head: true }),
        ]);

        if (contactsResult.error) throw new Error(contactsResult.error.message);
        if (conversationsResult.error) throw new Error(conversationsResult.error.message);
        if (openConversationsResult.error) throw new Error(openConversationsResult.error.message);
        if (activeChannelsResult.error) throw new Error(activeChannelsResult.error.message);
        if (messagesResult.error) throw new Error(messagesResult.error.message);

        return {
            totalContacts: contactsResult.count || 0,
            totalConversations: conversationsResult.count || 0,
            openConversations: openConversationsResult.count || 0,
            activeChannels: activeChannelsResult.count || 0,
            totalMessages: messagesResult.count || 0,
        };
    },

    async getChannelsOverview(): Promise<ChannelOverview[]> {
        const { data, error } = await supabase
            .from("channels")
            .select("type, name, status")
            .order("created_at", { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return data as ChannelOverview[];
    },
};