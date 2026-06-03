import { create } from "zustand";
import {
    analyticsService,
    type AnalyticsOverview,
    type BookingAnalytics,
    type ChannelAnalytics,
    type LeadIntelligenceAnalytics,
    type BreakdownItem,
} from "@/services/dashboard/analyticsService";

interface AnalyticsStore {
    overview: AnalyticsOverview | null;
    channelAnalytics: ChannelAnalytics[];
    bookingAnalytics: BookingAnalytics[];
    leadIntelligence: LeadIntelligenceAnalytics | null;
    intentBreakdown: BreakdownItem[];
    sentimentBreakdown: BreakdownItem[];
    statusBreakdown: BreakdownItem[];

    isLoading: boolean;
    error: string | null;

    loadAnalytics: () => Promise<void>;
    clearError: () => void;
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
    overview: null,
    channelAnalytics: [],
    bookingAnalytics: [],

    leadIntelligence: null,
    intentBreakdown: [],
    sentimentBreakdown: [],
    statusBreakdown: [],

    isLoading: false,
    error: null,

    loadAnalytics: async () => {
        try {
            set({ isLoading: true, error: null });

            const [
                overview,
                channelAnalytics,
                bookingAnalytics,
                leadIntelligence,
                intentBreakdown,
                sentimentBreakdown,
                statusBreakdown,
            ] = await Promise.all([
                analyticsService.getOverview(),
                analyticsService.getChannelAnalytics(),
                analyticsService.getBookingAnalytics(),
                analyticsService.getLeadIntelligence(),
                analyticsService.getIntentBreakdown(),
                analyticsService.getSentimentBreakdown(),
                analyticsService.getStatusBreakdown(),
            ]);

            set({
                overview,
                channelAnalytics,
                bookingAnalytics,
                leadIntelligence,
                intentBreakdown,
                sentimentBreakdown,
                statusBreakdown,
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