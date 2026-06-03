import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Clock,
    ExternalLink,
    RefreshCw,
    Search,
    XCircle,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAIActivityStore } from "@/store/dashboard/aiActivityStore";
import type {
    AIActivityStatusFilter,
    AIActivityTypeFilter,
} from "./helpers/ActivityHelper";
import {
    activityStatuses,
    activityTypes,
    formatLabel,
    formatTime,
    getActivityIcon,
    getContactDisplayName,
    getConversationDescription,
    getStatusClass,
    getStatusIcon,
} from "./helpers/ActivityHelper";

const statCards = [
    {
        id: "total",
        label: "Total Events",
        icon: Activity,
        className: "text-primary",
    },
    {
        id: "success",
        label: "Successful",
        icon: CheckCircle2,
        className: "text-emerald-400",
    },
    {
        id: "warning",
        label: "Warnings",
        icon: AlertTriangle,
        className: "text-yellow-400",
    },
    {
        id: "error",
        label: "Errors",
        icon: XCircle,
        className: "text-red-400",
    },
];

export const ActivityPage = () => {
    const navigate = useNavigate();

    const { logs, selectedLog, isLoading, error, loadLogs, selectLog } =
        useAIActivityStore();

    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<AIActivityTypeFilter>("all");
    const [statusFilter, setStatusFilter] =
        useState<AIActivityStatusFilter>("all");

    useEffect(() => {
        loadLogs({
            type: typeFilter,
            status: statusFilter,
        });
    }, [loadLogs, typeFilter, statusFilter]);

    const filteredLogs = useMemo(() => {
        return logs.filter((log) => {
            const search = searchTerm.toLowerCase();

            return (
                log.title.toLowerCase().includes(search) ||
                (log.description || "").toLowerCase().includes(search) ||
                getContactDisplayName(log).toLowerCase().includes(search) ||
                getConversationDescription(log).toLowerCase().includes(search) ||
                JSON.stringify(log.metadata || {}).toLowerCase().includes(search)
            );
        });
    }, [logs, searchTerm]);

    const stats = useMemo(() => {
        return {
            total: logs.length,
            success: logs.filter((log) => log.status === "success").length,
            warning: logs.filter((log) => log.status === "warning").length,
            error: logs.filter((log) => log.status === "error").length,
        };
    }, [logs]);

    const selectedContactName = getContactDisplayName(selectedLog || undefined);
    const selectedConversationDescription = getConversationDescription(
        selectedLog || undefined
    );

    return (
        <div className="space-y-6 pb-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Activity</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Monitor how Atendilo AI is handling customer actions, replies, leads
                        and workflows.
                    </p>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        loadLogs({
                            type: typeFilter,
                            status: statusFilter,
                        })
                    }
                    disabled={isLoading}
                    className="w-fit"
                >
                    <RefreshCw
                        className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                    />
                    Refresh
                </Button>
            </div>

            {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    const value = stats[card.id as keyof typeof stats];

                    return (
                        <Card
                            key={card.id}
                            className="overflow-hidden border-border/60 bg-card/60 p-5"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{card.label}</p>
                                    <h3 className={`mt-6 text-3xl font-bold ${card.className}`}>
                                        {isLoading ? "..." : value}
                                    </h3>
                                </div>

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Icon className="h-5 w-5" />
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[430px_minmax(0,1fr)]">
                <Card className="h-[690px] overflow-hidden border-border/60 bg-card/60">
                    <div className="border-b border-border/60 p-4">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search AI activity..."
                                className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                            />
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-xs text-muted-foreground">
                                    Type
                                </label>
                                <select
                                    value={typeFilter}
                                    onChange={(event) =>
                                        setTypeFilter(event.target.value as AIActivityTypeFilter)
                                    }
                                    className="h-9 w-full rounded-lg border border-border bg-background px-2 text-xs outline-none focus:border-primary"
                                >
                                    {activityTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {formatLabel(type)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs text-muted-foreground">
                                    Status
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(event) =>
                                        setStatusFilter(
                                            event.target.value as AIActivityStatusFilter
                                        )
                                    }
                                    className="h-9 w-full rounded-lg border border-border bg-background px-2 text-xs outline-none focus:border-primary"
                                >
                                    {activityStatuses.map((status) => (
                                        <option key={status} value={status}>
                                            {formatLabel(status)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="h-[570px] overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                Loading AI activity...
                            </div>
                        ) : filteredLogs.length > 0 ? (
                            <div className="divide-y divide-border/50">
                                {filteredLogs.map((log, index) => {
                                    const isSelected = selectedLog?.id === log.id;
                                    const contactName = getContactDisplayName(log);

                                    return (
                                        <motion.button
                                            key={log.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.025 }}
                                            onClick={() => selectLog(log)}
                                            className={[
                                                "w-full p-4 text-left transition-colors",
                                                isSelected ? "bg-primary/10" : "hover:bg-secondary/40",
                                            ].join(" ")}
                                        >
                                            <div className="flex gap-3">
                                                <div
                                                    className={[
                                                        "mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                                                        getStatusClass(log.status),
                                                    ].join(" ")}
                                                >
                                                    {getActivityIcon(log.type)}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <h3 className="line-clamp-1 text-sm font-semibold">
                                                            {log.title}
                                                        </h3>
                                                        <span className="shrink-0 text-xs text-muted-foreground">
                                                            {formatTime(log.created_at)}
                                                        </span>
                                                    </div>

                                                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                                        {log.description || "No description"}
                                                    </p>

                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {contactName}
                                                    </p>

                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        <span
                                                            className={[
                                                                "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
                                                                getStatusClass(log.status),
                                                            ].join(" ")}
                                                        >
                                                            {getStatusIcon(log.status)}
                                                            <span className="ml-1">
                                                                {formatLabel(log.status)}
                                                            </span>
                                                        </span>

                                                        <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                                            {formatLabel(log.type)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                                <Activity className="mb-3 h-10 w-10 text-muted-foreground" />
                                <h3 className="font-semibold">No activity found</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Try changing your filters or search term.
                                </p>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="min-h-[690px] overflow-hidden border-border/60 bg-card/60">
                    {selectedLog ? (
                        <div className="flex h-full flex-col">
                            <div className="border-b border-border/60 p-6">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="flex gap-4">
                                        <div
                                            className={[
                                                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border",
                                                getStatusClass(selectedLog.status),
                                            ].join(" ")}
                                        >
                                            {getActivityIcon(selectedLog.type)}
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="text-xl font-bold">
                                                    {selectedLog.title}
                                                </h2>

                                                <span
                                                    className={[
                                                        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs",
                                                        getStatusClass(selectedLog.status),
                                                    ].join(" ")}
                                                >
                                                    {getStatusIcon(selectedLog.status)}
                                                    <span className="ml-1">
                                                        {formatLabel(selectedLog.status)}
                                                    </span>
                                                </span>
                                            </div>

                                            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                                                {selectedLog.description || "No description available."}
                                            </p>

                                            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                                <Clock className="h-3.5 w-3.5" />
                                                {new Intl.DateTimeFormat("en-US", {
                                                    dateStyle: "medium",
                                                    timeStyle: "short",
                                                }).format(new Date(selectedLog.created_at))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                                    <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Activity Type
                                        </p>
                                        <p className="mt-2 font-semibold">
                                            {formatLabel(selectedLog.type)}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">Status</p>
                                        <p className="mt-2 font-semibold">
                                            {formatLabel(selectedLog.status)}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Conversation
                                        </p>

                                        <p className="mt-2 text-sm font-semibold leading-6">
                                            {selectedConversationDescription}
                                        </p>

                                        {selectedLog.conversation_id && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="mt-4"
                                                onClick={() =>
                                                    navigate(
                                                        `/dashboard/conversations?conversationId=${selectedLog.conversation_id}`
                                                    )
                                                }
                                            >
                                                Open Conversation
                                                <ExternalLink className="ml-2 h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">Contact</p>

                                        <p className="mt-2 text-sm font-semibold">
                                            {selectedContactName}
                                        </p>

                                        {selectedLog.contact?.email && (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {selectedLog.contact.email}
                                            </p>
                                        )}

                                        {selectedLog.contact?.phone && (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {selectedLog.contact.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {selectedLog.conversation?.ai_summary && (
                                    <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/10 p-4">
                                        <p className="text-xs font-medium text-primary">
                                            AI Summary
                                        </p>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {selectedLog.conversation.ai_summary}
                                        </p>
                                    </div>
                                )}

                                <details className="mt-4 rounded-2xl border border-border/60 bg-background/40 p-4">
                                    <summary className="cursor-pointer text-sm font-semibold">
                                        Technical Details
                                    </summary>

                                    <pre className="mt-4 max-h-[280px] overflow-auto rounded-xl bg-black/30 p-4 text-xs text-muted-foreground custom-scrollbar">
                                        {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                                    </pre>
                                </details>
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-[690px] flex-col items-center justify-center px-8 text-center">
                            <Activity className="mb-3 h-12 w-12 text-muted-foreground" />
                            <h2 className="text-xl font-bold">Select an AI activity</h2>
                            <p className="mt-2 max-w-md text-sm text-muted-foreground">
                                Choose an activity from the left to inspect AI actions, linked
                                conversations, contacts and technical details.
                            </p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default ActivityPage;