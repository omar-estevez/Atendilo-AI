import { supabase } from "@/lib/supabase";

export type AIActivityType =
    | "ai_reply"
    | "lead_captured"
    | "appointment_scheduled"
    | "call_completed"
    | "follow_up_sent"
    | "case_escalated"
    | "message_analyzed"
    | "workflow_triggered";

export type AIActivityStatus = "success" | "warning" | "error" | "info";

export interface AIActivityContact {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
}

export interface AIActivityConversation {
    id: string;
    status: string | null;
    intent: string | null;
    urgency: string | null;
    sentiment: string | null;
    ai_score: number | null;
    ai_summary: string | null;
    contacts?: AIActivityContact | null;
    channels?: {
        id: string;
        name: string | null;
        type: string | null;
    } | null;
}

export interface AIActivityLog {
    id: string;
    business_id: string;
    conversation_id: string | null;
    contact_id: string | null;
    type: AIActivityType;
    status: AIActivityStatus;
    title: string;
    description: string | null;
    metadata: Record<string, unknown>;
    created_at: string;

    contact?: AIActivityContact | null;
    conversation?: AIActivityConversation | null;
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
    if (Array.isArray(value)) return value[0] || null;
    return value || null;
}

type RawActivityConversation = Omit<
    AIActivityConversation,
    "contacts" | "channels"
> & {
    contacts?: AIActivityContact | AIActivityContact[] | null;
    channels?:
    | {
        id: string;
        name: string | null;
        type: string | null;
    }
    | {
        id: string;
        name: string | null;
        type: string | null;
    }[]
    | null;
};

function normalizeConversation(
    conversation: RawActivityConversation
): AIActivityConversation {
    return {
        ...conversation,
        contacts: firstRelation(conversation.contacts),
        channels: firstRelation(conversation.channels),
    };
}

async function hydrateActivityLogs(logs: AIActivityLog[]) {
    if (logs.length === 0) return logs;

    const conversationIds = Array.from(
        new Set(
            logs
                .map((log) => log.conversation_id)
                .filter((id): id is string => Boolean(id))
        )
    );

    const directContactIds = Array.from(
        new Set(
            logs
                .map((log) => log.contact_id)
                .filter((id): id is string => Boolean(id))
        )
    );

    let conversations: AIActivityConversation[] = [];

    if (conversationIds.length > 0) {
        const { data, error } = await supabase
            .from("conversations")
            .select(
                `
        id,
        status,
        intent,
        urgency,
        sentiment,
        ai_score,
        ai_summary,
        contacts (
          id,
          full_name,
          email,
          phone
        ),
        channels (
          id,
          name,
          type
        )
      `
            )
            .in("id", conversationIds);

        if (error) {
            console.error("Hydrate activity conversations error:", error);
        } else {
            conversations = ((data || []) as unknown as RawActivityConversation[]).map(
                normalizeConversation
            );
        }
    }

    const conversationMap = new Map(
        conversations.map((conversation) => [conversation.id, conversation])
    );

    const contactIdsFromConversations = conversations
        .map((conversation) => conversation.contacts?.id)
        .filter((id): id is string => Boolean(id));

    const allContactIds = Array.from(
        new Set([...directContactIds, ...contactIdsFromConversations])
    );

    let contacts: AIActivityContact[] = [];

    if (allContactIds.length > 0) {
        const { data, error } = await supabase
            .from("contacts")
            .select("id, full_name, email, phone")
            .in("id", allContactIds);

        if (error) {
            console.error("Hydrate activity contacts error:", error);
        } else {
            contacts = (data || []) as AIActivityContact[];
        }
    }

    const contactMap = new Map(contacts.map((contact) => [contact.id, contact]));

    return logs.map((log) => {
        const conversation = log.conversation_id
            ? conversationMap.get(log.conversation_id) || null
            : null;

        const contact =
            (log.contact_id ? contactMap.get(log.contact_id) : null) ||
            conversation?.contacts ||
            null;

        return {
            ...log,
            conversation,
            contact,
        };
    });
}

export const aiActivityService = {
    async getRecentActivity(limit = 10) {
        const { data, error } = await supabase
            .from("ai_activity_logs")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) {
            throw new Error(error.message);
        }

        return hydrateActivityLogs((data || []) as AIActivityLog[]);
    },

    async getActivityLogs(params?: {
        type?: AIActivityType | "all";
        status?: AIActivityStatus | "all";
        limit?: number;
        from?: number;
    }) {
        const limit = params?.limit ?? 50;
        const from = params?.from ?? 0;
        const to = from + limit - 1;

        let query = supabase
            .from("ai_activity_logs")
            .select("*")
            .order("created_at", { ascending: false })
            .range(from, to);

        if (params?.type && params.type !== "all") {
            query = query.eq("type", params.type);
        }

        if (params?.status && params.status !== "all") {
            query = query.eq("status", params.status);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(error.message);
        }

        return hydrateActivityLogs((data || []) as AIActivityLog[]);
    },

    async createActivityLog(payload: {
        business_id: string;
        conversation_id?: string | null;
        contact_id?: string | null;
        type: AIActivityType;
        status?: AIActivityStatus;
        title: string;
        description?: string | null;
        metadata?: Record<string, unknown>;
    }) {
        const { data, error } = await supabase
            .from("ai_activity_logs")
            .insert({
                business_id: payload.business_id,
                conversation_id: payload.conversation_id || null,
                contact_id: payload.contact_id || null,
                type: payload.type,
                status: payload.status || "info",
                title: payload.title,
                description: payload.description || null,
                metadata: payload.metadata || {},
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        const [hydrated] = await hydrateActivityLogs([data as AIActivityLog]);

        return hydrated;
    },
};