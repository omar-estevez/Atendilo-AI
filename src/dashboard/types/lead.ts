import type { ChannelType } from "./channel"

export type LeadTemperature = "hot" | "warm" | "cold"

export type LeadStatus = "new" | "contacted" | "follow_up" | "won" | "lost"

export interface Lead {
    id: string
    businessId: string
    name: string
    email: string
    phone: string
    source: ChannelType
    temperature: LeadTemperature
    status: LeadStatus
    aiScore: number
    value: number
    createdAt: string
    followUpRequired: boolean;
    followUpAt: string | null;
    followUpNote: string | null;
}