import { supabase } from "@/lib/supabase";

export type NotificationCategory =
    | "conversations"
    | "bookings"
    | "leads"
    | "voice"
    | "billing"
    | "system";

export type NotificationChannel = "email" | "push" | "sms";

export interface NotificationPreference {
    id: string;
    event: string;
    description: string;
    category: NotificationCategory;
    email: boolean;
    push: boolean;
    sms: boolean;
}

export const defaultNotificationPreferences: NotificationPreference[] = [
    {
        id: "new_conversation",
        event: "New conversation",
        description: "When a new customer conversation starts.",
        category: "conversations",
        email: true,
        push: true,
        sms: false,
    },
    {
        id: "new_message",
        event: "New message received",
        description: "When a customer sends a new message.",
        category: "conversations",
        email: true,
        push: true,
        sms: false,
    },
    {
        id: "booking_created",
        event: "Booking created",
        description: "When a new booking is created.",
        category: "bookings",
        email: true,
        push: true,
        sms: true,
    },
    {
        id: "booking_cancelled",
        event: "Booking cancelled",
        description: "When a booking is cancelled.",
        category: "bookings",
        email: true,
        push: true,
        sms: true,
    },
    {
        id: "hot_lead",
        event: "Hot lead detected",
        description: "When Atendilo identifies a high-intent lead.",
        category: "leads",
        email: true,
        push: true,
        sms: true,
    },
    {
        id: "missed_call",
        event: "Missed AI voice call",
        description: "When a voice call is missed or not completed.",
        category: "voice",
        email: true,
        push: true,
        sms: true,
    },
    {
        id: "voice_summary",
        event: "Voice AI summary ready",
        description: "When a call transcript or AI summary is generated.",
        category: "voice",
        email: true,
        push: false,
        sms: false,
    },
    {
        id: "payment_failed",
        event: "Payment failed",
        description: "When billing payment fails or subscription becomes past due.",
        category: "billing",
        email: true,
        push: true,
        sms: false,
    },
    {
        id: "security_alert",
        event: "Security alert",
        description: "When important account security activity is detected.",
        category: "system",
        email: true,
        push: true,
        sms: true,
    },
    {
        id: "system_update",
        event: "System updates",
        description: "Product updates, system messages and platform notices.",
        category: "system",
        email: true,
        push: false,
        sms: false,
    },
];

const mergeWithDefaults = (
    savedPreferences: NotificationPreference[]
): NotificationPreference[] => {
    return defaultNotificationPreferences.map((defaultPreference) => {
        const savedPreference = savedPreferences.find(
            (item) => item.id === defaultPreference.id
        );

        return savedPreference
            ? {
                ...defaultPreference,
                email: savedPreference.email,
                push: savedPreference.push,
                sms: savedPreference.sms,
            }
            : defaultPreference;
    });
};

export const notificationService = {
    async getPreferences() {
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
            .select("notification_preferences")
            .eq("id", user.id)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        const savedPreferences =
            (data.notification_preferences || []) as NotificationPreference[];

        if (!savedPreferences.length) {
            return defaultNotificationPreferences;
        }

        return mergeWithDefaults(savedPreferences);
    },

    async savePreferences(preferences: NotificationPreference[]) {
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
            .update({
                notification_preferences: preferences,
                updated_at: new Date().toISOString(),
            })
            .eq("id", user.id)
            .select("notification_preferences")
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data.notification_preferences as NotificationPreference[];
    },
};