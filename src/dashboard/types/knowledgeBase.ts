export type KnowledgeBaseStatus = "active" | "draft" | "archived";

export type KnowledgeBaseCategory =
    | "faq"
    | "policies"
    | "promotions"
    | "payment_methods"
    | "special_conditions"
    | "extra_instructions"
    | "custom";

export type LegacyKnowledgeBaseCategory =
    | "company_info"
    | "services"
    | "pricing"
    | "service_area"
    | "booking";

export type AnyKnowledgeBaseCategory =
    | KnowledgeBaseCategory
    | LegacyKnowledgeBaseCategory
    | string;

export interface KnowledgeBaseItem {
    id: string;
    business_id: string;
    title: string;
    content: string;
    category: AnyKnowledgeBaseCategory;
    status: KnowledgeBaseStatus;
    priority: number;
    metadata: Record<string, unknown> | null;
    created_at: string;
    updated_at: string | null;
}

export interface CreateKnowledgeBasePayload {
    business_id: string;
    title: string;
    content: string;
    category: KnowledgeBaseCategory;
    status?: KnowledgeBaseStatus;
    priority?: number;
    metadata?: Record<string, unknown> | null;
}

export interface UpdateKnowledgeBasePayload {
    title?: string;
    content?: string;
    category?: KnowledgeBaseCategory;
    status?: KnowledgeBaseStatus;
    priority?: number;
    metadata?: Record<string, unknown> | null;
}

export interface NewKnowledgeBaseItem {
    title: string;
    content: string;
    category: KnowledgeBaseCategory;
    status: KnowledgeBaseStatus;
    priority: string;
}