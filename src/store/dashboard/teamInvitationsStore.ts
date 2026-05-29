import { create } from "zustand";
import {
    teamInvitationsService,
    type CreateTeamInvitationPayload,
    type TeamInvitation,
} from "@/services/dashboard/teamInvitationsService";

interface TeamInvitationsStore {
    invitations: TeamInvitation[];
    newlyCreatedInvitation: TeamInvitation | null;

    isLoading: boolean;
    error: string | null;

    loadInvitations: () => Promise<void>;
    createInvitation: (payload: CreateTeamInvitationPayload) => Promise<void>;
    cancelInvitation: (invitation: TeamInvitation) => Promise<void>;
    deleteInvitation: (invitation: TeamInvitation) => Promise<void>;
    clearNewlyCreatedInvitation: () => void;
    clearError: () => void;
}

export const useTeamInvitationsStore = create<TeamInvitationsStore>((set, get) => ({
    invitations: [],
    newlyCreatedInvitation: null,

    isLoading: false,
    error: null,

    loadInvitations: async () => {
        try {
            set({ isLoading: true, error: null });

            const invitations = await teamInvitationsService.getInvitations();

            set({
                invitations,
                isLoading: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load team invitations",
                isLoading: false,
            });
        }
    },

    createInvitation: async (payload) => {
        try {
            set({
                isLoading: true,
                error: null,
                newlyCreatedInvitation: null,
            });

            const invitation =
                await teamInvitationsService.createInvitation(payload);

            set({
                invitations: [invitation, ...get().invitations],
                newlyCreatedInvitation: invitation,
                isLoading: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to create invitation",
                isLoading: false,
            });

            throw error;
        }
    },

    cancelInvitation: async (invitation) => {
        try {
            const updatedInvitation =
                await teamInvitationsService.cancelInvitation(invitation.id);

            set({
                invitations: get().invitations.map((item) =>
                    item.id === updatedInvitation.id ? updatedInvitation : item
                ),
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to cancel invitation",
            });

            throw error;
        }
    },

    deleteInvitation: async (invitation) => {
        try {
            await teamInvitationsService.deleteInvitation(invitation.id);

            set({
                invitations: get().invitations.filter(
                    (item) => item.id !== invitation.id
                ),
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to delete invitation",
            });

            throw error;
        }
    },

    clearNewlyCreatedInvitation: () => {
        set({ newlyCreatedInvitation: null });
    },

    clearError: () => {
        set({ error: null });
    },
}));