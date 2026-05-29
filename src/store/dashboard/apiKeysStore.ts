import { create } from "zustand";
import {
    apiKeysService,
    type ApiKey,
    type CreateApiKeyPayload,
} from "@/services/dashboard/apiKeysService";

interface ApiKeysStore {
    apiKeys: ApiKey[];
    newlyCreatedKey: string | null;

    isLoading: boolean;
    error: string | null;

    loadApiKeys: () => Promise<void>;
    createApiKey: (payload: CreateApiKeyPayload) => Promise<void>;
    revokeApiKey: (apiKey: ApiKey) => Promise<void>;
    deleteApiKey: (apiKey: ApiKey) => Promise<void>;
    clearNewlyCreatedKey: () => void;
    clearError: () => void;
}

export const useApiKeysStore = create<ApiKeysStore>((set, get) => ({
    apiKeys: [],
    newlyCreatedKey: null,

    isLoading: false,
    error: null,

    loadApiKeys: async () => {
        try {
            set({ isLoading: true, error: null });

            const apiKeys = await apiKeysService.getApiKeys();

            set({
                apiKeys,
                isLoading: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load API keys",
                isLoading: false,
            });
        }
    },

    createApiKey: async (payload) => {
        try {
            set({ isLoading: true, error: null, newlyCreatedKey: null });

            const result = await apiKeysService.createApiKey(payload);

            set({
                apiKeys: [result.apiKey, ...get().apiKeys],
                newlyCreatedKey: result.rawKey,
                isLoading: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to create API key",
                isLoading: false,
            });

            throw error;
        }
    },

    revokeApiKey: async (apiKey) => {
        try {
            const updatedApiKey = await apiKeysService.revokeApiKey(apiKey.id);

            set({
                apiKeys: get().apiKeys.map((item) =>
                    item.id === updatedApiKey.id ? updatedApiKey : item
                ),
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to revoke API key",
            });

            throw error;
        }
    },

    deleteApiKey: async (apiKey) => {
        try {
            await apiKeysService.deleteApiKey(apiKey.id);

            set({
                apiKeys: get().apiKeys.filter((item) => item.id !== apiKey.id),
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to delete API key",
            });

            throw error;
        }
    },

    clearNewlyCreatedKey: () => {
        set({ newlyCreatedKey: null });
    },

    clearError: () => {
        set({ error: null });
    },
}));