import { api } from "@/components/config/api";

export type WebchatVisitor = {
    name?: string;
    email?: string;
    phone?: string;
};

export type WebchatAnalysis = {
    intent: string;
    urgency: string;
    sentiment: string;
    aiScore: number;
    aiSummary: string;
};

export type SendWebchatMessageInput = {
    businessId: string;
    sessionId: string;
    message: string;
    visitor?: WebchatVisitor;
};

export type SendWebchatMessageResponse = {
    reply: string;
    conversationId: string;
    contactId?: string | null;
    analysis?: WebchatAnalysis;
};

type ApiErrorResponse = {
    response?: {
        data?: {
            error?: string;
            message?: string;
        };
    };
    message?: string;
};

function getApiErrorMessage(error: unknown) {
    const apiError = error as ApiErrorResponse;

    return (
        apiError.response?.data?.error ||
        apiError.response?.data?.message ||
        apiError.message ||
        "Failed to send webchat message"
    );
}

export async function sendWebchatMessage(
    input: SendWebchatMessageInput
): Promise<SendWebchatMessageResponse> {
    try {
        const { data } = await api.post<SendWebchatMessageResponse>(
            "/api/webchat/message",
            input
        );

        return data;
    } catch (error: unknown) {
        const message = getApiErrorMessage(error);

        throw new Error(message, { cause: error });
    }
}