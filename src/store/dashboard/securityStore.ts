import { create } from "zustand";
import {
    securityService,
    type SecurityActivityLog,
    type SecuritySession,
    type SecuritySettings,
} from "@/services/dashboard/securityService";

interface SecurityStore {
    settings: SecuritySettings | null;
    sessions: SecuritySession[];
    activities: SecurityActivityLog[];

    isLoading: boolean;
    isUpdating: boolean;
    error: string | null;

    loadSecurity: () => Promise<void>;
    changePassword: (newPassword: string) => Promise<void>;
    toggleTwoFactor: (enabled: boolean) => Promise<void>;
    signOutOtherSessions: () => Promise<void>;
    clearError: () => void;
}

export const useSecurityStore = create<SecurityStore>((set) => ({
    settings: null,
    sessions: [],
    activities: [],

    isLoading: false,
    isUpdating: false,
    error: null,

    loadSecurity: async () => {
        try {
            set({ isLoading: true, error: null });

            const [settings, sessions, activities] = await Promise.all([
                securityService.getSecuritySettings(),
                securityService.getCurrentSession(),
                securityService.getSecurityActivity(),
            ]);

            set({
                settings,
                sessions,
                activities,
                isLoading: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load security settings",
                isLoading: false,
            });
        }
    },

    changePassword: async (newPassword) => {
        try {
            set({ isUpdating: true, error: null });

            await securityService.changePassword(newPassword);

            const [settings, activities] = await Promise.all([
                securityService.getSecuritySettings(),
                securityService.getSecurityActivity(),
            ]);

            set({
                settings,
                activities,
                isUpdating: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to change password",
                isUpdating: false,
            });

            throw error;
        }
    },

    toggleTwoFactor: async (enabled) => {
        try {
            set({ isUpdating: true, error: null });

            const settings = await securityService.toggleTwoFactor(enabled);
            const activities = await securityService.getSecurityActivity();

            set({
                settings,
                activities,
                isUpdating: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to update two-factor settings",
                isUpdating: false,
            });

            throw error;
        }
    },

    signOutOtherSessions: async () => {
        try {
            set({ isUpdating: true, error: null });

            await securityService.signOutOtherSessions();

            const [sessions, activities] = await Promise.all([
                securityService.getCurrentSession(),
                securityService.getSecurityActivity(),
            ]);

            set({
                sessions,
                activities,
                isUpdating: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to sign out other sessions",
                isUpdating: false,
            });

            throw error;
        }
    },

    clearError: () => {
        set({ error: null });
    },
}));