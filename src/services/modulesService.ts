import { supabase } from "../lib/supabase";

export interface Module {
    id: string;
    name: string;
    key: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
}

export interface BusinessModule {
    id: string;
    business_id: string;
    module_id: string;
    enabled: boolean;
    created_at: string;
    modules: Module;
}

export const modulesService = {
    async getMyModules() {
        const { data, error } = await supabase
            .from("business_modules")
            .select(`
        *,
        modules (*)
      `)
            .eq("enabled", true);

        if (error) {
            throw new Error(error.message);
        }

        return data as BusinessModule[];
    },

    async hasModule(moduleKey: string) {
        const { data, error } = await supabase
            .from("business_modules")
            .select(`
        *,
        modules!inner (*)
      `)
            .eq("enabled", true)
            .eq("modules.key", moduleKey)
            .maybeSingle();

        if (error) {
            throw new Error(error.message);
        }

        return Boolean(data);
    },
};