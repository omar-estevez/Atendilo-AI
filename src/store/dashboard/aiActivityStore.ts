import { create } from "zustand";
import {
    aiActivityService,
    type AIActivityLog,
    type AIActivityStatus,
    type AIActivityType,
} from "@/services/dashboard/aiActivityService";

interface AIActivityStore {
    logs: AIActivityLog[];
    selectedLog: AIActivityLog | null;

    isLoading: boolean;
    error: string | null;

    loadLogs: (filters?: {
        type?: AIActivityType | "all";
        status?: AIActivityStatus | "all";
    }) => Promise<void>;

    selectLog: (log: AIActivityLog | null) => void;
    clearError: () => void;
}

export const useAIActivityStore = create<AIActivityStore>((set) => ({
    logs: [],
    selectedLog: null,

    isLoading: false,
    error: null,

    loadLogs: async (filters) => {
        try {
            set({ isLoading: true, error: null });

            const logs = await aiActivityService.getActivityLogs({
                type: filters?.type || "all",
                status: filters?.status || "all",
                limit: 100,
            });

            set({
                logs,
                isLoading: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load AI activity logs",
                isLoading: false,
            });
        }
    },

    selectLog: (log) => {
        set({ selectedLog: log });
    },

    clearError: () => {
        set({ error: null });
    },
}));