import { supabase } from "@/lib/supabase";

export interface Contact {
    id: string;
    business_id: string;
    full_name: string | null;
    phone: string | null;
    email: string | null;
    source: string | null;
    created_at: string;
}

export const contactsService = {
    async getContacts(limit = 50, from = 0) {
        const to = from + limit - 1;

        const { data, error } = await supabase
            .from("contacts")
            .select("*")
            .order("created_at", { ascending: false })
            .range(from, to);

        if (error) {
            throw new Error(error.message);
        }

        return data as Contact[];
    },

    async searchContacts(searchTerm: string) {
        const { data, error } = await supabase
            .from("contacts")
            .select("*")
            .or(
                `full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
            )
            .order("created_at", { ascending: false })
            .limit(20);

        if (error) {
            throw new Error(error.message);
        }

        return data as Contact[];
    },

    async createContact(payload: {
        business_id: string;
        full_name?: string | null;
        phone?: string | null;
        email?: string | null;
        source?: string | null;
    }) {
        const { data, error } = await supabase
            .from("contacts")
            .insert(payload)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as Contact;
    },

    async updateContact(
        contactId: string,
        payload: Partial<Pick<Contact, "full_name" | "phone" | "email" | "source">>
    ) {
        const { data, error } = await supabase
            .from("contacts")
            .update(payload)
            .eq("id", contactId)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as Contact;
    },
};