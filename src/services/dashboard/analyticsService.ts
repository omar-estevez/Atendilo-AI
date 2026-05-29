import { supabase } from "@/lib/supabase";

export interface AnalyticsOverview {
    totalContacts: number;
    totalConversations: number;
    openConversations: number;
    closedConversations: number;
    totalMessages: number;
    aiMessages: number;
    totalBookings: number;
    confirmedBookings: number;
    completedBookings: number;
    estimatedRevenue: number;
    activeChannels: number;
    aiActivityEvents: number;
}

export interface ChannelAnalytics {
    channel: string;
    totalConversations: number;
    totalMessages: number;
}

export interface BookingAnalytics {
    status: string;
    count: number;
    value: number;
}

export const analyticsService = {
    async getOverview(): Promise<AnalyticsOverview> {
        const [
            contactsResult,
            conversationsResult,
            openConversationsResult,
            closedConversationsResult,
            messagesResult,
            aiMessagesResult,
            bookingsResult,
            confirmedBookingsResult,
            completedBookingsResult,
            channelsResult,
            aiActivityResult,
        ] = await Promise.all([
            supabase.from("contacts").select("id", { count: "exact", head: true }),

            supabase.from("conversations").select("id", {
                count: "exact",
                head: true,
            }),

            supabase
                .from("conversations")
                .select("id", { count: "exact", head: true })
                .eq("status", "open"),

            supabase
                .from("conversations")
                .select("id", { count: "exact", head: true })
                .eq("status", "closed"),

            supabase.from("messages").select("id", { count: "exact", head: true }),

            supabase
                .from("messages")
                .select("id", { count: "exact", head: true })
                .eq("sender_type", "ai"),

            supabase.from("bookings").select("id, estimated_value"),

            supabase
                .from("bookings")
                .select("id", { count: "exact", head: true })
                .eq("status", "confirmed"),

            supabase
                .from("bookings")
                .select("id", { count: "exact", head: true })
                .eq("status", "completed"),

            supabase
                .from("channels")
                .select("id", { count: "exact", head: true })
                .eq("status", "active"),

            supabase
                .from("ai_activity_logs")
                .select("id", { count: "exact", head: true }),
        ]);

        const results = [
            contactsResult,
            conversationsResult,
            openConversationsResult,
            closedConversationsResult,
            messagesResult,
            aiMessagesResult,
            bookingsResult,
            confirmedBookingsResult,
            completedBookingsResult,
            channelsResult,
            aiActivityResult,
        ];

        const firstError = results.find((result) => result.error)?.error;

        if (firstError) {
            throw new Error(firstError.message);
        }

        const estimatedRevenue =
            bookingsResult.data?.reduce(
                (total, booking) =>
                    total + Number(booking.estimated_value || 0),
                0
            ) || 0;

        return {
            totalContacts: contactsResult.count || 0,
            totalConversations: conversationsResult.count || 0,
            openConversations: openConversationsResult.count || 0,
            closedConversations: closedConversationsResult.count || 0,
            totalMessages: messagesResult.count || 0,
            aiMessages: aiMessagesResult.count || 0,
            totalBookings: bookingsResult.data?.length || 0,
            confirmedBookings: confirmedBookingsResult.count || 0,
            completedBookings: completedBookingsResult.count || 0,
            estimatedRevenue,
            activeChannels: channelsResult.count || 0,
            aiActivityEvents: aiActivityResult.count || 0,
        };
    },

    async getChannelAnalytics(): Promise<ChannelAnalytics[]> {
        type ConversationChannelRow = {
            id: string;
            channels:
            | {
                type: string | null;
                name: string | null;
            }
            | {
                type: string | null;
                name: string | null;
            }[]
            | null;
            messages?: { id: string }[] | null;
        };

        const { data, error } = await supabase
            .from("conversations")
            .select(`
            id,
            channels (
                type,
                name
            ),
            messages (
                id
            )
        `);

        if (error) {
            throw new Error(error.message);
        }

        const rows = (data || []) as ConversationChannelRow[];

        const grouped = new Map<string, ChannelAnalytics>();

        rows.forEach((conversation) => {
            const channel = Array.isArray(conversation.channels)
                ? conversation.channels[0]
                : conversation.channels;

            const channelName =
                channel?.name ||
                channel?.type ||
                "Unknown";

            const current = grouped.get(channelName) || {
                channel: channelName,
                totalConversations: 0,
                totalMessages: 0,
            };

            current.totalConversations += 1;
            current.totalMessages += conversation.messages?.length || 0;

            grouped.set(channelName, current);
        });

        return Array.from(grouped.values());
    },

    async getBookingAnalytics(): Promise<BookingAnalytics[]> {
        const { data, error } = await supabase
            .from("bookings")
            .select("status, estimated_value");

        if (error) {
            throw new Error(error.message);
        }

        const grouped = new Map<string, BookingAnalytics>();

        data?.forEach((booking) => {
            const status = booking.status || "unknown";

            const current = grouped.get(status) || {
                status,
                count: 0,
                value: 0,
            };

            current.count += 1;
            current.value += Number(booking.estimated_value || 0);

            grouped.set(status, current);
        });

        return Array.from(grouped.values());
    },
};