import { supabase } from "@/lib/supabase";

export type VoiceCallStatus = "completed" | "missed" | "failed";

export interface VoiceCall {
    id: string;
    business_id: string;

    contact_id: string | null;
    conversation_id: string | null;

    customer_name: string;
    phone: string | null;
    direction: string;

    status: VoiceCallStatus;

    duration_seconds: number;

    sentiment: string | null;
    ai_summary: string | null;
    transcript: string | null;
    recording_url: string | null;

    started_at: string;
    ended_at: string | null;

    created_at: string;
}

export const voiceAIService = {
    async getCalls() {
        const { data, error } = await supabase
            .from("voice_calls")
            .select("*")
            .order("started_at", { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return data as VoiceCall[];
    },

    async updateCallStatus(callId: string, status: VoiceCallStatus) {
        const { data, error } = await supabase
            .from("voice_calls")
            .update({
                status,
            })
            .eq("id", callId)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as VoiceCall;
    },

    async deleteCall(callId: string) {
        const { error } = await supabase
            .from("voice_calls")
            .delete()
            .eq("id", callId);

        if (error) {
            throw new Error(error.message);
        }

        return true;
    },
};