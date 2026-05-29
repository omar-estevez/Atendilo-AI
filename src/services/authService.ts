import { supabase } from "../lib/supabase";

export const authService = {
    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw new Error(error.message);
        }

        return data;
    },

    async signUp(email: string, password: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            throw new Error(error.message);
        }

        return data;
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();

        if (error) {
            throw new Error(error.message);
        }

        return true;
    },

    async getSession() {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            throw new Error(error.message);
        }

        return data.session;
    },

    async getUser() {
        const { data, error } = await supabase.auth.getUser();

        if (error) {
            throw new Error(error.message);
        }

        return data.user;
    },

    onAuthStateChange(callback: () => void) {
        return supabase.auth.onAuthStateChange(() => {
            callback();
        });
    },
};