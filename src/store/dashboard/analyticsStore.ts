import { create } from "zustand";
import {
    analyticsService,
    type AnalyticsOverview,
    type BookingAnalytics,
    type ChannelAnalytics,
} from "@/services/dashboard/analyticsService";

interface AnalyticsStore {
    overview: AnalyticsOverview | null;
    channelAnalytics: ChannelAnalytics[];
    bookingAnalytics: BookingAnalytics[];

    isLoading: boolean;
    error: string | null;

    loadAnalytics: () => Promise<void>;
    clearError: () => void;
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
    overview: null,
    channelAnalytics: [],
    bookingAnalytics: [],

    isLoading: false,
    error: null,

    loadAnalytics: async () => {
        try {
            set({ isLoading: true, error: null });

            const [overview, channelAnalytics, bookingAnalytics] =
                await Promise.all([
                    analyticsService.getOverview(),
                    analyticsService.getChannelAnalytics(),
                    analyticsService.getBookingAnalytics(),
                ]);

            set({
                overview,
                channelAnalytics,
                bookingAnalytics,
                isLoading: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load analytics",
                isLoading: false,
            });
        }
    },

    clearError: () => {
        set({ error: null });
    },
}));