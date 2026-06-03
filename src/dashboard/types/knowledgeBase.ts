export type KnowledgeBaseStatus = "active" | "draft" | "archived";

export type KnowledgeBaseCategory =
    | "company_info"
    | "services"
    | "pricing"
    | "policies"
    | "service_area"
    | "booking"
    | "faq"
    | "promotions"
    | "custom";

export interface KnowledgeBaseItem {
    id: string;
    business_id: string;
    title: string;
    content: string;
    category: KnowledgeBaseCategory;
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