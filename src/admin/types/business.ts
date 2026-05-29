export type BusinessPlan = "starter" | "growth" | "scale"

export type BusinessIndustry =
    | "auto_detailing"
    | "cleaning"
    | "roofing"
    | "landscaping"
    | "medical"
    | "restaurant"
    | "other"

export interface Business {
    id: string
    ownerId: string
    name: string
    plan: BusinessPlan
    industry: BusinessIndustry
    email: string
    phone: string
    website?: string
    address?: string
    serviceArea: string
    timezone: string
    createdAt: string
}

export type BusinessProfileType = {
    businessName: string;
    industry: string;
    address: string;
    city: string;
    state: string;
    country: string;
    timezone: string;
    email: string;
    phone: string;
    website: string;
};

export type BusinessService = {
    id: string
    name: string
    description: string
    price: number
    durationMinutes: number
}

export type BusinessNewService = {
    name: string
    description: string
    price: string
    durationMinutes: string
}

export type AiAssistantType = {
    name: string
    tone: string
    goal: string
    language: string
    responseStyle: string
    instructions: string
}

export type BusinessFaq = {
    id: string
    question: string
    answer: string
}

export type BusinessNewFaq = {
    question: string;
    answer: string;
}

export type BusinessBookingTypes = {
    minimumNotice: string;
    bufferTime: string;
    requireDeposit: string;
    bookingLink: string;
}

export type BusinessDay = {
    day: string
    open: string
    close: string
    enabled: boolean
}

export type EscalationRuleKey =
    | "refund"
    | "angry"
    | "customPricing"
    | "human"
    | "lowConfidence"

export type EscalationContactTypes = {
    phone: string;
    email: string;
}