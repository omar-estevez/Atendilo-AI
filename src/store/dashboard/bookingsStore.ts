import { create } from "zustand";
import {
    bookingsService,
    type Booking,
    type BookingStatus,
    type CreateBookingPayload,
} from "@/services/dashboard/bookingsService";

interface BookingsStore {
    bookings: Booking[];
    selectedBooking: Booking | null;

    isLoading: boolean;
    error: string | null;

    loadBookings: () => Promise<void>;
    createBooking: (payload: CreateBookingPayload) => Promise<void>;
    updateBookingStatus: (
        booking: Booking,
        status: BookingStatus
    ) => Promise<void>;
    deleteBooking: (booking: Booking) => Promise<void>;
    selectBooking: (booking: Booking | null) => void;
    clearError: () => void;
}

export const useBookingsStore = create<BookingsStore>((set, get) => ({
    bookings: [],
    selectedBooking: null,

    isLoading: false,
    error: null,

    loadBookings: async () => {
        try {
            set({ isLoading: true, error: null });

            const bookings = await bookingsService.getBookings();

            set({
                bookings,
                selectedBooking: bookings[0] || null,
                isLoading: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load bookings",
                isLoading: false,
            });
        }
    },

    createBooking: async (payload) => {
        try {
            set({ isLoading: true, error: null });

            const newBooking = await bookingsService.createBooking(payload);

            set({
                bookings: [...get().bookings, newBooking].sort(
                    (a, b) =>
                        new Date(a.scheduled_at).getTime() -
                        new Date(b.scheduled_at).getTime()
                ),
                selectedBooking: newBooking,
                isLoading: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to create booking",
                isLoading: false,
            });

            throw error;
        }
    },

    updateBookingStatus: async (booking, status) => {
        try {
            const updatedBooking =
                await bookingsService.updateBookingStatus(booking.id, status);

            set({
                bookings: get().bookings.map((item) =>
                    item.id === updatedBooking.id ? updatedBooking : item
                ),
                selectedBooking:
                    get().selectedBooking?.id === updatedBooking.id
                        ? updatedBooking
                        : get().selectedBooking,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to update booking status",
            });

            throw error;
        }
    },

    deleteBooking: async (booking) => {
        try {
            await bookingsService.deleteBooking(booking.id);

            const remainingBookings = get().bookings.filter(
                (item) => item.id !== booking.id
            );

            set({
                bookings: remainingBookings,
                selectedBooking:
                    get().selectedBooking?.id === booking.id
                        ? remainingBookings[0] || null
                        : get().selectedBooking,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to delete booking",
            });

            throw error;
        }
    },

    selectBooking: (booking) => {
        set({ selectedBooking: booking });
    },

    clearError: () => {
        set({ error: null });
    },
}));