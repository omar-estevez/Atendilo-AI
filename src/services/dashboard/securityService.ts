import { supabase } from "@/lib/supabase";

export type SecurityActivityType =
    | "login"
    | "logout"
    | "password"
    | "two_factor"
    | "session"
    | "settings";

export interface SecuritySettings {
    two_factor_enabled?: boolean;
    password_updated_at?: string | null;
}

export interface SecurityActivityLog {
    id: string;
    business_id: string | null;
    profile_id: string | null;
    type: SecurityActivityType;
    action: string;
    ip_address: string | null;
    location: string | null;
    user_agent: string | null;
    created_at: string;
}

export interface SecuritySession {
    id: string;
    browser: string;
    device: string;
    location: string;
    ipAddress: string;
    lastActive: string;
    status: "current";
}

const getBrowserName = () => {
    const userAgent = navigator.userAgent;

    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";

    return "Unknown Browser";
};

const getDeviceName = () => {
    const userAgent = navigator.userAgent;

    if (/iPhone/i.test(userAgent)) return "iPhone";
    if (/Android/i.test(userAgent)) return "Android Phone";
    if (/iPad/i.test(userAgent)) return "iPad";
    if (/Windows/i.test(userAgent)) return "Windows Desktop";
    if (/Mac/i.test(userAgent)) return "Mac Desktop";

    return "Current Device";
};

export const securityService = {
    async getSecuritySettings() {
        const { data: userData, error: userError } =
            await supabase.auth.getUser();

        if (userError) {
            throw new Error(userError.message);
        }

        const user = userData.user;

        if (!user) {
            throw new Error("No authenticated user found.");
        }

        const { data, error } = await supabase
            .from("profiles")
            .select("security_settings")
            .eq("id", user.id)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return (data.security_settings || {}) as SecuritySettings;
    },

    async updateSecuritySettings(settings: SecuritySettings) {
        const { data: userData, error: userError } =
            await supabase.auth.getUser();

        if (userError) {
            throw new Error(userError.message);
        }

        const user = userData.user;

        if (!user) {
            throw new Error("No authenticated user found.");
        }

        const currentSettings = await this.getSecuritySettings();

        const { data, error } = await supabase
            .from("profiles")
            .update({
                security_settings: {
                    ...currentSettings,
                    ...settings,
                },
                updated_at: new Date().toISOString(),
            })
            .eq("id", user.id)
            .select("security_settings")
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return (data.security_settings || {}) as SecuritySettings;
    },

    async changePassword(newPassword: string) {
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) {
            throw new Error(error.message);
        }

        const passwordUpdatedAt = new Date().toISOString();

        await this.updateSecuritySettings({
            password_updated_at: passwordUpdatedAt,
        });

        await this.createActivityLog({
            type: "password",
            action: "Password changed",
        });

        return true;
    },

    async toggleTwoFactor(enabled: boolean) {
        const settings = await this.updateSecuritySettings({
            two_factor_enabled: enabled,
        });

        await this.createActivityLog({
            type: "two_factor",
            action: enabled
                ? "Two-factor authentication enabled"
                : "Two-factor authentication disabled",
        });

        return settings;
    },

    async getSecurityActivity() {
        const { data, error } = await supabase
            .from("security_activity_logs")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(20);

        if (error) {
            throw new Error(error.message);
        }

        return data as SecurityActivityLog[];
    },

    async createActivityLog(payload: {
        type: SecurityActivityType;
        action: string;
    }) {
        const { data: userData, error: userError } =
            await supabase.auth.getUser();

        if (userError) {
            throw new Error(userError.message);
        }

        const user = userData.user;

        if (!user) {
            throw new Error("No authenticated user found.");
        }

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id, business_id")
            .eq("id", user.id)
            .single();

        if (profileError) {
            throw new Error(profileError.message);
        }

        const { data, error } = await supabase
            .from("security_activity_logs")
            .insert({
                business_id: profile.business_id,
                profile_id: profile.id,
                type: payload.type,
                action: payload.action,
                user_agent: navigator.userAgent,
                location: "Current browser",
                ip_address: null,
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as SecurityActivityLog;
    },

    async getCurrentSession(): Promise<SecuritySession[]> {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            throw new Error(error.message);
        }

        if (!data.session) {
            return [];
        }

        return [
            {
                id: data.session.access_token.slice(0, 12),
                browser: getBrowserName(),
                device: getDeviceName(),
                location: "Current browser",
                ipAddress: "Hidden",
                lastActive: "Active now",
                status: "current",
            },
        ];
    },

    async signOutOtherSessions() {
        await supabase.auth.signOut({
            scope: "others",
        });

        await this.createActivityLog({
            type: "session",
            action: "Signed out other sessions",
        });

        return true;
    },
};