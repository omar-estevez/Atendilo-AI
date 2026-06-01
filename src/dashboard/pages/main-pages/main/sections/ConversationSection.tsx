import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Workflow, ExternalLink } from "lucide-react";
import { formatLabel, getInitials, getLastMessage, getScoreClass, getSentimentClass, getUrgencyClass } from "../helpers/ConversationMainHelpers";
import { useDashboardDataStore } from "@/store/dashboard/dashboardDataStore";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router";

export const ConversationSection = () => {
    const navigate = useNavigate();

    const { recentConversations } = useDashboardDataStore();
    const hasPermission = useAuthStore((state) => state.hasPermission);

    const canViewConversations = hasPermission("conversations.view");

    return (
        <Card className="lg:col-span-2 border-border/50 overflow-hidden">
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Workflow className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Intelligent Conversations</h3>
                </div>

                {canViewConversations && (
                    <Button
                        onClick={() => navigate("/dashboard/conversations")}
                        variant="ghost"
                        size="sm"
                    >
                        View all
                        <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                )}
            </div>

            <div className="divide-y divide-border/50">
                {recentConversations.length > 0 ? (
                    recentConversations.map((conversation) => {
                        const contactName =
                            conversation.contacts?.full_name || "Unknown Contact";

                        const channelName =
                            conversation.channels?.name || "Unknown Channel";

                        const lastMessage = getLastMessage(conversation.messages);

                        return (
                            <div
                                key={conversation.id}
                                className="border-b border-border/50 last:border-0 px-5 py-5"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                                        {getInitials(contactName)}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h4 className="font-semibold text-foreground">
                                                {contactName}
                                            </h4>

                                            <span className="text-xs text-muted-foreground">
                                                {channelName}
                                            </span>

                                            <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-xs capitalize text-muted-foreground">
                                                {conversation.status}
                                            </span>
                                        </div>

                                        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                                            {lastMessage}
                                        </p>

                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs text-primary">
                                                {formatLabel(conversation.intent)}
                                            </span>

                                            <span
                                                className={`rounded-full border px-2.5 py-1 text-xs ${getUrgencyClass(
                                                    conversation.urgency
                                                )}`}
                                            >
                                                {formatLabel(conversation.urgency)} Urgency
                                            </span>

                                            <span
                                                className={`rounded-full border px-2.5 py-1 text-xs ${getSentimentClass(
                                                    conversation.sentiment
                                                )}`}
                                            >
                                                {formatLabel(conversation.sentiment)}
                                            </span>

                                            <span
                                                className={`rounded-full border px-2.5 py-1 text-xs ${getScoreClass(
                                                    conversation.ai_score
                                                )}`}
                                            >
                                                Score: {conversation.ai_score ?? 0}%
                                            </span>
                                        </div>

                                        <div className="mt-4 rounded-xl border border-border/60 bg-background/40 p-4">
                                            <p className="text-xs font-medium text-primary">
                                                AI Summary
                                            </p>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {conversation.ai_summary ||
                                                    "No AI summary available yet."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="py-10 text-center">
                        <p className="text-sm text-muted-foreground">
                            No conversations yet.
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
};
