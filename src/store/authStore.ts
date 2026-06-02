import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { authService } from "../services/authService";
import {
    businessService,
    type Business,
    type Profile,
    type Subscription,
    type UpdateBusinessPayload,
} from "../services/businessService";
import {
    modulesService,
    type BusinessModule,
} from "../services/modulesService";
import { supabase } from "@/lib/supabase";
import { ROLE_PERMISSIONS, type UserRole } from "@/dashboard/config/rolePermissions";

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
    register: (
        email: string,
        password: string,
        fullName: string,
        businessName?: string
    ) => Promise<void>;

    resetPassword: (email: string) => Promise<void>;
    updatePassword: (password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    handleAuthCallback: () => Promise<void>;

    logout: () => Promise<void>;
    loadUserData: () => Promise<void>;
    refreshModules: () => Promise<void>;
    hasModule: (moduleKey: string) => boolean;
    hasPermission: (permissionKey: string) => boolean;
    clearError: () => void;
    updateBusiness: (payload: UpdateBusinessPayload) => Promise<void>;
    updateProfile: (payload: { fullName: string; avatarFile?: File | null; }) => Promise<void>;
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
                    loadingStep: null,
                    error: null,
                });

                return;
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

            try {
                await get().loadUserData();
            } catch (error) {
                console.error("Error loading user data after login:", error);

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
                    loadingStep: null,
                    error: "We couldn't access your account. Please check your credentials or create a new account.",
                });

                throw error;
            }

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

    register: async (
        email: string,
        password: string,
        fullName: string,
        businessName?: string
    ) => {
        try {
            set({
                isLoading: true,
                error: null,
                loadingStep: "Creating your Lumora account...",
            });

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        business_name: businessName || null,
                    },
                },
            });

            if (error) {
                console.error("Signup error:", error);
                throw new Error(error.message);
            }

            const user = data.user;

            if (!user) {
                throw new Error("No user returned after registration");
            }

            /**
             * Normal signup:
             * Create business + profile as owner.
             *
             * Invitation signup:
             * Do NOT create business here.
             * The accept-invite flow will assign business_id and role.
             */
            if (businessName) {
                console.log('entraa')

                set({
                    loadingStep: "Setting up your business workspace...",
                });

                const businessId = crypto.randomUUID();

                const slug = businessName
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-+|-+$/g, "");

                const { error: businessError } =
                    await supabase
                        .from("businesses")
                        .insert({
                            id: businessId,
                            name: businessName,
                            slug: `${slug}-${Date.now()}`,
                            industry: null,
                            settings: {},
                        })

                if (businessError) {
                    console.error("BUSINESS INSERT ERROR:", businessError);
                    throw new Error(businessError.message);
                }

                const { error: profileError } = await supabase
                    .from("profiles")
                    .insert({
                        id: user.id,
                        business_id: businessId,
                        full_name: fullName,
                        email,
                        role: "owner",
                    });

                if (profileError) {
                    console.error("PROFILE INSERT ERROR:", profileError);
                    throw new Error(profileError.message);
                }

                const { data: noPlan, error: planError } = await supabase
                    .from("plans")
                    .select("id")
                    .eq("name", "No Plan")
                    .single();

                if (planError || !noPlan) {
                    console.error("NO PLAN ERROR:", planError);
                    throw new Error("No Plan not found");
                }

                const { error: subscriptionError } = await supabase
                    .from("subscriptions")
                    .insert({
                        business_id: businessId,
                        plan_id: noPlan.id,
                        status: "active",
                        started_at: new Date().toISOString(),
                        ends_at: null,
                    });

                if (subscriptionError) {
                    console.error("SUBSCRIPTION INSERT ERROR:", subscriptionError);
                    throw new Error(subscriptionError.message);
                }
            }

            set({
                user,
                session: data.session,
                isAuthenticated: Boolean(data.session),
                isInitialized: true,
                isLoading: false,
                loadingStep: null,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to register",
                isLoading: false,
                loadingStep: null,
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

        if (!profile.business_id) {
            throw new Error("BUSINESS_ID_NOT_FOUND");
        }

        const business = await businessService.getMyBusiness(profile.business_id);

        set({
            business,
            loadingStep: "Checking subscription and plan...",
        });
        await sleep(LOADING_STEP_DELAY);

        const subscription = await businessService.getMySubscription(profile.business_id);

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

    hasPermission: (permissionKey: string) => {
        const profile = get().profile;

        if (!profile?.role) return false;

        const role = profile.role as UserRole;

        return ROLE_PERMISSIONS[role]?.includes(permissionKey) ?? false;
    },

    clearError: () => {
        set({ error: null });
    },

    updateBusiness: async (payload) => {
        try {
            const currentBusiness = get().business;

            if (!currentBusiness) {
                throw new Error("No business found");
            }

            set({
                isLoading: true,
                error: null,
                loadingStep: "Updating business settings...",
            });

            const updatedBusiness = await businessService.updateBusiness(
                currentBusiness.id,
                payload
            );

            set({
                business: updatedBusiness,
                isLoading: false,
                loadingStep: null,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to update business",
                isLoading: false,
                loadingStep: null,
            });

            throw error;
        }
    },

    updateProfile: async ({ fullName, avatarFile }) => {
        try {
            const currentProfile = get().profile;

            if (!currentProfile) {
                throw new Error("No profile found");
            }

            set({
                isLoading: true,
                error: null,
                loadingStep: "Updating profile...",
            });

            let avatarUrl = currentProfile.avatar_url;

            if (avatarFile) {
                avatarUrl = await businessService.uploadProfileAvatar(
                    currentProfile.id,
                    avatarFile
                );
            }

            const updatedProfile = await businessService.updateProfile(
                currentProfile.id,
                {
                    full_name: fullName,
                    avatar_url: avatarUrl,
                }
            );

            set({
                profile: updatedProfile,
                isLoading: false,
                loadingStep: null,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to update profile",
                isLoading: false,
                loadingStep: null,
            });

            throw error;
        }
    },

    resetPassword: async (email: string) => {
        try {
            set({
                isLoading: true,
                error: null,
                loadingStep: "Sending recovery email...",
            });

            const cleanEmail = email.trim().replace(/\s+/g, "");

            await authService.resetPassword(cleanEmail);

            set({
                isLoading: false,
                loadingStep: null,
                error: null,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to send recovery email",
                isLoading: false,
                loadingStep: null,
            });

            throw error;
        }
    },

    updatePassword: async (password: string) => {
        try {
            set({
                isLoading: true,
                error: null,
                loadingStep: "Updating your password...",
            });

            await authService.updatePassword(password);

            set({
                isLoading: false,
                loadingStep: null,
                error: null,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to update password",
                isLoading: false,
                loadingStep: null,
            });

            throw error;
        }
    },

    loginWithGoogle: async () => {
        try {
            set({
                isLoading: true,
                error: null,
                loadingStep: "Redirecting to Google...",
            });

            await authService.signInWithGoogle();
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Google authentication failed",
                isLoading: false,
                loadingStep: null,
            });

            throw error;
        }
    },

    handleAuthCallback: async () => {
        try {
            set({
                isLoading: true,
                error: null,
                loadingStep: "Completing authentication...",
            });

            const session = await authService.getSession();

            if (!session) {
                throw new Error("No active session found");
            }

            set({
                session,
                user: session.user,
                isAuthenticated: true,
                isInitialized: true,
                loadingStep: "Loading your Lumora workspace...",
            });

            try {
                await get().loadUserData();
            } catch (error) {
                console.error("Error loading Google user data:", error);
            }

            set({
                isLoading: false,
                loadingStep: null,
            });
        } catch (error) {
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
                        : "Authentication callback failed",
            });

            throw error;
        }
    },
}));