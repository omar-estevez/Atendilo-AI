// src/dashboard/pages/main-pages/main/sections/FollowUpsSection.tsx

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock, MessageSquareText } from "lucide-react";
import { useNavigate } from "react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDashboardDataStore } from "@/store/dashboard/dashboardDataStore";

const formatDateTime = (value?: string | null) => {
    if (!value) return "No date";

    return new Date(value).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
};

const formatLabel = (value?: string | null) => {
    if (!value) return "Unknown";

    return value
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const FollowUpsSection = () => {
    const navigate = useNavigate();
    const { conversations } = useDashboardDataStore();

    const followUps = useMemo(() => {
        return conversations
            .filter((conversation) => conversation.follow_up_required === true)
            .sort((a, b) => {
                const dateA = a.follow_up_at
                    ? new Date(a.follow_up_at).getTime()
                    : 0;
                const dateB = b.follow_up_at
                    ? new Date(b.follow_up_at).getTime()
                    : 0;

                return dateB - dateA;
            })
            .slice(0, 5);
    }, [conversations]);

    return (
        <Card className="p-5 bg-card/60 border-border/60">
            <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                    <h3 className="text-lg font-semibold">Pending Follow-ups</h3>
                    <p className="text-sm text-muted-foreground">
                        Leads marked for manual follow-up.
                    </p>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/dashboard/leads")}
                >
                    View Leads
                    <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
            </div>

            {followUps.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/70 p-6 text-center">
                    <Clock className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm font-medium">No pending follow-ups</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Mark a lead as follow-up to see it here.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {followUps.map((conversation, index) => {
                        const contactName =
                            conversation.contacts?.full_name || "Unknown Contact";

                        return (
                            <motion.div
                                key={conversation.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04 }}
                                className="rounded-xl border border-border/60 bg-background/50 p-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                                                {contactName
                                                    .split(" ")
                                                    .map((part) => part[0])
                                                    .join("")
                                                    .slice(0, 2)
                                                    .toUpperCase()}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold truncate">
                                                    {contactName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatLabel(conversation.intent)} · Score{" "}
                                                    {conversation.ai_score || 0}%
                                                </p>
                                            </div>
                                        </div>

                                        {conversation.follow_up_note && (
                                            <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                                                {conversation.follow_up_note}
                                            </p>
                                        )}

                                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                            <Clock className="w-3.5 h-3.5" />
                                            {formatDateTime(conversation.follow_up_at)}
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            navigate(
                                                `/dashboard/conversations?conversationId=${conversation.id}`
                                            )
                                        }
                                    >
                                        <MessageSquareText className="w-4 h-4 mr-2" />
                                        Open
                                    </Button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
};