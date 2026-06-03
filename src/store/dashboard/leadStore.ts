import { leadsService, type LeadItem } from "@/services/dashboard/leadService";
import { create } from "zustand";

interface LeadsStore {
    leads: LeadItem[];
    selectedLead: LeadItem | null;

    isLoading: boolean;
    error: string | null;

    loadLeads: () => Promise<void>;
    selectLead: (lead: LeadItem | null) => void;
    clearError: () => void;
    markFollowUp: (conversationId: string, note?: string) => void;
    clearFollowUp: (conversationId: string) => Promise<void>;
}

export const useLeadsStore = create<LeadsStore>((set) => ({
    leads: [],
    selectedLead: null,

    isLoading: false,
    error: null,

    loadLeads: async () => {
        try {
            set({ isLoading: true, error: null });

            const leads = await leadsService.getLeads(100);

            set({
                leads,
                selectedLead: leads[0] || null,
                isLoading: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load leads",
                isLoading: false,
            });
        }
    },

    selectLead: (lead) => {
        set({ selectedLead: lead });
    },

    clearError: () => {
        set({ error: null });
    },

    markFollowUp: async (conversationId: string, note?: string) => {
        set({ isLoading: true, error: null });

        try {
            await leadsService.markFollowUp(conversationId, note);

            set((state) => ({
                leads: state.leads.map((lead) =>
                    lead.conversationId === conversationId
                        ? {
                            ...lead,
                            followUpRequired: true,
                            followUpAt: new Date().toISOString(),
                            followUpNote: note || null,
                        }
                        : lead
                ),
                selectedLead:
                    state.selectedLead?.conversationId === conversationId
                        ? {
                            ...state.selectedLead,
                            followUpRequired: true,
                            followUpAt: new Date().toISOString(),
                            followUpNote: note || null,
                        }
                        : state.selectedLead,
                isLoading: false,
            }));
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to mark follow-up",
                isLoading: false,
            });
        }
    },

    clearFollowUp: async (conversationId: string) => {
        set({ isLoading: true, error: null });

        try {
            await leadsService.clearFollowUp(conversationId);

            set((state) => ({
                leads: state.leads.map((lead) =>
                    lead.conversationId === conversationId
                        ? {
                            ...lead,
                            followUpRequired: false,
                            followUpAt: null,
                            followUpNote: null,
                        }
                        : lead
                ),
                selectedLead:
                    state.selectedLead?.conversationId === conversationId
                        ? {
                            ...state.selectedLead,
                            followUpRequired: false,
                            followUpAt: null,
                            followUpNote: null,
                        }
                        : state.selectedLead,
                isLoading: false,
            }));
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to clear follow-up",
                isLoading: false,
            });
        }
    },
}));