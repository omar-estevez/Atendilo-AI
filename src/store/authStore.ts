import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { authService } from "../services/authService";
import {
    businessService,
    type Business,
    type Profile,
    type Subscription,
} from "../services/businessService";
import {
    modulesService,
    type BusinessModule,
} from "../services/modulesService";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const LOADING_STEP_DELAY = 350;

interface AuthStore {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    business: Business | null;
    subscription: Subscription | null;
    modules: BusinessModule[];

    isLoading: boolean;
    isInitialized: boolean;
    isAuthenticated: boolean;
    loadingStep: string | null;
    error: string | null;

    quickCheckAuth: () => Promise<void>;
    initializeAuth: () => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    loadUserData: () => Promise<void>;
    refreshModules: () => Promise<void>;
    hasModule: (moduleKey: string) => boolean;
    clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    user: null,
    session: null,
    profile: null,
    business: null,
    subscription: null,
    modules: [],

    isLoading: false,
    isInitialized: false,
    isAuthenticated: false,
    loadingStep: null,
    error: null,

    quickCheckAuth: async () => {
        try {
            const session = await authService.getSession();

            if (!session) {
                set({
                    user: null,
                    session: null,
                    isAuthenticated: false,
                    isInitialized: true,
                });

                return;
            }

            set({
                session,
                user: session.user,
                isAuthenticated: true,
                isInitialized: true,
            });
        } catch (error) {
            console.error("Quick auth check failed:", error);

            set({
                user: null,
                session: null,
                isAuthenticated: false,
                isInitialized: true,
            });
        }
    },

    initializeAuth: async () => {
        try {
            set({
                isLoading: true,
                error: null,
                loadingStep: "Checking secure session...",
            });

            await sleep(LOADING_STEP_DELAY);

            const session = await authService.getSession();

            if (!session) {
                set({
                    user: null,
                    session: null,
                    profile: null,
                    business: null,
                    subscription: null,
                    modules: [],
                    isAuthenticated: false,
                    isLoading: false,
                    isInitialized: true,
                    loadingStep: null,
                });

                return;
            }

            set({
                session,
                user: session.user,
                isAuthenticated: true,
                loadingStep: "Restoring your AI workspace...",
            });

            await sleep(LOADING_STEP_DELAY);

            try {
                await get().loadUserData();
            } catch (error) {
                console.error("Error loading user data:", error);

                set({
                    error:
                        error instanceof Error
                            ? error.message
                            : "Failed to load user data",
                });
            }

            set({
                isLoading: false,
                isInitialized: true,
                loadingStep: null,
            });
        } catch (error) {
            console.error("Error initializing auth:", error);

            set({
                user: null,
                session: null,
                profile: null,
                business: null,
                subscription: null,
                modules: [],
                isAuthenticated: false,
                isLoading: false,
                isInitialized: true,
                loadingStep: null,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to initialize auth",
            });
        }
    },

    login: async (email: string, password: string) => {
        try {
            set({
                isLoading: true,
                error: null,
                loadingStep: "Authenticating credentials...",
            });

            await sleep(LOADING_STEP_DELAY);

            const data = await authService.signIn(email, password);

            set({
                session: data.session,
                user: data.user,
                isAuthenticated: true,
                isInitialized: true,
                loadingStep: "Opening your Lumora workspace...",
            });

            await sleep(LOADING_STEP_DELAY);

            await get().loadUserData();

            set({
                isLoading: false,
                isInitialized: true,
                loadingStep: null,
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Login failed",
                isLoading: false,
                isAuthenticated: false,
                loadingStep: null,
            });

            throw error;
        }
    },

    register: async (email: string, password: string) => {
        try {
            set({ isLoading: true, error: null });

            const data = await authService.signUp(email, password);

            set({
                session: data.session,
                user: data.user,
                isAuthenticated: Boolean(data.session),
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Register failed",
                isLoading: false,
            });

            throw error;
        }
    },

    logout: async () => {
        try {
            set({ isLoading: true, error: null });

            await authService.signOut();

            set({
                user: null,
                session: null,
                profile: null,
                business: null,
                subscription: null,
                modules: [],
                isAuthenticated: false,
                isLoading: false,
                isInitialized: true,
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Logout failed",
                isLoading: false,
                isInitialized: true,
            });

            throw error;
        }
    },

    loadUserData: async () => {
        set({ loadingStep: "Loading user profile..." });
        await sleep(LOADING_STEP_DELAY);

        const profile = await businessService.getMyProfile();

        set({
            profile,
            loadingStep: "Loading business workspace...",
        });
        await sleep(LOADING_STEP_DELAY);

        const business = await businessService.getMyBusiness();

        set({
            business,
            loadingStep: "Checking subscription and plan...",
        });
        await sleep(LOADING_STEP_DELAY);

        const subscription = await businessService.getMySubscription();

        set({
            subscription,
            loadingStep: "Syncing active modules...",
        });
        await sleep(LOADING_STEP_DELAY);

        const modules = await modulesService.getMyModules();

        set({
            modules,
            loadingStep: "Preparing dashboard...",
        });
        await sleep(LOADING_STEP_DELAY);
    },

    refreshModules: async () => {
        try {
            const modules = await modulesService.getMyModules();

            set({ modules });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Failed to refresh modules",
            });

            throw error;
        }
    },

    hasModule: (moduleKey: string) => {
        const modules = get().modules;

        return modules.some(
            (businessModule) =>
                businessModule.enabled && businessModule.modules.key === moduleKey
        );
    },

    clearError: () => {
        set({ error: null });
    },
}));