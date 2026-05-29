import { supabase } from "../lib/supabase";

export type UserRole = "owner" | "admin" | "agent" | "viewer";

export interface Profile {
    id: string;
    business_id: string | null;
    full_name: string | null;
    email: string;
    role: UserRole;
    avatar_url: string | null;
    created_at: string;
}

export interface Business {
    id: string;
    name: string;
    slug: string;
    industry: string | null;
    logo_url: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;

    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    timezone: string | null;

    settings: Record<string, unknown>;

    created_at: string;
    updated_at: string | null;
}

export interface UpdateBusinessPayload {
    name?: string;
    industry?: string | null;
    logo_url?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;

    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    timezone?: string | null;

    settings?: Record<string, unknown>;
}

export interface Plan {
    id: string;
    name: string;
    price: number;
    description: string | null;
    max_channels: number;
    max_ai_agents: number;
    max_messages_per_month: number;
    created_at: string;
}

export interface Subscription {
    id: string;
    business_id: string;
    plan_id: string;
    status: "trial" | "active" | "past_due" | "cancelled";
    started_at: string;
    ends_at: string | null;
    created_at: string;
    plans?: Plan;
}

export const businessService = {
    async getMyProfile() {
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError) {
            throw new Error(userError.message);
        }

        const user = userData.user;

        if (!user) {
            throw new Error("No authenticated user found");
        }

        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as Profile;
    },

    async getMyBusiness() {
        const { data, error } = await supabase
            .from("businesses")
            .select("*")
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as Business;
    },

    async getMySubscription() {
        const { data, error } = await supabase
            .from("subscriptions")
            .select(`
        *,
        plans (*)
      `)
            .single();

        if (error) {
            throw new Error(error.message);
        }


        return data as Subscription;
    },

    async updateBusiness(
        businessId: string,
        payload: UpdateBusinessPayload
    ) {
        const { data, error } = await supabase
            .from("businesses")
            .update({
                ...payload,
                updated_at: new Date().toISOString(),
            })
            .eq("id", businessId)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as Business;
    },

    async updateProfile(
        profileId: string,
        payload: Partial<Pick<Profile, "full_name" | "avatar_url">>
    ) {
        const { data, error } = await supabase
            .from("profiles")
            .update(payload)
            .eq("id", profileId)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as Profile;
    },

    async getTeamMembers() {
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: true });

        if (error) {
            throw new Error(error.message);
        }

        return data as Profile[];
    },

    async updateTeamMemberRole(profileId: string, role: UserRole) {
        const { data, error } = await supabase
            .from("profiles")
            .update({ role })
            .eq("id", profileId)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as Profile;
    },
};