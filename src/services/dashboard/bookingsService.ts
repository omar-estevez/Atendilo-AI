import { supabase } from "@/lib/supabase";

export type BookingStatus =
    | "pending"
    | "confirmed"
    | "completed"
    | "cancelled";

export interface Booking {
    id: string;
    business_id: string;
    contact_id: string | null;
    conversation_id: string | null;

    customer_name: string;
    service_name: string;
    scheduled_at: string;
    status: BookingStatus;
    estimated_value: number;

    notes: string | null;
    source: string | null;

    created_at: string;
    updated_at: string;
}

export interface CreateBookingPayload {
    business_id: string;
    contact_id?: string | null;
    conversation_id?: string | null;
    customer_name: string;
    service_name: string;
    scheduled_at: string;
    status?: BookingStatus;
    estimated_value?: number;
    notes?: string | null;
    source?: string | null;
}

export const bookingsService = {
    async getBookings() {
        const { data, error } = await supabase
            .from("bookings")
            .select("*")
            .order("scheduled_at", { ascending: true });

        if (error) {
            throw new Error(error.message);
        }

        return data as Booking[];
    },

    async createBooking(payload: CreateBookingPayload) {
        const { data, error } = await supabase
            .from("bookings")
            .insert({
                business_id: payload.business_id,
                contact_id: payload.contact_id || null,
                conversation_id: payload.conversation_id || null,
                customer_name: payload.customer_name,
                service_name: payload.service_name,
                scheduled_at: payload.scheduled_at,
                status: payload.status || "pending",
                estimated_value: payload.estimated_value || 0,
                notes: payload.notes || null,
                source: payload.source || "manual",
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as Booking;
    },

    async updateBookingStatus(bookingId: string, status: BookingStatus) {
        const { data, error } = await supabase
            .from("bookings")
            .update({
                status,
                updated_at: new Date().toISOString(),
            })
            .eq("id", bookingId)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as Booking;
    },

    async deleteBooking(bookingId: string) {
        const { error } = await supabase
            .from("bookings")
            .delete()
            .eq("id", bookingId);

        if (error) {
            throw new Error(error.message);
        }

        return true;
    },
};