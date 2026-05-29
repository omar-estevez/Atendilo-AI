import { supabase } from "@/lib/supabase";

export type ApiKeyStatus = "active" | "revoked";

export interface ApiKey {
    id: string;
    business_id: string;

    name: string;
    key_prefix: string;
    key_hash: string;

    status: ApiKeyStatus;

    last_used_at: string | null;
    expires_at: string | null;

    created_at: string;
    updated_at: string;
}

export interface CreateApiKeyPayload {
    business_id: string;
    name: string;
    expires_at?: string | null;
}

const generateApiKey = () => {
    const randomPart = crypto.randomUUID().replace(/-/g, "");
    const secretPart = crypto.randomUUID().replace(/-/g, "");

    return `lum_live_${randomPart}_${secretPart}`;
};

const maskApiKey = (key: string) => {
    return `${key.slice(0, 17)}••••••••••••••••••••`;
};

export const apiKeysService = {
    async getApiKeys() {
        const { data, error } = await supabase
            .from("api_keys")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return data as ApiKey[];
    },

    async createApiKey(payload: CreateApiKeyPayload) {
        const rawKey = generateApiKey();
        const keyPrefix = rawKey.slice(0, 17);

        /**
         * MVP:
         * For now we store a demo hash value.
         * Later, this should be generated server-side with a real hash.
         */
        const keyHash = `demo_hash_${crypto.randomUUID()}`;

        const { data, error } = await supabase
            .from("api_keys")
            .insert({
                business_id: payload.business_id,
                name: payload.name,
                key_prefix: keyPrefix,
                key_hash: keyHash,
                status: "active",
                expires_at: payload.expires_at || null,
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return {
            apiKey: data as ApiKey,
            rawKey,
            maskedKey: maskApiKey(rawKey),
        };
    },

    async revokeApiKey(apiKeyId: string) {
        const { data, error } = await supabase
            .from("api_keys")
            .update({
                status: "revoked",
                updated_at: new Date().toISOString(),
            })
            .eq("id", apiKeyId)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as ApiKey;
    },

    async deleteApiKey(apiKeyId: string) {
        const { error } = await supabase
            .from("api_keys")
            .delete()
            .eq("id", apiKeyId);

        if (error) {
            throw new Error(error.message);
        }

        return true;
    },
};