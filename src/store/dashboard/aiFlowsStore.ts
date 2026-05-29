import { create } from "zustand";
import {
    aiFlowsService,
    type AIFlow,
    type AIFlowStatus,
    type CreateAIFlowPayload,
} from "@/services/dashboard/aiFlowsService";

interface AIFlowsStore {
    flows: AIFlow[];
    selectedFlow: AIFlow | null;

    isLoading: boolean;
    error: string | null;

    loadFlows: () => Promise<void>;
    createFlow: (payload: CreateAIFlowPayload) => Promise<void>;
    updateFlowStatus: (flow: AIFlow, status: AIFlowStatus) => Promise<void>;
    deleteFlow: (flow: AIFlow) => Promise<void>;
    selectFlow: (flow: AIFlow | null) => void;
    clearError: () => void;
}

export const useAIFlowsStore = create<AIFlowsStore>((set, get) => ({
    flows: [],
    selectedFlow: null,

    isLoading: false,
    error: null,

    loadFlows: async () => {
        try {
            set({ isLoading: true, error: null });

            const flows = await aiFlowsService.getFlows();

            set({
                flows,
                selectedFlow: flows[0] || null,
                isLoading: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load AI flows",
                isLoading: false,
            });
        }
    },

    createFlow: async (payload) => {
        try {
            set({ isLoading: true, error: null });

            const newFlow = await aiFlowsService.createFlow(payload);

            set({
                flows: [newFlow, ...get().flows],
                selectedFlow: newFlow,
                isLoading: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to create AI flow",
                isLoading: false,
            });

            throw error;
        }
    },

    updateFlowStatus: async (flow, status) => {
        try {
            const updatedFlow = await aiFlowsService.updateFlowStatus(
                flow.id,
                status
            );

            set({
                flows: get().flows.map((item) =>
                    item.id === updatedFlow.id ? updatedFlow : item
                ),
                selectedFlow:
                    get().selectedFlow?.id === updatedFlow.id
                        ? updatedFlow
                        : get().selectedFlow,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to update AI flow",
            });

            throw error;
        }
    },

    deleteFlow: async (flow) => {
        try {
            await aiFlowsService.deleteFlow(flow.id);

            const remainingFlows = get().flows.filter(
                (item) => item.id !== flow.id
            );

            set({
                flows: remainingFlows,
                selectedFlow:
                    get().selectedFlow?.id === flow.id
                        ? remainingFlows[0] || null
                        : get().selectedFlow,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to delete AI flow",
            });

            throw error;
        }
    },

    selectFlow: (flow) => {
        set({ selectedFlow: flow });
    },

    clearError: () => {
        set({ error: null });
    },
}));