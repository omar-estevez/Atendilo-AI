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
}));