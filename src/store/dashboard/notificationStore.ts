import { create } from "zustand";
import {
    notificationService,
    type NotificationChannel,
    type NotificationPreference,
} from "@/services/dashboard/notificationService";

interface NotificationStore {
    notifications: NotificationPreference[];

    isLoading: boolean;
    isSaving: boolean;
    error: string | null;

    loadNotifications: () => Promise<void>;
    saveNotifications: () => Promise<void>;
    toggleNotification: (
        notificationId: string,
        channel: NotificationChannel
    ) => void;
    enableAllForChannel: (channel: NotificationChannel) => void;
    disableAllForChannel: (channel: NotificationChannel) => void;
    clearError: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
    notifications: [],

    isLoading: false,
    isSaving: false,
    error: null,

    loadNotifications: async () => {
        try {
            set({ isLoading: true, error: null });

            const notifications = await notificationService.getPreferences();

            set({
                notifications,
                isLoading: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load notification settings",
                isLoading: false,
            });
        }
    },

    saveNotifications: async () => {
        try {
            set({ isSaving: true, error: null });

            const savedPreferences =
                await notificationService.savePreferences(get().notifications);

            set({
                notifications: savedPreferences,
                isSaving: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to save notification settings",
                isSaving: false,
            });

            throw error;
        }
    },

    toggleNotification: (notificationId, channel) => {
        set({
            notifications: get().notifications.map((notification) =>
                notification.id === notificationId
                    ? {
                        ...notification,
                        [channel]: !notification[channel],
                    }
                    : notification
            ),
        });
    },

    enableAllForChannel: (channel) => {
        set({
            notifications: get().notifications.map((notification) => ({
                ...notification,
                [channel]: true,
            })),
        });
    },

    disableAllForChannel: (channel) => {
        set({
            notifications: get().notifications.map((notification) => ({
                ...notification,
                [channel]: false,
            })),
        });
    },

    clearError: () => {
        set({ error: null });
    },
}));