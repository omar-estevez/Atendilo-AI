import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    Filter,
    RefreshCw,
    Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAIActivityStore } from "@/store/dashboard/aiActivityStore";
import type {
    AIActivityStatus,
    AIActivityType,
} from "@/services/dashboard/aiActivityService";
import { useNavigate } from "react-router";
import { activityStatuses, activityTypes, formatLabel, formatTime, getActivityContainerClass, getActivityIcon, getContactDisplayName, getConversationDescription, getStatusClass, getStatusIcon, type AIActivityStatusFilter, type AIActivityTypeFilter } from "./helpers/ActivityHelper";

export const ActivityPage = () => {

    const navigate = useNavigate();

    const {
        logs,
        selectedLog,
        isLoading,
        error,
        loadLogs,
        selectLog,
    } = useAIActivityStore();

    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<AIActivityTypeFilter>("all");
    const [statusFilter, setStatusFilter] = useState<AIActivityStatusFilter>("all");

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
                JSON.stringify(log.metadata || {})
                    .toLowerCase()
                    .includes(search)
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

    return (
        <div className="h-full px-5 py-6 sm:px-7 lg:px-8">
            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        AI Activity
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Monitor how Atendilo AI is handling customer actions,
                        replies, leads and workflows.
                    </p>
                </div>

                <Button
                    variant="outline"
                    onClick={() =>
                        loadLogs({
                            type: typeFilter,
                            status: statusFilter,
                        })
                    }
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
                    <p className="text-sm text-red-400">{error}</p>
                </Card>
            )}

            <div className="mb-5 grid gap-4 md:grid-cols-4">
                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Total Events</p>
                    <h3 className="mt-2 text-3xl font-bold">{stats.total}</h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Successful</p>
                    <h3 className="mt-2 text-3xl font-bold text-emerald-400">
                        {stats.success}
                    </h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Warnings</p>
                    <h3 className="mt-2 text-3xl font-bold text-amber-400">
                        {stats.warning}
                    </h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Errors</p>
                    <h3 className="mt-2 text-3xl font-bold text-red-400">
                        {stats.error}
                    </h3>
                </Card>
            </div>

            <div className="grid h-[calc(100vh-300px)] min-h-[620px] grid-cols-1 gap-5 xl:grid-cols-[520px_1fr]">
                <Card className="flex min-h-0 flex-col overflow-hidden border-border/50 bg-card/60">
                    <div className="border-b border-border/50 bg-background/30 p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                                placeholder="Search AI activity..."
                                className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                            />
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                    <Filter className="h-3.5 w-3.5" />
                                    Type
                                </label>

                                <select
                                    value={typeFilter}
                                    onChange={(event) =>
                                        setTypeFilter(
                                            event.target.value as
                                            | AIActivityType
                                            | "all"
                                        )
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
                                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                    Status
                                </label>

                                <select
                                    value={statusFilter}
                                    onChange={(event) =>
                                        setStatusFilter(
                                            event.target.value as
                                            | AIActivityStatus
                                            | "all"
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

                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex h-full items-center justify-center">
                                <p className="text-sm text-muted-foreground">
                                    Loading AI activity...
                                </p>
                            </div>
                        ) : filteredLogs.length > 0 ? (
                            <div className="divide-y divide-border/50">
                                {filteredLogs.map((log, index) => {
                                    const isSelected =
                                        selectedLog?.id === log.id;

                                    return (
                                        <motion.button
                                            key={log.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            onClick={() => selectLog(log)}
                                            className={[
                                                "w-full p-4 text-left transition-colors",
                                                isSelected
                                                    ? "bg-primary/10"
                                                    : "hover:bg-secondary/40",
                                            ].join(" ")}
                                        >
                                            <div className="flex gap-3">
                                                <div
                                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${getActivityContainerClass(
                                                        log.status
                                                    )}`}
                                                >
                                                    {getActivityIcon(log.type)}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <p className="truncate font-semibold">
                                                                {log.title}
                                                            </p>

                                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                                {log.description || "No description"}
                                                            </p>

                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                {getContactDisplayName(log)}
                                                            </p>
                                                        </div>

                                                        <span className="shrink-0 text-xs text-muted-foreground">
                                                            {formatTime(
                                                                log.created_at
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                                        <span
                                                            className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] capitalize ${getStatusClass(
                                                                log.status
                                                            )}`}
                                                        >
                                                            {getStatusIcon(
                                                                log.status
                                                            )}
                                                            {log.status}
                                                        </span>

                                                        <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                                                            {formatLabel(
                                                                log.type
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                                <img
                                    src="/icon.png"
                                    alt="Icono"
                                    className="w-11 h-11 object-contain"
                                />
                                <p className="font-medium">No activity found</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Try changing your filters or search term.
                                </p>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="flex min-h-0 flex-col overflow-hidden border-border/50 bg-card/60">
                    {selectedLog ? (
                        <div className="flex h-full flex-col">
                            <div className="border-b border-border/50 p-5">
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${getActivityContainerClass(
                                            selectedLog.status
                                        )}`}
                                    >
                                        {getActivityIcon(selectedLog.type)}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-xl font-semibold">
                                                {selectedLog.title}
                                            </h2>

                                            <span
                                                className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs capitalize ${getStatusClass(
                                                    selectedLog.status
                                                )}`}
                                            >
                                                {getStatusIcon(
                                                    selectedLog.status
                                                )}
                                                {selectedLog.status}
                                            </span>
                                        </div>

                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {selectedLog.description ||
                                                "No description available."}
                                        </p>

                                        <p className="mt-3 text-xs text-muted-foreground">
                                            {new Intl.DateTimeFormat("en-US", {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            }).format(
                                                new Date(selectedLog.created_at)
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5">
                                <div className="mb-5 grid gap-4 md:grid-cols-2">
                                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Activity Type
                                        </p>
                                        <p className="mt-1 font-medium">
                                            {formatLabel(selectedLog.type)}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Status
                                        </p>
                                        <p className="mt-1 font-medium capitalize">
                                            {selectedLog.status}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                            <p className="text-xs text-muted-foreground">Conversation</p>

                                            <p className="mt-2 text-sm font-semibold">
                                                {selectedLog.conversation
                                                    ? getConversationDescription(selectedLog)
                                                    : "No conversation linked"}
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
                                                </Button>
                                            )}
                                        </div>

                                        <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                            <p className="text-xs text-muted-foreground">Contact</p>

                                            <p className="mt-2 text-sm font-semibold">
                                                {getContactDisplayName(selectedLog)}
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
                                </div>

                                <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
                                    <details className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <summary className="cursor-pointer text-sm font-semibold">
                                            Technical Details
                                        </summary>

                                        <span className="text-xs text-muted-foreground">
                                            JSON
                                        </span>

                                        <pre className="mt-4 max-h-[260px] overflow-auto rounded-lg bg-black/30 p-4 text-xs text-muted-foreground custom-scrollbar">
                                            {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                                        </pre>
                                    </details>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                                <img
                                    src="/icon.png"
                                    alt="Icono"
                                    className="w-9 h-9 object-contain"
                                />
                            </div>

                            <h2 className="text-xl font-semibold">
                                Select an AI activity
                            </h2>

                            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                                Choose an activity from the left to inspect AI
                                actions, metadata, status and linked records.
                            </p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default ActivityPage;