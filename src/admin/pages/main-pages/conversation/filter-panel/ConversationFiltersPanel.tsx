import { Button } from "@/components/ui/button";
import type { ChannelType } from "@/services/dashboard/channelsService";
import type { ConversationStatus } from "@/services/dashboard/conversationsService";

export interface ConversationAdvancedFilters {
    sentiment: "all" | "positive" | "neutral" | "negative";
    urgency: "all" | "high" | "medium" | "low";
    minAiScore: number;
    channel: "all" | ChannelType;
    status: "all" | ConversationStatus;
}

interface ConversationFiltersPanelProps {
    open: boolean;
    filters: ConversationAdvancedFilters;
    onChange: (filters: ConversationAdvancedFilters) => void;
    onReset: () => void;
}

export const defaultConversationAdvancedFilters: ConversationAdvancedFilters = {
    sentiment: "all",
    urgency: "all",
    minAiScore: 0,
    channel: "all",
    status: "all",
};

export const ConversationFiltersPanel = ({
    open,
    filters,
    onChange,
    onReset,
}: ConversationFiltersPanelProps) => {
    if (!open) return null;

    return (
        <div className="mt-3 rounded-2xl border border-border/60 bg-secondary/20 p-3">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-semibold">Advanced Filters</h4>
                    <p className="text-xs text-muted-foreground">
                        Refine conversations by AI signals.
                    </p>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onReset}
                    className="h-7 px-2 text-xs"
                >
                    Reset
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Status
                    </label>

                    <select
                        value={filters.status}
                        onChange={(event) =>
                            onChange({
                                ...filters,
                                status: event.target.value as ConversationAdvancedFilters["status"],
                            })
                        }
                        className="h-9 w-full rounded-lg border border-border bg-background px-2 text-xs outline-none focus:border-primary"
                    >
                        <option value="all">All Status</option>
                        <option value="open">Open</option>
                        <option value="pending">Pending</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Channel
                    </label>

                    <select
                        value={filters.channel}
                        onChange={(event) =>
                            onChange({
                                ...filters,
                                channel: event.target.value as ConversationAdvancedFilters["channel"],
                            })
                        }
                        className="h-9 w-full rounded-lg border border-border bg-background px-2 text-xs outline-none focus:border-primary"
                    >
                        <option value="all">All Channels</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="sms">SMS</option>
                        <option value="webchat">Web Chat</option>
                        <option value="email">Email</option>
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                    </select>
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Sentiment
                    </label>

                    <select
                        value={filters.sentiment}
                        onChange={(event) =>
                            onChange({
                                ...filters,
                                sentiment: event.target.value as ConversationAdvancedFilters["sentiment"],
                            })
                        }
                        className="h-9 w-full rounded-lg border border-border bg-background px-2 text-xs outline-none focus:border-primary"
                    >
                        <option value="all">All Sentiment</option>
                        <option value="positive">Positive</option>
                        <option value="neutral">Neutral</option>
                        <option value="negative">Negative</option>
                    </select>
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Urgency
                    </label>

                    <select
                        value={filters.urgency}
                        onChange={(event) =>
                            onChange({
                                ...filters,
                                urgency: event.target.value as ConversationAdvancedFilters["urgency"],
                            })
                        }
                        className="h-9 w-full rounded-lg border border-border bg-background px-2 text-xs outline-none focus:border-primary"
                    >
                        <option value="all">All Urgency</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>

                <div className="col-span-2 rounded-xl border border-border/50 bg-background/50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                        <label className="text-xs font-medium text-muted-foreground">
                            Minimum AI Score
                        </label>

                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                            {filters.minAiScore}%
                        </span>
                    </div>

                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={filters.minAiScore}
                        onChange={(event) =>
                            onChange({
                                ...filters,
                                minAiScore: Number(event.target.value),
                            })
                        }
                        className="w-full accent-primary"
                    />
                </div>
            </div>
        </div>
    );
};

export default ConversationFiltersPanel;