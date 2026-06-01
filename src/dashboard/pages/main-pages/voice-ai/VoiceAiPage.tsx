import { useEffect, useMemo, useState } from "react";
import {
    Bot,
    CheckCircle2,
    Clock,
    FileText,
    Phone,
    PhoneCall,
    PhoneMissed,
    Play,
    RefreshCw,
    ThumbsUp,
    Trash2,
    Volume2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useVoiceAIStore } from "@/store/dashboard/voiceAiStore";
import { useAuthStore } from "@/store/authStore";
import type {
    VoiceCall,
    VoiceCallStatus,
} from "@/services/dashboard/voiceAiService";
import {
    formatDuration,
    formatTimeAgo,
    getSentimentIcon,
    getStatusClass,
    getStatusIcon,
} from "./helpers/VoiceAiHelpers";

export const VoiceAIPage = () => {
    const {
        calls,
        selectedCall,
        isLoading,
        error,
        loadCalls,
        updateCallStatus,
        deleteCall,
        selectCall,
    } = useVoiceAIStore();

    const hasPermission = useAuthStore((state) => state.hasPermission);

    const canManageVoiceAI = hasPermission("voice_ai.manage");

    const [statusFilter, setStatusFilter] =
        useState<VoiceCallStatus | "all">("all");

    useEffect(() => {
        loadCalls();
    }, [loadCalls]);

    const filteredCalls = useMemo(() => {
        if (statusFilter === "all") return calls;

        return calls.filter((call) => call.status === statusFilter);
    }, [calls, statusFilter]);

    const stats = useMemo(() => {
        const completed = calls.filter((call) => call.status === "completed");
        const missed = calls.filter((call) => call.status === "missed");
        const failed = calls.filter((call) => call.status === "failed");

        const totalDuration = completed.reduce(
            (total, call) => total + call.duration_seconds,
            0
        );

        const avgDuration = completed.length
            ? Math.round(totalDuration / completed.length)
            : 0;

        const resolutionRate = calls.length
            ? Math.round((completed.length / calls.length) * 100)
            : 0;

        return {
            activeCalls: 0,
            today: calls.length,
            resolutionRate,
            answered: completed.length,
            missed: missed.length,
            failed: failed.length,
            avgDuration,
            satisfaction: 94,
        };
    }, [calls]);

    const handleUpdateStatus = async (
        call: VoiceCall,
        status: VoiceCallStatus
    ) => {
        if (!canManageVoiceAI) return;

        await updateCallStatus(call, status);
    };

    const handleDelete = async (call: VoiceCall) => {
        if (!canManageVoiceAI) return;

        await deleteCall(call);
    };

    return (
        <div className="h-full px-5 py-6 sm:px-7 lg:px-8">
            <Card className="mb-5 overflow-hidden border-primary/30 bg-gradient-to-r from-primary/15 via-card to-cyan-500/10">
                <div className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20">
                            <Volume2 className="h-8 w-8 text-primary" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Voice AI
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Advanced AI voice assistant
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-xl bg-background/60 px-5 py-3 text-center">
                            <p className="text-2xl font-bold text-emerald-400">
                                {stats.activeCalls}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Active Calls
                            </p>
                        </div>

                        <div className="rounded-xl bg-background/60 px-5 py-3 text-center">
                            <p className="text-2xl font-bold">
                                {stats.today}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Today
                            </p>
                        </div>

                        <div className="rounded-xl bg-background/60 px-5 py-3 text-center">
                            <p className="text-2xl font-bold text-primary">
                                {stats.resolutionRate}%
                            </p>
                            <p className="text-xs text-muted-foreground">
                                AI Resolution
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {error && (
                <Card className="mb-4 border-red-500/30 bg-red-500/10 p-4">
                    <p className="text-sm text-red-400">{error}</p>
                </Card>
            )}

            {!canManageVoiceAI && (
                <Card className="mb-4 border-border/50 bg-muted/10 p-4">
                    <p className="text-sm text-muted-foreground">
                        View-only access. You can inspect Voice AI calls, but you cannot update status or delete call records.
                    </p>
                </Card>
            )}

            <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="border-emerald-500/20 bg-emerald-500/5 p-5">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15">
                        <PhoneCall className="h-5 w-5 text-emerald-400" />
                    </div>
                    <p className="text-sm text-muted-foreground">Answered</p>
                    <h3 className="mt-2 text-3xl font-bold text-emerald-400">
                        {stats.answered}
                    </h3>
                </Card>

                <Card className="border-red-500/20 bg-red-500/5 p-5">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15">
                        <PhoneMissed className="h-5 w-5 text-red-400" />
                    </div>
                    <p className="text-sm text-muted-foreground">Missed</p>
                    <h3 className="mt-2 text-3xl font-bold text-red-400">
                        {stats.missed}
                    </h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-5">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15">
                        <Clock className="h-5 w-5 text-blue-400" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Avg. Duration
                    </p>
                    <h3 className="mt-2 text-3xl font-bold">
                        {formatDuration(stats.avgDuration)}
                    </h3>
                </Card>

                <Card className="border-purple-500/20 bg-purple-500/5 p-5">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15">
                        <ThumbsUp className="h-5 w-5 text-purple-400" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Satisfaction
                    </p>
                    <h3 className="mt-2 text-3xl font-bold text-purple-400">
                        {stats.satisfaction}%
                    </h3>
                </Card>
            </div>

            <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
                <Card className="overflow-hidden border-border/50 bg-card/60">
                    <div className="border-b border-border/50 bg-background/30 p-5">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <h2 className="font-semibold">AI Call Log</h2>

                            <div className="flex flex-wrap items-center gap-2">
                                {(["all", "completed", "missed", "failed"] as const).map(
                                    (status) => (
                                        <button
                                            key={status}
                                            onClick={() =>
                                                setStatusFilter(status)
                                            }
                                            className={[
                                                "rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                                                statusFilter === status
                                                    ? "border-primary bg-primary/15 text-primary"
                                                    : "border-border bg-background text-muted-foreground hover:text-foreground",
                                            ].join(" ")}
                                        >
                                            {status}
                                        </button>
                                    )
                                )}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={loadCalls}
                                    disabled={isLoading}
                                >
                                    <RefreshCw
                                        className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""
                                            }`}
                                    />
                                    Refresh
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="divide-y divide-border/50">
                        {isLoading ? (
                            <div className="flex min-h-[360px] items-center justify-center">
                                <p className="text-sm text-muted-foreground">
                                    Loading Voice AI calls...
                                </p>
                            </div>
                        ) : filteredCalls.length > 0 ? (
                            filteredCalls.map((call) => {
                                const isSelected =
                                    selectedCall?.id === call.id;

                                return (
                                    <button
                                        key={call.id}
                                        onClick={() => selectCall(call)}
                                        className={[
                                            "w-full p-4 text-left transition-colors",
                                            isSelected
                                                ? "bg-primary/10"
                                                : "hover:bg-secondary/40",
                                        ].join(" ")}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                                {getStatusIcon(call.status)}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="font-semibold">
                                                            {call.customer_name}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {call.phone || "No phone"}
                                                        </p>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="font-semibold">
                                                            {formatDuration(
                                                                call.duration_seconds
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatTimeAgo(
                                                                call.started_at
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                                    {call.sentiment &&
                                                        getSentimentIcon(
                                                            call.sentiment
                                                        )}

                                                    <span
                                                        className={`rounded-full border px-2.5 py-1 text-xs capitalize ${getStatusClass(
                                                            call.status
                                                        )}`}
                                                    >
                                                        {call.status}
                                                    </span>

                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    <Play className="h-4 w-4 text-muted-foreground" />
                                                </div>

                                                {call.ai_summary && (
                                                    <div className="mt-3 rounded-xl border border-primary/10 bg-primary/5 p-3">
                                                        <p className="text-xs font-medium text-primary">
                                                            AI Summary
                                                        </p>
                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                            {call.ai_summary}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
                                <Phone className="mb-3 h-10 w-10 text-muted-foreground" />
                                <p className="font-medium">
                                    No voice calls found
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    AI call logs will appear here once your voice channel receives calls.
                                </p>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="border-border/50 bg-card/60">
                    {selectedCall ? (
                        <div>
                            <div className="border-b border-border/50 p-5">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20">
                                        {getStatusIcon(selectedCall.status)}
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-semibold">
                                            {selectedCall.customer_name}
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedCall.phone || "No phone"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5 p-5">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Status
                                        </p>
                                        <p className="mt-1 capitalize">
                                            {selectedCall.status}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Duration
                                        </p>
                                        <p className="mt-1">
                                            {formatDuration(
                                                selectedCall.duration_seconds
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {selectedCall.ai_summary && (
                                    <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
                                        <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                                            <Bot className="h-4 w-4" />
                                            AI Summary
                                        </p>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {selectedCall.ai_summary}
                                        </p>
                                    </div>
                                )}

                                <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
                                    <p className="font-semibold">Transcript</p>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {selectedCall.transcript ||
                                            "No transcript available."}
                                    </p>
                                </div>

                                {canManageVoiceAI && (
                                    <div className="flex flex-wrap gap-3">
                                        {selectedCall.status !== "completed" && (
                                            <Button
                                                onClick={() =>
                                                    handleUpdateStatus(
                                                        selectedCall,
                                                        "completed"
                                                    )
                                                }
                                            >
                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                Mark Completed
                                            </Button>
                                        )}

                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                handleUpdateStatus(
                                                    selectedCall,
                                                    "missed"
                                                )
                                            }
                                        >
                                            Mark Missed
                                        </Button>

                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                handleDelete(selectedCall)
                                            }
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex min-h-[520px] flex-col items-center justify-center p-8 text-center">
                            <Phone className="mb-3 h-10 w-10 text-muted-foreground" />
                            <p className="font-medium">Select a call</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Choose a call from the log to inspect AI summary, transcript and status.
                            </p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default VoiceAIPage;