import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    Bot,
    CheckCircle2,
    Circle,
    Clock,
    Inbox,
    MessageSquare,
    RefreshCw,
    Search,
    Send,
    SlidersHorizontal,
    User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDashboardDataStore } from "@/store/dashboard/dashboardDataStore";
import type { ConversationStatus } from "@/services/dashboard/conversationsService";
import ConversationFiltersPanel, { defaultConversationAdvancedFilters, type ConversationAdvancedFilters } from "./filter-panel/ConversationFiltersPanel";
import { useSearchParams } from "react-router";
import { getInitials, getChannelIcon, formatDate, getStatusClass, getUrgencyClass, formatLabel, getScoreClass } from "./helpers/ConverstionHelpers";
import { useAuthStore } from "@/store/authStore";

export const ConversationPage = () => {

    const [searchParams] = useSearchParams();
    const conversationIdFromUrl = searchParams.get("conversationId");

    const {
        conversations,
        selectedConversation,
        messages,
        isLoading,
        isMessagesLoading,
        error,
        loadConversations,
        selectConversation,
        sendMessage,
        updateSelectedConversationStatus,
    } = useDashboardDataStore();

    const { hasPermission } = useAuthStore();

    const [searchTerm, setSearchTerm] = useState("");
    const [messageInput, setMessageInput] = useState("");
    const [isSending, setIsSending] = useState(false);

    const [filtersOpen, setFiltersOpen] = useState(false)
    const [advancedFilters, setAdvancedFilters] =
        useState<ConversationAdvancedFilters>(
            defaultConversationAdvancedFilters
        )

    const canReply = hasPermission("conversations.reply");
    const canUpdateStatus = hasPermission("conversations.assign");

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    useEffect(() => {
        if (conversations.length === 0) return;

        if (conversationIdFromUrl) {
            const conversationExists = conversations.some(
                (conversation) => conversation.id === conversationIdFromUrl
            );

            if (
                conversationExists &&
                selectedConversation?.id !== conversationIdFromUrl
            ) {
                selectConversation(conversationIdFromUrl);
                return;
            }
        }

        if (!selectedConversation) {
            selectConversation(conversations[0].id);
        }
    }, [
        conversations,
        conversationIdFromUrl,
        selectedConversation,
        selectConversation,
    ]);

    const getLastMessage = (
        messages?: {
            id: string;
            content: string;
            sender_type: string;
            created_at: string;
        }[]
    ) => {
        if (!messages || messages.length === 0) {
            return "No messages yet";
        }

        const sortedMessages = [...messages].sort(
            (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
        );

        return sortedMessages[0].content;
    };

    const filteredConversations = useMemo(() => {
        return conversations.filter((conversation) => {
            const contactName = conversation.contacts?.full_name || ""
            const contactEmail = conversation.contacts?.email || ""
            const contactPhone = conversation.contacts?.phone || ""

            const matchesSearch =
                contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contactPhone.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesStatus =
                advancedFilters.status === "all" ||
                conversation.status === advancedFilters.status

            const matchesChannel =
                advancedFilters.channel === "all" ||
                conversation.channels?.type === advancedFilters.channel

            const matchesSentiment =
                advancedFilters.sentiment === "all" ||
                conversation.sentiment === advancedFilters.sentiment

            const matchesUrgency =
                advancedFilters.urgency === "all" ||
                conversation.urgency === advancedFilters.urgency

            const matchesAiScore =
                (conversation.ai_score || 0) >= advancedFilters.minAiScore

            return (
                matchesSearch &&
                matchesStatus &&
                matchesChannel &&
                matchesSentiment &&
                matchesUrgency &&
                matchesAiScore
            )
        })
    }, [conversations, searchTerm, advancedFilters])

    const handleSelectConversation = async (conversationId: string) => {
        await selectConversation(conversationId);
    };

    const handleSendMessage = async () => {
        if (!canReply) return;
        if (!messageInput.trim()) return;

        try {
            setIsSending(true);
            await sendMessage(messageInput.trim(), "agent");
            setMessageInput("");
        } finally {
            setIsSending(false);
        }
    };

    const handleStatusChange = async (status: ConversationStatus) => {
        if (!canUpdateStatus) return;

        await updateSelectedConversationStatus(status);
    };

    const selectedContactName =
        selectedConversation?.contacts?.full_name || "Select a conversation";

    return (
        <div className="h-full px-5 py-6 sm:px-7 lg:px-8">
            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Conversations
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage customer conversations across your active channels.
                    </p>
                </div>

                <Button
                    variant="outline"
                    onClick={() => loadConversations()}
                    disabled={isLoading}
                >
                    <RefreshCw
                        className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                    />
                    Refresh
                </Button>
            </div>

            {error && (
                <Card className="mb-4 border-red-500/30 bg-red-500/10 p-4">
                    <p className="text-sm text-red-400">{error}</p>
                </Card>
            )}

            <div className="grid h-[calc(100vh-190px)] min-h-[620px] grid-cols-1 gap-5 xl:grid-cols-[460px_1fr]">
                {/* Conversations List */}
                <Card className="flex min-h-0 flex-col overflow-hidden border-border/50">
                    <div className="flex gap-2 p-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search conversations..."
                                className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                            />
                        </div>

                        <Button
                            variant={filtersOpen ? "default" : "outline"}
                            onClick={() => setFiltersOpen((current) => !current)}
                        >
                            <SlidersHorizontal className="mr-2 h-4 w-4" />
                            Filters
                        </Button>
                    </div>

                    <div className="mt-3 px-2">
                        <ConversationFiltersPanel
                            open={filtersOpen}
                            filters={advancedFilters}
                            onChange={setAdvancedFilters}
                            onReset={() =>
                                setAdvancedFilters(defaultConversationAdvancedFilters)
                            }
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex h-full items-center justify-center">
                                <p className="text-sm text-muted-foreground">
                                    Loading conversations...
                                </p>
                            </div>
                        ) : filteredConversations.length > 0 ? (
                            <div className="divide-y divide-border/50">
                                {filteredConversations.map((conversation, index) => {
                                    const contactName =
                                        conversation.contacts?.full_name ||
                                        "Unknown Contact";

                                    const isSelected =
                                        selectedConversation?.id ===
                                        conversation.id;

                                    return (
                                        <motion.button
                                            key={conversation.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            onClick={() =>
                                                handleSelectConversation(
                                                    conversation.id
                                                )
                                            }
                                            className={[
                                                "w-full p-4 text-left transition-colors",
                                                isSelected
                                                    ? "bg-primary/10"
                                                    : "hover:bg-secondary/40",
                                            ].join(" ")}
                                        >
                                            <div className="flex gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                                                    {getInitials(contactName)}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <p className="truncate font-semibold">
                                                                {contactName}
                                                            </p>

                                                            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                                {getChannelIcon(
                                                                    conversation
                                                                        .channels
                                                                        ?.type
                                                                )}
                                                                <span>
                                                                    {conversation
                                                                        .channels
                                                                        ?.name ||
                                                                        "No channel"}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <span className="shrink-0 text-xs text-muted-foreground">
                                                            {formatDate(
                                                                conversation.last_message_at
                                                            )}
                                                        </span>
                                                    </div>

                                                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                                        {getLastMessage(conversation.messages)}
                                                    </p>

                                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                                        <span
                                                            className={`rounded-full border px-2 py-0.5 text-[11px] capitalize ${getStatusClass(
                                                                conversation.status
                                                            )}`}
                                                        >
                                                            {conversation.status}
                                                        </span>

                                                        {conversation.urgency && (
                                                            <span
                                                                className={`rounded-full border px-2 py-0.5 text-[11px] ${getUrgencyClass(
                                                                    conversation.urgency
                                                                )}`}
                                                            >
                                                                {formatLabel(
                                                                    conversation.urgency
                                                                )}
                                                            </span>
                                                        )}

                                                        {conversation.ai_score !==
                                                            null &&
                                                            conversation.ai_score !==
                                                            undefined && (
                                                                <span
                                                                    className={`rounded-full border px-2 py-0.5 text-[11px] ${getScoreClass(
                                                                        conversation.ai_score
                                                                    )}`}
                                                                >
                                                                    Score{" "}
                                                                    {
                                                                        conversation.ai_score
                                                                    }
                                                                    %
                                                                </span>
                                                            )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                                <Inbox className="mb-3 h-10 w-10 text-muted-foreground" />
                                <p className="font-medium">No conversations found</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Try another search or status filter.
                                </p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Conversation Detail */}
                <Card className="flex min-h-0 flex-col overflow-hidden border-border/50">
                    {selectedConversation ? (
                        <>
                            <div className="border-b border-border/50 p-4">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                                            {getInitials(selectedContactName)}
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="text-lg font-semibold">
                                                    {selectedContactName}
                                                </h2>

                                                <span
                                                    className={`rounded-full border px-2.5 py-1 text-xs capitalize ${getStatusClass(
                                                        selectedConversation.status
                                                    )}`}
                                                >
                                                    {selectedConversation.status}
                                                </span>
                                            </div>

                                            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                                <span>
                                                    {
                                                        selectedConversation
                                                            .contacts?.email
                                                    }
                                                </span>
                                                <span>
                                                    {
                                                        selectedConversation
                                                            .contacts?.phone
                                                    }
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    {getChannelIcon(
                                                        selectedConversation
                                                            .channels?.type
                                                    )}
                                                    {
                                                        selectedConversation
                                                            .channels?.name
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                handleStatusChange("open")
                                            }
                                            disabled={!canUpdateStatus}
                                        >
                                            <Circle className="mr-2 h-4 w-4 text-emerald-400" />
                                            Open
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                handleStatusChange("pending")
                                            }
                                            disabled={!canUpdateStatus}
                                        >
                                            <Clock className="mr-2 h-4 w-4 text-amber-400" />
                                            Pending
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                handleStatusChange("closed")
                                            }
                                            disabled={!canUpdateStatus}
                                        >
                                            <CheckCircle2 className="mr-2 h-4 w-4 text-muted-foreground" />
                                            Close
                                        </Button>
                                    </div>
                                </div>

                                <div className="mt-4 grid gap-3 md:grid-cols-4">
                                    <div className="rounded-xl border border-border/60 bg-background/40 p-3">
                                        <p className="text-xs text-muted-foreground">
                                            Intent
                                        </p>
                                        <p className="mt-1 text-sm font-medium">
                                            {formatLabel(
                                                selectedConversation.intent
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border/60 bg-background/40 p-3">
                                        <p className="text-xs text-muted-foreground">
                                            Urgency
                                        </p>
                                        <p className="mt-1 text-sm font-medium">
                                            {formatLabel(
                                                selectedConversation.urgency
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border/60 bg-background/40 p-3">
                                        <p className="text-xs text-muted-foreground">
                                            Sentiment
                                        </p>
                                        <p className="mt-1 text-sm font-medium">
                                            {formatLabel(
                                                selectedConversation.sentiment
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border/60 bg-background/40 p-3">
                                        <p className="text-xs text-muted-foreground">
                                            AI Score
                                        </p>
                                        <p className="mt-1 text-sm font-medium">
                                            {selectedConversation.ai_score ?? 0}%
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 rounded-xl border border-primary/20 bg-primary/10 p-3">
                                    <p className="flex items-center gap-2 text-xs font-medium text-primary">
                                        <Bot className="h-3.5 w-3.5" />
                                        AI Summary
                                    </p>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {selectedConversation.ai_summary ||
                                            "No AI summary available yet."}
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4">
                                {isMessagesLoading ? (
                                    <div className="flex h-full items-center justify-center">
                                        <p className="text-sm text-muted-foreground">
                                            Loading messages...
                                        </p>
                                    </div>
                                ) : messages.length > 0 ? (
                                    <div className="space-y-4">
                                        {messages.map((message) => {
                                            const isAgent =
                                                message.sender_type === "agent";
                                            const isAi =
                                                message.sender_type === "ai";

                                            return (
                                                <div
                                                    key={message.id}
                                                    className={[
                                                        "flex",
                                                        isAgent || isAi
                                                            ? "justify-end"
                                                            : "justify-start",
                                                    ].join(" ")}
                                                >
                                                    <div
                                                        className={[
                                                            "max-w-[75%] rounded-2xl border px-4 py-3",
                                                            isAi
                                                                ? "border-primary/25 bg-primary/15"
                                                                : isAgent
                                                                    ? "border-blue-500/25 bg-blue-500/15"
                                                                    : "border-border bg-secondary/60",
                                                        ].join(" ")}
                                                    >
                                                        <div className="mb-1 flex items-center gap-2">
                                                            {isAi ? (
                                                                <Bot className="h-3.5 w-3.5 text-primary" />
                                                            ) : isAgent ? (
                                                                <User className="h-3.5 w-3.5 text-blue-400" />
                                                            ) : (
                                                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                                                            )}

                                                            <span className="text-xs capitalize text-muted-foreground">
                                                                {isAi
                                                                    ? "Lumora AI"
                                                                    : isAgent
                                                                        ? "Agent"
                                                                        : "Customer"}
                                                            </span>

                                                            <span className="text-xs text-muted-foreground">
                                                                {formatDate(
                                                                    message.created_at
                                                                )}
                                                            </span>
                                                        </div>

                                                        <p className="text-sm leading-relaxed">
                                                            {message.content}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex h-full flex-col items-center justify-center text-center">
                                        <MessageSquare className="mb-3 h-10 w-10 text-muted-foreground" />
                                        <p className="font-medium">
                                            No messages yet
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Send the first message to start the
                                            conversation.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-border/50 p-4">
                                <div className="flex gap-3">
                                    <textarea
                                        value={messageInput}
                                        onChange={(event) =>
                                            setMessageInput(event.target.value)
                                        }
                                        onKeyDown={(event) => {
                                            if (
                                                event.key === "Enter" &&
                                                !event.shiftKey
                                            ) {
                                                event.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        placeholder={
                                            canReply
                                                ? "Write a reply..."
                                                : "View-only access. You cannot reply."
                                        }
                                        className="min-h-[44px] flex-1 resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                                    />

                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={!canReply || isSending || !messageInput.trim()}
                                        className="h-auto px-5"
                                    >
                                        <Send className="mr-2 h-4 w-4" />
                                        Send
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                                <MessageSquare className="h-7 w-7 text-primary" />
                            </div>

                            <h2 className="text-xl font-semibold">
                                Select a conversation
                            </h2>

                            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                                Choose a conversation from the left to view
                                messages, AI summary, urgency, sentiment and
                                customer details.
                            </p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default ConversationPage;