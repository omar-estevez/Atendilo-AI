import { create } from "zustand";
import {
    businessService,
    type Profile,
    type UserRole,
} from "@/services/businessService";

interface TeamStore {
    members: Profile[];
    selectedMember: Profile | null;

    isLoading: boolean;
    error: string | null;

    loadTeamMembers: () => Promise<void>;
    updateMemberRole: (member: Profile, role: UserRole) => Promise<void>;
    selectMember: (member: Profile | null) => void;
    clearError: () => void;
}

export const useTeamStore = create<TeamStore>((set, get) => ({
    members: [],
    selectedMember: null,

    isLoading: false,
    error: null,

    loadTeamMembers: async () => {
        try {
            set({ isLoading: true, error: null });

            const members = await businessService.getTeamMembers();

            set({
                members,
                selectedMember: members[0] || null,
                isLoading: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load team members",
                isLoading: false,
            });
        }
    },

    updateMemberRole: async (member, role) => {
        try {
            const updatedMember =
                await businessService.updateTeamMemberRole(member.id, role);

            set({
                members: get().members.map((item) =>
                    item.id === updatedMember.id ? updatedMember : item
                ),
                selectedMember:
                    get().selectedMember?.id === updatedMember.id
                        ? updatedMember
                        : get().selectedMember,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to update member role",
            });

            throw error;
        }
    },

    selectMember: (member) => {
        set({ selectedMember: member });
    },

    clearError: () => {
        set({ error: null });
    },
}));