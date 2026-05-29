import { supabase } from "@/lib/supabase";

export type TemplateType =
    | "message"
    | "follow_up"
    | "quote"
    | "booking_confirmation"
    | "reminder"
    | "review_request"
    | "ai_prompt";

export type TemplateChannel =
    | "all"
    | "whatsapp"
    | "sms"
    | "email"
    | "webchat";

export interface Template {
    id: string;
    business_id: string;

    name: string;
    description: string | null;
    type: TemplateType;
    channel: TemplateChannel;

    subject: string | null;
    content: string;

    variables: string[];

    is_active: boolean;
    usage_count: number;

    created_at: string;
    updated_at: string;
}

export interface CreateTemplatePayload {
    business_id: string;
    name: string;
    description?: string | null;
    type?: TemplateType;
    channel?: TemplateChannel;
    subject?: string | null;
    content: string;
    variables?: string[];
    is_active?: boolean;
}

export const templatesService = {
    async getTemplates() {
        const { data, error } = await supabase
            .from("templates")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return data as Template[];
    },

    async createTemplate(payload: CreateTemplatePayload) {
        const { data, error } = await supabase
            .from("templates")
            .insert({
                business_id: payload.business_id,
                name: payload.name,
                description: payload.description || null,
                type: payload.type || "message",
                channel: payload.channel || "all",
                subject: payload.subject || null,
                content: payload.content,
                variables: payload.variables || [],
                is_active: payload.is_active ?? true,
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as Template;
    },

    async updateTemplate(
        templateId: string,
        payload: Partial<
            Pick<
                Template,
                | "name"
                | "description"
                | "type"
                | "channel"
                | "subject"
                | "content"
                | "variables"
                | "is_active"
            >
        >
    ) {
        const { data, error } = await supabase
            .from("templates")
            .update({
                ...payload,
                updated_at: new Date().toISOString(),
            })
            .eq("id", templateId)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as Template;
    },

    async toggleTemplate(templateId: string, isActive: boolean) {
        const { data, error } = await supabase
            .from("templates")
            .update({
                is_active: isActive,
                updated_at: new Date().toISOString(),
            })
            .eq("id", templateId)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as Template;
    },

    async deleteTemplate(templateId: string) {
        const { error } = await supabase
            .from("templates")
            .delete()
            .eq("id", templateId);

        if (error) {
            throw new Error(error.message);
        }

        return true;
    },
};