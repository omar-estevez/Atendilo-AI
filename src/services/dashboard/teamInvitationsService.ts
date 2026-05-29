import { supabase } from "@/lib/supabase";
import type { UserRole } from "@/services/businessService";

export type TeamInvitationStatus =
    | "pending"
    | "accepted"
    | "expired"
    | "cancelled";

export interface TeamInvitation {
    id: string;
    business_id: string;
    email: string;
    role: UserRole;
    status: TeamInvitationStatus;
    token: string;
    invited_by: string | null;
    accepted_by: string | null;
    accepted_at: string | null;
    expires_at: string;
    created_at: string;
    updated_at: string | null;
}

export interface CreateTeamInvitationPayload {
    business_id: string;
    email: string;
    role: UserRole;
    invited_by?: string | null;
}

const generateInviteToken = () => {
    return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
};

export const getInviteUrl = (token: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/accept-invite?token=${token}`;
};

export const teamInvitationsService = {
    async getInvitations() {
        const { data, error } = await supabase
            .from("team_invitations")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return data as TeamInvitation[];
    },

    async createInvitation(payload: CreateTeamInvitationPayload) {
        const { data, error } = await supabase
            .from("team_invitations")
            .insert({
                business_id: payload.business_id,
                email: payload.email.toLowerCase().trim(),
                role: payload.role,
                token: generateInviteToken(),
                invited_by: payload.invited_by || null,
                status: "pending",
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as TeamInvitation;
    },

    async cancelInvitation(invitationId: string) {
        const { data, error } = await supabase
            .from("team_invitations")
            .update({
                status: "cancelled",
                updated_at: new Date().toISOString(),
            })
            .eq("id", invitationId)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as TeamInvitation;
    },

    async deleteInvitation(invitationId: string) {
        const { error } = await supabase
            .from("team_invitations")
            .delete()
            .eq("id", invitationId);

        if (error) {
            throw new Error(error.message);
        }

        return true;
    },
};