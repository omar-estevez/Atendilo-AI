import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
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
import ConversationFiltersPanel, {
    defaultConversationAdvancedFilters,
    type ConversationAdvancedFilters,
} from "./filter-panel/ConversationFiltersPanel";
import { useSearchParams } from "react-router";
import { useAuthStore } from "@/store/authStore";
import { safeText, getInitialsSafe, getChannelIconSafe, formatDateSafe, getStatusClassSafe, getUrgencyClassSafe, formatLabelSafe, getScoreClassSafe } from "./helpers/ConverstionHelpers";

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
        refreshSelectedConversation
    } = useDashboardDataStore();

    const { hasPermission } = useAuthStore();

    const [searchTerm, setSearchTerm] = useState("");
    const [messageInput, setMessageInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [advancedFilters, setAdvancedFilters] =
        useState<ConversationAdvancedFilters>(
            defaultConversationAdvancedFilters
        );

    const canReply = hasPermission("conversations.reply");
    const canUpdateStatus = hasPermission("conversations.assign");

    const selectedStatus = safeText(selectedConversation?.status, "open");

    const isPendingConversation = selectedStatus === "pending";
    const isClosedConversation = selectedStatus === "closed";

    const canSendAgentMessage =
        canReply && Boolean(selectedConversation) && isPendingConversation;

    const replyPlaceholder = !canReply
        ? "View-only access. You cannot reply."
        : isClosedConversation
            ? "This conversation is closed."
            : !isPendingConversation
                ? "AI is handling this conversation. Move it to Pending to reply."
                : "Write a reply...";

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

    useEffect(() => {
        const interval = window.setInterval(() => {
            loadConversations();
            refreshSelectedConversation();
        }, 3000);

        return () => {
            window.clearInterval(interval);
        };
    }, [loadConversations, refreshSelectedConversation]);

    const getLastMessage = (
        list?: {
            id: string;
            content: unknown;
            sender_type: string;
            created_at: string;
        }[]
    ) => {
        if (!list || list.length === 0) {
            return "No messages yet";
        }

        const sortedMessages = [...list].sort(
            (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
        );

        return safeText(sortedMessages[0]?.content, "No message content");
    };

    const filteredConversations = useMemo(() => {
        return conversations.filter((conversation) => {
            const contactName = safeText(conversation.contacts?.full_name);
            const contactEmail = safeText(conversation.contacts?.email);
            const contactPhone = safeText(conversation.contacts?.phone);
            const conversationStatus = safeText(conversation.status);
            const channelType = safeText(conversation.channels?.type);
            const sentiment = safeText(conversation.sentiment);
            const urgency = safeText(conversation.urgency);
            const aiScore = Number(conversation.ai_score || 0);

            const search = searchTerm.toLowerCase();

            const matchesSearch =
                contactName.toLowerCase().includes(search) ||
                contactEmail.toLowerCase().includes(search) ||
                contactPhone.toLowerCase().includes(search);

            const matchesStatus =
                advancedFilters.status === "all" ||
                conversationStatus === advancedFilters.status;

            const matchesChannel =
                advancedFilters.channel === "all" ||
                channelType === advancedFilters.channel;

            const matchesSentiment =
                advancedFilters.sentiment === "all" ||
                sentiment === advancedFilters.sentiment;

            const matchesUrgency =
                advancedFilters.urgency === "all" ||
                urgency === advancedFilters.urgency;

            const matchesAiScore = aiScore >= advancedFilters.minAiScore;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesChannel &&
                matchesSentiment &&
                matchesUrgency &&
                matchesAiScore
            );
        });
    }, [conversations, searchTerm, advancedFilters]);

    const handleSelectConversation = async (conversationId: string) => {
        await selectConversation(conversationId);
    };

    const handleSendMessage = async () => {
        if (!canSendAgentMessage) return;
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
        safeText(selectedConversation?.contacts?.full_name) ||
        "Select a conversation";

    return (
        <div className="h-full px-5 py-6 sm:px-7 lg:px-8">
            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Conversations
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage customer conversations across your active
                        channels.
                    </p>
                </div>

                <Button
                    variant="outline"
                    onClick={() => loadConversations()}
                    disabled={isLoading}
                >
                    <RefreshCw
                        className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""
                            }`}
                    />
                    Refresh
                </Button>
            </div>

            {error && (
                <Card className="mb-4 border-red-500/30 bg-red-500/10 p-4">
                    <p className="text-sm text-red-400">
                        {safeText(error, "Unexpected error")}
                    </p>
                </Card>
            )}

            <div className="grid h-[calc(100vh-190px)] min-h-[620px] grid-cols-1 gap-5 xl:grid-cols-[460px_1fr]">
                <Card className="flex min-h-0 flex-col overflow-hidden border-border/50">
                    <div className="flex gap-2 p-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                                placeholder="Search conversations..."
                                className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                            />
                        </div>

                        <Button
                            variant={filtersOpen ? "default" : "outline"}
                            onClick={() =>
                                setFiltersOpen((current) => !current)
                            }
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
                                setAdvancedFilters(
                                    defaultConversationAdvancedFilters
                                )
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
                                {filteredConversations.map(
                                    (conversation, index) => {
                                        const contactName =
                                            safeText(
                                                conversation.contacts?.full_name
                                            ) || "Unknown Contact";

                                        const status = safeText(
                                            conversation.status,
                                            "open"
                                        );

                                        const channelName =
                                            safeText(
                                                conversation.channels?.name
                                            ) || "No channel";

                                        const channelType = safeText(
                                            conversation.channels?.type
                                        );

                                        const isSelected =
                                            selectedConversation?.id ===
                                            conversation.id;

                                        return (
                                            <motion.button
                                                key={conversation.id}
                                                initial={{
                                                    opacity: 0,
                                                    y: 8,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                }}
                                                transition={{
                                                    delay: index * 0.03,
                                                }}
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
                                                        {getInitialsSafe(
                                                            contactName
                                                        )}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="min-w-0">
                                                                <p className="truncate font-semibold">
                                                                    {
                                                                        contactName
                                                                    }
                                                                </p>

                                                                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                                    {getChannelIconSafe(
                                                                        channelType
                                                                    )}
                                                                    <span>
                                                                        {
                                                                            channelName
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <span className="shrink-0 text-xs text-muted-foreground">
                                                                {formatDateSafe(
                                                                    conversation.last_message_at
                                                                )}
                                                            </span>
                                                        </div>

                                                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                                            {getLastMessage(
                                                                conversation.messages
                                                            )}
                                                        </p>

                                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                                            <span
                                                                className={`rounded-full border px-2 py-0.5 text-[11px] capitalize ${getStatusClassSafe(
                                                                    status
                                                                )}`}
                                                            >
                                                                {status}
                                                            </span>

                                                            {status ===
                                                                "pending" && (
                                                                    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-300">
                                                                        Needs agent
                                                                    </span>
                                                                )}

                                                            {safeText(
                                                                conversation.urgency
                                                            ) && (
                                                                    <span
                                                                        className={`rounded-full border px-2 py-0.5 text-[11px] ${getUrgencyClassSafe(
                                                                            conversation.urgency
                                                                        )}`}
                                                                    >
                                                                        {formatLabelSafe(
                                                                            conversation.urgency
                                                                        )}
                                                                    </span>
                                                                )}

                                                            {conversation.ai_score !==
                                                                null &&
                                                                conversation.ai_score !==
                                                                undefined && (
                                                                    <span
                                                                        className={`rounded-full border px-2 py-0.5 text-[11px] ${getScoreClassSafe(
                                                                            conversation.ai_score
                                                                        )}`}
                                                                    >
                                                                        Score{" "}
                                                                        {Number(
                                                                            conversation.ai_score ||
                                                                            0
                                                                        )}
                                                                        %
                                                                    </span>
                                                                )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.button>
                                        );
                                    }
                                )}
                            </div>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                                <Inbox className="mb-3 h-10 w-10 text-muted-foreground" />
                                <p className="font-medium">
                                    No conversations found
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Try another search or status filter.
                                </p>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="flex min-h-0 flex-col overflow-hidden border-border/50">
                    {selectedConversation ? (
                        <>
                            <div className="border-b border-border/50 p-4">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                                            {getInitialsSafe(
                                                selectedContactName
                                            )}
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="text-lg font-semibold">
                                                    {selectedContactName}
                                                </h2>

                                                <span
                                                    className={`rounded-full border px-2.5 py-1 text-xs capitalize ${getStatusClassSafe(
                                                        selectedStatus
                                                    )}`}
                                                >
                                                    {selectedStatus}
                                                </span>
                                            </div>

                                            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                                {safeText(
                                                    selectedConversation
                                                        .contacts?.email
                                                ) && (
                                                        <span>
                                                            {safeText(
                                                                selectedConversation
                                                                    .contacts
                                                                    ?.email
                                                            )}
                                                        </span>
                                                    )}

                                                {safeText(
                                                    selectedConversation
                                                        .contacts?.phone
                                                ) && (
                                                        <span>
                                                            {safeText(
                                                                selectedConversation
                                                                    .contacts
                                                                    ?.phone
                                                            )}
                                                        </span>
                                                    )}

                                                <span className="flex items-center gap-1">
                                                    {getChannelIconSafe(
                                                        selectedConversation
                                                            .channels?.type
                                                    )}
                                                    {safeText(
                                                        selectedConversation
                                                            .channels?.name,
                                                        "No channel"
                                                    )}
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
                                            {formatLabelSafe(
                                                selectedConversation.intent
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border/60 bg-background/40 p-3">
                                        <p className="text-xs text-muted-foreground">
                                            Urgency
                                        </p>
                                        <p className="mt-1 text-sm font-medium">
                                            {formatLabelSafe(
                                                selectedConversation.urgency
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border/60 bg-background/40 p-3">
                                        <p className="text-xs text-muted-foreground">
                                            Sentiment
                                        </p>
                                        <p className="mt-1 text-sm font-medium">
                                            {formatLabelSafe(
                                                selectedConversation.sentiment
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border/60 bg-background/40 p-3">
                                        <p className="text-xs text-muted-foreground">
                                            AI Score
                                        </p>
                                        <p className="mt-1 text-sm font-medium">
                                            {Number(
                                                selectedConversation.ai_score ||
                                                0
                                            )}
                                            %
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 rounded-xl border border-primary/20 bg-primary/10 p-3">
                                    <p className="flex items-center gap-2 text-xs font-medium text-primary">
                                        <img
                                            src="/icon.png"
                                            alt="AI"
                                            className="h-4 w-4 object-contain"
                                        />
                                        AI Summary
                                    </p>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {safeText(
                                            selectedConversation.ai_summary,
                                            "No AI summary available yet."
                                        )}
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
                                            const senderType = safeText(
                                                message.sender_type
                                            );

                                            const isAgent =
                                                senderType === "agent";
                                            const isAi = senderType === "ai";
                                            const isCustomer =
                                                senderType === "contact";

                                            return (
                                                <div
                                                    key={message.id}
                                                    className={[
                                                        "flex",
                                                        isCustomer
                                                            ? "justify-start"
                                                            : "justify-end",
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
                                                                <img
                                                                    src="/icon.png"
                                                                    alt="AI"
                                                                    className="h-4 w-4 object-contain"
                                                                />
                                                            ) : (
                                                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                                                            )}

                                                            <span className="text-xs capitalize text-muted-foreground">
                                                                {isAi
                                                                    ? "AI"
                                                                    : isAgent
                                                                        ? "Agent"
                                                                        : "Customer"}
                                                            </span>

                                                            <span className="text-xs text-muted-foreground">
                                                                {formatDateSafe(
                                                                    message.created_at
                                                                )}
                                                            </span>
                                                        </div>

                                                        <p className="text-sm leading-relaxed">
                                                            {safeText(
                                                                message.content
                                                            )}
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
                                            Messages will appear here.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {selectedConversation &&
                                !isPendingConversation &&
                                !isClosedConversation && (
                                    <div className="border-t border-border/50 bg-primary/5 px-4 py-3">
                                        <p className="text-xs text-muted-foreground">
                                            AI is currently handling this
                                            conversation. To reply as an agent,
                                            change the status to{" "}
                                            <span className="font-semibold text-primary">
                                                Pending
                                            </span>
                                            .
                                        </p>
                                    </div>
                                )}

                            {selectedConversation && isPendingConversation && (
                                <div className="border-t border-amber-500/20 bg-amber-500/10 px-4 py-3">
                                    <p className="text-xs text-amber-300">
                                        Human handoff active. You can now reply
                                        as an agent.
                                    </p>
                                </div>
                            )}

                            {selectedConversation && isClosedConversation && (
                                <div className="border-t border-red-500/20 bg-red-500/10 px-4 py-3">
                                    <p className="text-xs text-red-300">
                                        This conversation is closed. Move it to
                                        Pending to continue.
                                    </p>
                                </div>
                            )}

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
                                        disabled={!canSendAgentMessage}
                                        placeholder={replyPlaceholder}
                                        className="min-h-[44px] flex-1 resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                                    />

                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={
                                            !canSendAgentMessage ||
                                            isSending ||
                                            !messageInput.trim()
                                        }
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
                                Choose a conversation from the list to view
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