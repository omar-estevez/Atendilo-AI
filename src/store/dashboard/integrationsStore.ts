import { create } from "zustand";
import {
    integrationsService,
    type CreateIntegrationPayload,
    type Integration,
} from "@/services/dashboard/integrationsService";

interface IntegrationsStore {
    integrations: Integration[];
    selectedIntegration: Integration | null;

    isLoading: boolean;
    error: string | null;

    loadIntegrations: () => Promise<void>;
    createIntegration: (payload: CreateIntegrationPayload) => Promise<void>;
    connectIntegration: (integration: Integration) => Promise<void>;
    disconnectIntegration: (integration: Integration) => Promise<void>;
    syncIntegration: (integration: Integration) => Promise<void>;
    deleteIntegration: (integration: Integration) => Promise<void>;
    selectIntegration: (integration: Integration | null) => void;
    clearError: () => void;
}

export const useIntegrationsStore = create<IntegrationsStore>((set, get) => ({
    integrations: [],
    selectedIntegration: null,

    isLoading: false,
    error: null,

    loadIntegrations: async () => {
        try {
            set({ isLoading: true, error: null });

            const integrations = await integrationsService.getIntegrations();

            set({
                integrations,
                selectedIntegration: integrations[0] || null,
                isLoading: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load integrations",
                isLoading: false,
            });
        }
    },

    createIntegration: async (payload) => {
        try {
            set({ isLoading: true, error: null });

            const newIntegration =
                await integrationsService.createIntegration(payload);

            set({
                integrations: [newIntegration, ...get().integrations],
                selectedIntegration: newIntegration,
                isLoading: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to create integration",
                isLoading: false,
            });

            throw error;
        }
    },

    connectIntegration: async (integration) => {
        const updatedIntegration =
            await integrationsService.connectIntegration(integration.id);

        set({
            integrations: get().integrations.map((item) =>
                item.id === updatedIntegration.id ? updatedIntegration : item
            ),
            selectedIntegration:
                get().selectedIntegration?.id === updatedIntegration.id
                    ? updatedIntegration
                    : get().selectedIntegration,
        });
    },

    disconnectIntegration: async (integration) => {
        const updatedIntegration =
            await integrationsService.disconnectIntegration(integration.id);

        set({
            integrations: get().integrations.map((item) =>
                item.id === updatedIntegration.id ? updatedIntegration : item
            ),
            selectedIntegration:
                get().selectedIntegration?.id === updatedIntegration.id
                    ? updatedIntegration
                    : get().selectedIntegration,
        });
    },

    syncIntegration: async (integration) => {
        const updatedIntegration =
            await integrationsService.syncIntegration(integration.id);

        set({
            integrations: get().integrations.map((item) =>
                item.id === updatedIntegration.id ? updatedIntegration : item
            ),
            selectedIntegration:
                get().selectedIntegration?.id === updatedIntegration.id
                    ? updatedIntegration
                    : get().selectedIntegration,
        });
    },

    deleteIntegration: async (integration) => {
        await integrationsService.deleteIntegration(integration.id);

        const remainingIntegrations = get().integrations.filter(
            (item) => item.id !== integration.id
        );

        set({
            integrations: remainingIntegrations,
            selectedIntegration:
                get().selectedIntegration?.id === integration.id
                    ? remainingIntegrations[0] || null
                    : get().selectedIntegration,
        });
    },

    selectIntegration: (integration) => {
        set({ selectedIntegration: integration });
    },

    clearError: () => {
        set({ error: null });
    },
}));