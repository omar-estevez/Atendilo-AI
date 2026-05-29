import { supabase } from "@/lib/supabase";

export type ChannelType =
    | "whatsapp"
    | "sms"
    | "email"
    | "webchat"
    | "instagram"
    | "facebook";

export type ChannelStatus = "inactive" | "active" | "error";

export interface Channel {
    id: string;
    business_id: string;
    type: ChannelType;
    name: string;
    status: ChannelStatus;
    config: Record<string, unknown>;
    created_at: string;
}

export const channelsService = {
    async getChannels() {
        const { data, error } = await supabase
            .from("channels")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw new Error(error.message);

        return data as Channel[];
    },

    async getChannelByType(type: ChannelType) {
        const { data, error } = await supabase
            .from("channels")
            .select("*")
            .eq("type", type)
            .maybeSingle();

        if (error) throw new Error(error.message);

        return data as Channel | null;
    },

    async createChannel(payload: {
        business_id: string;
        type: ChannelType;
        name: string;
        status?: ChannelStatus;
        config?: Record<string, unknown>;
    }) {
        const { data, error } = await supabase
            .from("channels")
            .insert({
                business_id: payload.business_id,
                type: payload.type,
                name: payload.name,
                status: payload.status || "inactive",
                config: payload.config || {},
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        return data as Channel;
    },

    async updateChannel(
        channelId: string,
        payload: Partial<Pick<Channel, "name" | "status" | "config">>
    ) {
        const { data, error } = await supabase
            .from("channels")
            .update(payload)
            .eq("id", channelId)
            .select()
            .single();

        if (error) throw new Error(error.message);

        return data as Channel;
    },
};