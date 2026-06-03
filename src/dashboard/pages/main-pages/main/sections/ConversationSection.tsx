import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Workflow, ExternalLink } from "lucide-react";
import {
    formatLabel,
    getInitials,
    getLastMessage,
    getScoreClass,
    getSentimentClass,
    getUrgencyClass,
} from "../helpers/ConversationMainHelpers";
import { useDashboardDataStore } from "@/store/dashboard/dashboardDataStore";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router";

export const ConversationSection = () => {
    const navigate = useNavigate();
    const { recentConversations } = useDashboardDataStore();
    const hasPermission = useAuthStore((state) => state.hasPermission);
    const canViewConversations = hasPermission("conversations.view");

    return (
        <Card className="h-[520px] overflow-hidden border-border/60 bg-card/60">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
                <div className="flex items-center gap-2">
                    <Workflow className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Intelligent Conversations</h3>
                </div>

                {canViewConversations && (
                    <Button
                        onClick={() => navigate("/dashboard/conversations")}
                        variant="ghost"
                        size="sm"
                    >
                        View all
                        <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </Button>
                )}
            </div>

            <div className="h-[456px] overflow-y-auto custom-scrollbar">
                {recentConversations.length > 0 ? (
                    <div className="divide-y divide-border/50">
                        {recentConversations.map((conversation) => {
                            const contactName =
                                conversation.contacts?.full_name || "Unknown Contact";
                            const channelName =
                                conversation.channels?.name || "Unknown Channel";
                            const lastMessage = getLastMessage(conversation.messages);

                            return (
                                <button
                                    key={conversation.id}
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            `/dashboard/conversations?conversationId=${conversation.id}`
                                        )
                                    }
                                    className="w-full p-5 text-left transition hover:bg-muted/30"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                                            {getInitials(contactName)}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="truncate text-sm font-semibold">
                                                    {contactName}
                                                </h4>

                                                <span className="text-xs text-muted-foreground">
                                                    {channelName}
                                                </span>

                                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                                    {formatLabel(conversation.status)}
                                                </span>
                                            </div>

                                            <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">
                                                {lastMessage}
                                            </p>

                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs text-primary">
                                                    {formatLabel(conversation.intent)}
                                                </span>

                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs ${getUrgencyClass(
                                                        conversation.urgency
                                                    )}`}
                                                >
                                                    {formatLabel(conversation.urgency)} Urgency
                                                </span>

                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs ${getSentimentClass(
                                                        conversation.sentiment
                                                    )}`}
                                                >
                                                    {formatLabel(conversation.sentiment)}
                                                </span>

                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs ${getScoreClass(
                                                        conversation.ai_score ?? 0
                                                    )}`}
                                                >
                                                    Score: {conversation.ai_score ?? 0}%
                                                </span>
                                            </div>

                                            <div className="mt-4 rounded-xl border border-border/50 bg-background/40 p-3">
                                                <p className="mb-1 text-xs font-medium text-primary">
                                                    AI Summary
                                                </p>
                                                <p className="line-clamp-2 text-sm text-muted-foreground">
                                                    {conversation.ai_summary ||
                                                        "No AI summary available yet."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        No conversations yet.
                    </div>
                )}
            </div>
        </Card>
    );
};