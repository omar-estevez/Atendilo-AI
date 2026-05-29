import { create } from "zustand";
import {
    webhooksService,
    type CreateWebhookPayload,
    type Webhook,
    type WebhookStatus,
} from "@/services/dashboard/webhooksService";

interface WebhooksStore {
    webhooks: Webhook[];
    selectedWebhook: Webhook | null;

    isLoading: boolean;
    error: string | null;

    loadWebhooks: () => Promise<void>;
    createWebhook: (payload: CreateWebhookPayload) => Promise<void>;
    updateWebhookStatus: (
        webhook: Webhook,
        status: WebhookStatus
    ) => Promise<void>;
    deleteWebhook: (webhook: Webhook) => Promise<void>;
    testWebhook: (webhook: Webhook) => Promise<void>;
    selectWebhook: (webhook: Webhook | null) => void;
    clearError: () => void;
}

export const useWebhooksStore = create<WebhooksStore>((set, get) => ({
    webhooks: [],
    selectedWebhook: null,

    isLoading: false,
    error: null,

    loadWebhooks: async () => {
        try {
            set({ isLoading: true, error: null });

            const webhooks = await webhooksService.getWebhooks();

            set({
                webhooks,
                selectedWebhook: webhooks[0] || null,
                isLoading: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load webhooks",
                isLoading: false,
            });
        }
    },

    createWebhook: async (payload) => {
        try {
            set({ isLoading: true, error: null });

            const newWebhook = await webhooksService.createWebhook(payload);

            set({
                webhooks: [newWebhook, ...get().webhooks],
                selectedWebhook: newWebhook,
                isLoading: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to create webhook",
                isLoading: false,
            });

            throw error;
        }
    },

    updateWebhookStatus: async (webhook, status) => {
        try {
            const updatedWebhook =
                await webhooksService.updateWebhookStatus(webhook.id, status);

            set({
                webhooks: get().webhooks.map((item) =>
                    item.id === updatedWebhook.id ? updatedWebhook : item
                ),
                selectedWebhook:
                    get().selectedWebhook?.id === updatedWebhook.id
                        ? updatedWebhook
                        : get().selectedWebhook,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to update webhook",
            });

            throw error;
        }
    },

    deleteWebhook: async (webhook) => {
        try {
            await webhooksService.deleteWebhook(webhook.id);

            const remainingWebhooks = get().webhooks.filter(
                (item) => item.id !== webhook.id
            );

            set({
                webhooks: remainingWebhooks,
                selectedWebhook:
                    get().selectedWebhook?.id === webhook.id
                        ? remainingWebhooks[0] || null
                        : get().selectedWebhook,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to delete webhook",
            });

            throw error;
        }
    },

    testWebhook: async (webhook) => {
        try {
            const updatedWebhook = await webhooksService.testWebhook(webhook.id);

            set({
                webhooks: get().webhooks.map((item) =>
                    item.id === updatedWebhook.id ? updatedWebhook : item
                ),
                selectedWebhook:
                    get().selectedWebhook?.id === updatedWebhook.id
                        ? updatedWebhook
                        : get().selectedWebhook,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to test webhook",
            });

            throw error;
        }
    },

    selectWebhook: (webhook) => {
        set({ selectedWebhook: webhook });
    },

    clearError: () => {
        set({ error: null });
    },
}));