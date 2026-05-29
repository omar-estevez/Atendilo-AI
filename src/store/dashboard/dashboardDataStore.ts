import { create } from "zustand";
import { channelsService, type Channel } from "@/services/dashboard/channelsService";
import { contactsService, type Contact } from "@/services/dashboard/contactsService";
import {
    conversationsService,
    type ConversationStatus,
    type ConversationWithRelations,
    type RecentConversation,
} from "@/services/dashboard/conversationsService";
import {
    messagesService,
    type Message,
    type MessageSenderType,
} from "@/services/dashboard/messagesService";
import { useAuthStore } from "@/store/authStore";
import {
    aiActivityService,
    type AIActivityLog,
} from "@/services/dashboard/aiActivityService";
import { bookingsService, type Booking } from "@/services/dashboard/bookingsService";
import { aiFlowsService, type AIFlow } from "@/services/dashboard/aiFlowsService";

interface DashboardStats {
    totalContacts: number;
    totalConversations: number;
    openConversations: number;
    activeChannels: number;
    totalMessages: number;
}

interface DashboardDataStore {
    channels: Channel[];
    contacts: Contact[];
    conversations: ConversationWithRelations[];
    selectedConversation: ConversationWithRelations | null;
    recentConversations: RecentConversation[];
    messages: Message[];
    aiActivityLogs: AIActivityLog[];
    bookings: Booking[];
    aiFlows: AIFlow[];

    stats: DashboardStats;

    isLoading: boolean;
    isMessagesLoading: boolean;
    error: string | null;

    loadDashboardData: () => Promise<void>;
    loadChannels: () => Promise<void>;
    loadContacts: () => Promise<void>;
    loadConversations: (status?: ConversationStatus) => Promise<void>;
    selectConversation: (conversationId: string) => Promise<void>;
    sendMessage: (content: string, senderType?: MessageSenderType) => Promise<void>;
    clearSelectedConversation: () => void;
    clearError: () => void;
    updateSelectedConversationStatus: (
        status: ConversationStatus
    ) => Promise<void>;
}

const initialStats: DashboardStats = {
    totalContacts: 0,
    totalConversations: 0,
    openConversations: 0,
    activeChannels: 0,
    totalMessages: 0,
};

export const useDashboardDataStore = create<DashboardDataStore>((set, get) => ({
    channels: [],
    contacts: [],
    conversations: [],
    selectedConversation: null,
    recentConversations: [],
    messages: [],
    stats: initialStats,
    aiActivityLogs: [],
    bookings: [],
    aiFlows: [],

    isLoading: false,
    isMessagesLoading: false,
    error: null,

    loadDashboardData: async () => {
        try {
            set({ isLoading: true, error: null });

            const [
                channels,
                contacts,
                conversations,
                recentConversations,
                latestMessages,
                aiActivityLogs,
                bookings,
                aiFlows,
            ] = await Promise.all([
                channelsService.getChannels(),
                contactsService.getContacts(50),
                conversationsService.getConversations({ limit: 50 }),
                conversationsService.getRecentConversations(5),
                messagesService.getLatestMessages(20),
                aiActivityService.getRecentActivity(10),
                bookingsService.getBookings(),
                aiFlowsService.getActiveFlows(5),
            ]);

            const activeChannels = channels.filter(
                (channel) => channel.status === "active"
            ).length;

            const openConversations = conversations.filter(
                (conversation) => conversation.status === "open"
            ).length;

            set({
                channels,
                contacts,
                conversations,
                recentConversations,
                aiActivityLogs,
                bookings,
                aiFlows,
                stats: {
                    totalContacts: contacts.length,
                    totalConversations: conversations.length,
                    openConversations,
                    activeChannels,
                    totalMessages: latestMessages.length,
                },
                isLoading: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load dashboard data",
                isLoading: false,
            });
        }
    },

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

    loadContacts: async () => {
        try {
            set({ isLoading: true, error: null });

            const contacts = await contactsService.getContacts(50);

            set({
                contacts,
                isLoading: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load contacts",
                isLoading: false,
            });
        }
    },

    loadConversations: async (status?: ConversationStatus) => {
        try {
            set({ isLoading: true, error: null });

            const conversations = await conversationsService.getConversations({
                status,
                limit: 50,
            });

            set({
                conversations,
                isLoading: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load conversations",
                isLoading: false,
            });
        }
    },

    selectConversation: async (conversationId: string) => {
        try {
            set({ isMessagesLoading: true, error: null });

            const [conversation, messages] = await Promise.all([
                conversationsService.getConversationById(conversationId),
                messagesService.getMessagesByConversation(conversationId),
            ]);

            set({
                selectedConversation: conversation,
                messages,
                isMessagesLoading: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load conversation",
                isMessagesLoading: false,
            });
        }
    },

    sendMessage: async (
        content: string,
        senderType: MessageSenderType = "agent"
    ) => {
        try {
            const selectedConversation = get().selectedConversation;
            const business = useAuthStore.getState().business;
            const profile = useAuthStore.getState().profile;

            if (!selectedConversation) {
                throw new Error("No conversation selected");
            }

            if (!business) {
                throw new Error("No business found");
            }

            const newMessage = await messagesService.createMessage({
                business_id: business.id,
                conversation_id: selectedConversation.id,
                sender_type: senderType,
                sender_profile_id: profile?.id || null,
                content,
            });

            set({
                messages: [...get().messages, newMessage],
                conversations: get()
                    .conversations
                    .map((conversation) =>
                        conversation.id === selectedConversation.id
                            ? {
                                ...conversation,
                                last_message_at: newMessage.created_at,
                                messages: [
                                    ...(conversation.messages || []),
                                    {
                                        id: newMessage.id,
                                        content: newMessage.content,
                                        sender_type: newMessage.sender_type,
                                        created_at: newMessage.created_at,
                                    },
                                ],
                            }
                            : conversation
                    )
                    .sort((a, b) => {
                        const dateA = a.last_message_at
                            ? new Date(a.last_message_at).getTime()
                            : 0;

                        const dateB = b.last_message_at
                            ? new Date(b.last_message_at).getTime()
                            : 0;

                        return dateB - dateA;
                    }),
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to send message",
            });

            throw error;
        }
    },

    clearSelectedConversation: () => {
        set({
            selectedConversation: null,
            messages: [],
        });
    },

    clearError: () => {
        set({ error: null });
    },

    updateSelectedConversationStatus: async (status: ConversationStatus) => {
        try {
            const selectedConversation = get().selectedConversation;

            if (!selectedConversation) {
                throw new Error("No conversation selected");
            }

            const updatedConversation =
                await conversationsService.updateConversationStatus(
                    selectedConversation.id,
                    status
                );

            set({
                selectedConversation: updatedConversation,
                conversations: get().conversations.map((conversation) =>
                    conversation.id === updatedConversation.id
                        ? updatedConversation
                        : conversation
                ),
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to update conversation status",
            });

            throw error;
        }
    },
}));