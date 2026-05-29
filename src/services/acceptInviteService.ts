import { supabase } from "@/lib/supabase";
import type { UserRole } from "@/services/businessService";

export type TeamInvitationStatus =
    | "pending"
    | "accepted"
    | "expired"
    | "cancelled";

export interface PublicTeamInvitation {
    id: string;
    email: string;
    role: UserRole;
    status: TeamInvitationStatus;
    expires_at: string;
    business_name: string;
}

export const acceptInviteService = {
    async getInvitationByToken(token: string) {
        const { data, error } = await supabase.rpc(
            "get_team_invitation_by_token",
            {
                invite_token: token,
            }
        );

        if (error) {
            throw new Error(error.message);
        }

        const invitation = data?.[0];

        if (!invitation) {
            return null;
        }

        return invitation as PublicTeamInvitation;
    },

    async acceptInvitation(token: string) {
        const { data, error } = await supabase.rpc(
            "accept_team_invitation",
            {
                invite_token: token,
            }
        );

        if (error) {
            throw new Error(error.message);
        }

        return data;
    },

    async getSession() {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            throw new Error(error.message);
        }

        return data.session;
    },
};