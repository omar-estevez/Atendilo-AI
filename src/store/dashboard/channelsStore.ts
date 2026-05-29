import { create } from "zustand";
import {
    channelsService,
    type Channel,
    type ChannelStatus,
    type ChannelType,
} from "@/services/dashboard/channelsService";
import { useAuthStore } from "@/store/authStore";

interface ChannelsStore {
    channels: Channel[];
    selectedChannel: Channel | null;

    isLoading: boolean;
    error: string | null;

    loadChannels: () => Promise<void>;
    loadChannelByType: (type: ChannelType) => Promise<void>;
    createChannelByType: (type: ChannelType) => Promise<void>;
    updateChannelStatus: (
        channel: Channel,
        status: ChannelStatus
    ) => Promise<void>;
    updateChannelConfig: (
        channel: Channel,
        config: Record<string, unknown>
    ) => Promise<void>;
    clearError: () => void;
}

const getChannelName = (type: ChannelType) => {
    switch (type) {
        case "whatsapp":
            return "WhatsApp";
        case "sms":
            return "SMS";
        case "email":
            return "Email";
        case "webchat":
            return "Web Chat";
        case "instagram":
            return "Instagram";
        case "facebook":
            return "Facebook";
        default:
            return type;
    }
};

export const useChannelsStore = create<ChannelsStore>((set, get) => ({
    channels: [],
    selectedChannel: null,

    isLoading: false,
    error: null,

    loadChannels: async () => {
        try {
            set({ isLoading: true, error: null });

            const channels = await channelsService.getChannels();

            set({
                channels,
                isLoading: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load channels",
                isLoading: false,
            });
        }
    },

    loadChannelByType: async (type) => {
        try {
            set({ isLoading: true, error: null });

            const channel = await channelsService.getChannelByType(type);

            set({
                selectedChannel: channel,
                isLoading: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load channel",
                isLoading: false,
            });
        }
    },

    createChannelByType: async (type) => {
        try {
            const business = useAuthStore.getState().business;

            if (!business) {
                throw new Error("No business found");
            }

            set({ isLoading: true, error: null });

            const newChannel = await channelsService.createChannel({
                business_id: business.id,
                type,
                name: getChannelName(type),
                status: "inactive",
                config: {},
            });

            set({
                selectedChannel: newChannel,
                channels: [newChannel, ...get().channels],
                isLoading: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to create channel",
                isLoading: false,
            });

            throw error;
        }
    },

    updateChannelStatus: async (channel, status) => {
        try {
            const updatedChannel = await channelsService.updateChannel(
                channel.id,
                {
                    status,
                }
            );

            set({
                selectedChannel: updatedChannel,
                channels: get().channels.map((item) =>
                    item.id === updatedChannel.id ? updatedChannel : item
                ),
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to update channel status",
            });

            throw error;
        }
    },

    updateChannelConfig: async (channel, config) => {
        try {
            const updatedChannel = await channelsService.updateChannel(
                channel.id,
                {
                    config,
                }
            );

            set({
                selectedChannel: updatedChannel,
                channels: get().channels.map((item) =>
                    item.id === updatedChannel.id ? updatedChannel : item
                ),
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to update channel config",
            });

            throw error;
        }
    },

    clearError: () => {
        set({ error: null });
    },
}));