export type ConversationStatus = "active" | "pending" | "resolved"

export type Sentiment = "positive" | "neutral" | "negative"

export type Urgency = "low" | "medium" | "high"

export interface ConversationAIInsights {
    intent: string
    sentiment: Sentiment
    urgency: Urgency
    leadScore: number
    purchaseIntent: number
    aiSummary: string
    suggestedAction: string
}

export interface Conversation {
    id: string;
    business_id: string;
    contact_id: string | null;
    channel_id: string | null;
    status: ConversationStatus;
    assigned_to: string | null;
    last_message_at: string | null;
    created_at: string;

    intent: string | null;
    urgency: string | null;
    sentiment: string | null;
    ai_score: number | null;
    ai_summary: string | null;
}