import { supabase } from "@/lib/supabase";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface BookingContact {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
}

export interface BookingConversation {
    id: string;
    status: string | null;
    intent: string | null;
    urgency: string | null;
    sentiment: string | null;
    ai_score: number | null;
    ai_summary: string | null;
    channels?: {
        id: string;
        name: string | null;
        type: string | null;
    } | null;
}

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

    contacts?: BookingContact | null;
    conversations?: BookingConversation | null;
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

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
    if (Array.isArray(value)) return value[0] || null;
    return value || null;
}

type RawBooking = Omit<Booking, "contacts" | "conversations"> & {
    contacts?: BookingContact | BookingContact[] | null;
    conversations?: BookingConversation | BookingConversation[] | null;
};

function normalizeBooking(booking: RawBooking): Booking {
    return {
        ...booking,
        contacts: firstRelation(booking.contacts),
        conversations: firstRelation(booking.conversations),
    };
}

export const bookingsService = {
    async getBookings() {
        const { data, error } = await supabase
            .from("bookings")
            .select(`
        *,
        contacts (
          id,
          full_name,
          email,
          phone
        ),
        conversations (
          id,
          status,
          intent,
          urgency,
          sentiment,
          ai_score,
          ai_summary,
          channels (
            id,
            name,
            type
          )
        )
      `)
            .order("scheduled_at", { ascending: true });

        if (error) {
            throw new Error(error.message);
        }

        return ((data || []) as unknown as RawBooking[]).map(normalizeBooking);
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
            .select(`
        *,
        contacts (
          id,
          full_name,
          email,
          phone
        ),
        conversations (
          id,
          status,
          intent,
          urgency,
          sentiment,
          ai_score,
          ai_summary,
          channels (
            id,
            name,
            type
          )
        )
      `)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return normalizeBooking(data as unknown as RawBooking);
    },

    async updateBookingStatus(bookingId: string, status: BookingStatus) {
        const { data, error } = await supabase
            .from("bookings")
            .update({
                status,
                updated_at: new Date().toISOString(),
            })
            .eq("id", bookingId)
            .select(`
        *,
        contacts (
          id,
          full_name,
          email,
          phone
        ),
        conversations (
          id,
          status,
          intent,
          urgency,
          sentiment,
          ai_score,
          ai_summary,
          channels (
            id,
            name,
            type
          )
        )
      `)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return normalizeBooking(data as unknown as RawBooking);
    },

    async deleteBooking(bookingId: string) {
        const { error } = await supabase.from("bookings").delete().eq("id", bookingId);

        if (error) {
            throw new Error(error.message);
        }

        return true;
    },
};