import { useMemo, useState } from "react";
import {
    sendWebchatMessage,
    type WebchatVisitor,
} from "@/services/connections/webchat.service";
import { getOrCreateWebchatSessionId } from "@/utils/webchatSession";

type ChatMessage = {
    id: string;
    role: "user" | "assistant";
    content: string;
};

type WebChatPreviewProps = {
    businessId: string;
};

export function WebChatPreview({ businessId }: WebChatPreviewProps) {
    const sessionId = useMemo(() => getOrCreateWebchatSessionId(), []);

    const [visitor, setVisitor] = useState<WebchatVisitor>({
        name: "",
        phone: "",
        email: "",
    });

    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Hi! I’m Atendilo AI. How can I help you today?",
        },
    ]);

    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState("");

    async function handleSendMessage() {
        const cleanMessage = message.trim();

        if (!cleanMessage || isSending) return;

        setError("");

        const userMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content: cleanMessage,
        };

        setMessages((current) => [...current, userMessage]);
        setMessage("");
        setIsSending(true);

        try {
            const response = await sendWebchatMessage({
                businessId,
                sessionId,
                message: cleanMessage,
                visitor: {
                    name: visitor.name || undefined,
                    phone: visitor.phone || undefined,
                    email: visitor.email || undefined,
                },
            });

            const aiMessage: ChatMessage = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: response.reply,
            };

            setMessages((current) => [...current, aiMessage]);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong sending the message."
            );
        } finally {
            setIsSending(false);
        }
    }

    return (
        <div className="mx-auto flex h-[700px] max-w-3xl flex-col rounded-2xl border border-border bg-card shadow-xl">
            <div className="border-b border-border p-4">
                <h2 className="text-xl font-semibold text-foreground">
                    Atendilo Web Chat Test
                </h2>
                <p className="text-sm text-muted-foreground">
                    Testing real messages with backend + Gemini AI.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    Session: {sessionId}
                </p>
            </div>

            <div className="grid gap-3 border-b border-border p-4 md:grid-cols-3">
                <input
                    value={visitor.name}
                    onChange={(event) =>
                        setVisitor((current) => ({
                            ...current,
                            name: event.target.value,
                        }))
                    }
                    placeholder="Name"
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />

                <input
                    value={visitor.phone}
                    onChange={(event) =>
                        setVisitor((current) => ({
                            ...current,
                            phone: event.target.value,
                        }))
                    }
                    placeholder="Phone"
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />

                <input
                    value={visitor.email}
                    onChange={(event) =>
                        setVisitor((current) => ({
                            ...current,
                            email: event.target.value,
                        }))
                    }
                    placeholder="Email"
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((item) => (
                    <div
                        key={item.id}
                        className={`flex ${item.role === "user" ? "justify-end" : "justify-start"
                            }`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${item.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                                }`}
                        >
                            {item.content}
                        </div>
                    </div>
                ))}

                {isSending && (
                    <div className="flex justify-start">
                        <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                            Atendilo is typing...
                        </div>
                    </div>
                )}

                {error && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                    </div>
                )}
            </div>

            <div className="flex gap-3 border-t border-border p-4">
                <input
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            handleSendMessage();
                        }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />

                <button
                    onClick={handleSendMessage}
                    disabled={isSending || !message.trim()}
                    className="rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Send
                </button>
            </div>
        </div>
    );
}