import { create } from "zustand";
import {
    voiceAIService,
    type VoiceCall,
    type VoiceCallStatus,
} from "@/services/dashboard/voiceAiService";

interface VoiceAIStore {
    calls: VoiceCall[];
    selectedCall: VoiceCall | null;

    isLoading: boolean;
    error: string | null;

    loadCalls: () => Promise<void>;
    updateCallStatus: (
        call: VoiceCall,
        status: VoiceCallStatus
    ) => Promise<void>;
    deleteCall: (call: VoiceCall) => Promise<void>;
    selectCall: (call: VoiceCall | null) => void;
    clearError: () => void;
}

export const useVoiceAIStore = create<VoiceAIStore>((set, get) => ({
    calls: [],
    selectedCall: null,

    isLoading: false,
    error: null,

    loadCalls: async () => {
        try {
            set({ isLoading: true, error: null });

            const calls = await voiceAIService.getCalls();

            set({
                calls,
                selectedCall: calls[0] || null,
                isLoading: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load Voice AI calls",
                isLoading: false,
            });
        }
    },

    updateCallStatus: async (call, status) => {
        try {
            const updatedCall = await voiceAIService.updateCallStatus(
                call.id,
                status
            );

            set({
                calls: get().calls.map((item) =>
                    item.id === updatedCall.id ? updatedCall : item
                ),
                selectedCall:
                    get().selectedCall?.id === updatedCall.id
                        ? updatedCall
                        : get().selectedCall,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to update call status",
            });

            throw error;
        }
    },

    deleteCall: async (call) => {
        try {
            await voiceAIService.deleteCall(call.id);

            const remainingCalls = get().calls.filter(
                (item) => item.id !== call.id
            );

            set({
                calls: remainingCalls,
                selectedCall:
                    get().selectedCall?.id === call.id
                        ? remainingCalls[0] || null
                        : get().selectedCall,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to delete call",
            });

            throw error;
        }
    },

    selectCall: (call) => {
        set({ selectedCall: call });
    },

    clearError: () => {
        set({ error: null });
    },
}));