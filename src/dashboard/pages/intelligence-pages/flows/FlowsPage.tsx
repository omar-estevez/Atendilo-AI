import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    // Activity,
    // CheckCircle2,
    GitBranch,
    MoreVertical,
    PauseCircle,
    PlayCircle,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    Workflow,
    XCircle,
    Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAIFlowsStore } from "@/store/dashboard/aiFlowsStore";
import { useAuthStore } from "@/store/authStore";
import type { AIFlow, AIFlowStatus } from "@/services/dashboard/aiFlowsService";
import { formatTime, getStatusClass, getStatusIcon, getConversionClass, formatLabel } from "./helpers/FlowsHelpers";
import NewFlowModal from "./new-flow/NewFlowModal";



export const FlowsPage = () => {
    const {
        flows,
        selectedFlow,
        isLoading,
        error,
        loadFlows,
        updateFlowStatus,
        deleteFlow,
        selectFlow,
    } = useAIFlowsStore();

    const hasPermission = useAuthStore((state) => state.hasPermission);

    const canCreateFlow = hasPermission("ai_flows.create");
    const canEditFlow = hasPermission("ai_flows.edit");
    const canDeleteFlow = hasPermission("ai_flows.delete");
    const canManageFlow = canEditFlow || canDeleteFlow;

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<AIFlowStatus | "all">("all");
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [isNewFlowOpen, setIsNewFlowOpen] = useState(false);

    useEffect(() => {
        loadFlows();
    }, [loadFlows]);

    const filteredFlows = useMemo(() => {
        const search = searchTerm.toLowerCase();

        return flows.filter((flow) => {
            const matchesSearch =
                flow.name.toLowerCase().includes(search) ||
                (flow.description || "").toLowerCase().includes(search) ||
                flow.trigger_type.toLowerCase().includes(search);

            const matchesStatus =
                statusFilter === "all" || flow.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [flows, searchTerm, statusFilter]);

    const stats = useMemo(() => {
        return {
            total: flows.length,
            active: flows.filter((flow) => flow.status === "active").length,
            draft: flows.filter((flow) => flow.status === "draft").length,
            paused: flows.filter((flow) => flow.status === "paused").length,
            runs: flows.reduce((total, flow) => total + flow.runs_count, 0),
        };
    }, [flows]);

    const handleUpdateStatus = async (flow: AIFlow, status: AIFlowStatus) => {
        if (!canEditFlow) return;

        await updateFlowStatus(flow, status);
        setOpenMenuId(null);
    };

    const handleDelete = async (flow: AIFlow) => {
        if (!canDeleteFlow) return;

        await deleteFlow(flow);
        setOpenMenuId(null);
    };

    return (
        <div className="h-full px-5 py-6 sm:px-7 lg:px-8">
            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        AI Flows
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage AI workflows that automate lead capture,
                        bookings, follow-ups and customer conversations.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={loadFlows}
                        disabled={isLoading}
                    >
                        <RefreshCw
                            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""
                                }`}
                        />
                        Refresh
                    </Button>

                    {canCreateFlow && (
                        <Button
                            className="bg-primary hover:bg-primary/90"
                            onClick={() => setIsNewFlowOpen(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            New Flow
                        </Button>
                    )}
                </div>
            </div>

            {error && (
                <Card className="mb-4 border-red-500/30 bg-red-500/10 p-4">
                    <p className="text-sm text-red-400">{error}</p>
                </Card>
            )}

            <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Total Flows</p>
                    <h3 className="mt-2 text-3xl font-bold">{stats.total}</h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Active</p>
                    <h3 className="mt-2 text-3xl font-bold text-emerald-400">
                        {stats.active}
                    </h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Drafts</p>
                    <h3 className="mt-2 text-3xl font-bold text-amber-400">
                        {stats.draft}
                    </h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Paused</p>
                    <h3 className="mt-2 text-3xl font-bold text-blue-400">
                        {stats.paused}
                    </h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Total Runs</p>
                    <h3 className="mt-2 text-3xl font-bold text-primary">
                        {stats.runs.toLocaleString()}
                    </h3>
                </Card>
            </div>

            <div className="grid h-[calc(100vh-300px)] min-h-[640px] grid-cols-1 gap-5 xl:grid-cols-[520px_1fr]">
                <Card className="flex min-h-0 flex-col overflow-hidden border-border/50 bg-card/60">
                    <div className="border-b border-border/50 bg-background/30 p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                                placeholder="Search AI flows..."
                                className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                            />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                            {(
                                [
                                    "all",
                                    "active",
                                    "draft",
                                    "paused",
                                    "archived",
                                ] as const
                            ).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={[
                                        "rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors",
                                        statusFilter === status
                                            ? "border-primary bg-primary/15 text-primary"
                                            : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground",
                                    ].join(" ")}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex h-full items-center justify-center">
                                <p className="text-sm text-muted-foreground">
                                    Loading AI flows...
                                </p>
                            </div>
                        ) : filteredFlows.length > 0 ? (
                            <div className="divide-y divide-border/50">
                                {filteredFlows.map((flow, index) => {
                                    const isSelected =
                                        selectedFlow?.id === flow.id;

                                    return (
                                        <motion.button
                                            key={flow.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            onClick={() => selectFlow(flow)}
                                            className={[
                                                "w-full p-4 text-left transition-colors",
                                                isSelected
                                                    ? "bg-primary/10"
                                                    : "hover:bg-secondary/40",
                                            ].join(" ")}
                                        >
                                            <div className="flex gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                                                    <GitBranch className="h-5 w-5 text-primary" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <p className="truncate font-semibold">
                                                                {flow.name}
                                                            </p>

                                                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                                {flow.description ||
                                                                    "No description"}
                                                            </p>
                                                        </div>

                                                        <span className="shrink-0 text-xs text-muted-foreground">
                                                            {formatTime(
                                                                flow.last_run_at
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                                                        <span
                                                            className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] capitalize ${getStatusClass(
                                                                flow.status
                                                            )}`}
                                                        >
                                                            {getStatusIcon(
                                                                flow.status
                                                            )}
                                                            {flow.status}
                                                        </span>

                                                        <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                                                            {flow.nodes_count} nodes
                                                        </span>

                                                        <span className="rounded-full border border-blue-500/25 bg-blue-500/10 px-2 py-0.5 text-[11px] text-blue-400">
                                                            {flow.runs_count.toLocaleString()} runs
                                                        </span>

                                                        <span
                                                            className={`rounded-full border border-border/60 bg-background/40 px-2 py-0.5 text-[11px] ${getConversionClass(
                                                                Number(
                                                                    flow.conversion_rate
                                                                )
                                                            )}`}
                                                        >
                                                            {Number(
                                                                flow.conversion_rate
                                                            )}
                                                            % conversion
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
                                <Workflow className="mb-3 h-10 w-10 text-muted-foreground" />
                                <p className="font-medium">No AI flows found</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Create your first AI flow to automate customer
                                    communication.
                                </p>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="flex min-h-0 flex-col overflow-hidden border-border/50 bg-card/60">
                    {selectedFlow ? (
                        <div className="flex h-full flex-col">
                            <div className="border-b border-border/50 p-5">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/20">
                                            <GitBranch className="h-7 w-7 text-primary" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="text-xl font-semibold">
                                                    {selectedFlow.name}
                                                </h2>

                                                <span
                                                    className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs capitalize ${getStatusClass(
                                                        selectedFlow.status
                                                    )}`}
                                                >
                                                    {getStatusIcon(
                                                        selectedFlow.status
                                                    )}
                                                    {selectedFlow.status}
                                                </span>
                                            </div>

                                            <p className="mt-2 text-sm text-muted-foreground">
                                                {selectedFlow.description ||
                                                    "No description available."}
                                            </p>
                                        </div>
                                    </div>

                                    {canManageFlow && (
                                        <div className="relative">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setOpenMenuId(
                                                        openMenuId ===
                                                            selectedFlow.id
                                                            ? null
                                                            : selectedFlow.id
                                                    )
                                                }
                                            >
                                                <MoreVertical className="mr-2 h-4 w-4" />
                                                Actions
                                            </Button>

                                            {openMenuId === selectedFlow.id && (
                                                <div className="absolute right-0 top-10 z-50 w-52 overflow-hidden rounded-xl border border-border/60 bg-background shadow-xl">
                                                    {canEditFlow && (
                                                        <>
                                                            <button
                                                                onClick={() =>
                                                                    handleUpdateStatus(
                                                                        selectedFlow,
                                                                        "active"
                                                                    )
                                                                }
                                                                className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-secondary/60"
                                                            >
                                                                <PlayCircle className="h-4 w-4 text-emerald-400" />
                                                                Activate
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    handleUpdateStatus(
                                                                        selectedFlow,
                                                                        "paused"
                                                                    )
                                                                }
                                                                className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-secondary/60"
                                                            >
                                                                <PauseCircle className="h-4 w-4 text-blue-400" />
                                                                Pause
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    handleUpdateStatus(
                                                                        selectedFlow,
                                                                        "archived"
                                                                    )
                                                                }
                                                                className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-secondary/60"
                                                            >
                                                                <XCircle className="h-4 w-4 text-red-400" />
                                                                Archive
                                                            </button>
                                                        </>
                                                    )}

                                                    {canDeleteFlow && (
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    selectedFlow
                                                                )
                                                            }
                                                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Delete Flow
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5">
                                <div className="mb-5 grid gap-4 md:grid-cols-4">
                                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Nodes
                                        </p>
                                        <p className="mt-1 text-2xl font-bold">
                                            {selectedFlow.nodes_count}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Runs
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-primary">
                                            {selectedFlow.runs_count.toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Conversion
                                        </p>
                                        <p
                                            className={`mt-1 text-2xl font-bold ${getConversionClass(
                                                Number(
                                                    selectedFlow.conversion_rate
                                                )
                                            )}`}
                                        >
                                            {Number(selectedFlow.conversion_rate)}%
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Last Run
                                        </p>
                                        <p className="mt-1 font-medium">
                                            {formatTime(selectedFlow.last_run_at)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/10 p-4">
                                    <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                                        <img
                                            src="/icon.png"
                                            alt="Icono"
                                            className="w-5 h-5 object-contain"
                                        />
                                        Flow Intelligence
                                    </p>

                                    <p className="mt-2 text-sm text-muted-foreground">
                                        This flow is triggered by{" "}
                                        <span className="font-medium text-foreground">
                                            {formatLabel(
                                                selectedFlow.trigger_type
                                            )}
                                        </span>
                                        . Later, Atendilo will use this workflow to
                                        automate messages, booking logic, lead
                                        scoring, and follow-up actions.
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-border/60 bg-background/40 p-5">
                                    <div className="mb-4 flex items-center gap-2">
                                        <Workflow className="h-5 w-5 text-primary" />
                                        <h3 className="font-semibold">
                                            Flow Preview
                                        </h3>
                                    </div>

                                    <div className="grid gap-3">
                                        {[
                                            "Trigger detected",
                                            "AI analyzes intent",
                                            "Customer response generated",
                                            "Action or follow-up scheduled",
                                        ].map((step, index) => (
                                            <div
                                                key={step}
                                                className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 p-3"
                                            >
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-xs font-bold text-primary">
                                                    {index + 1}
                                                </div>

                                                <p className="text-sm font-medium">
                                                    {step}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {canEditFlow && (
                                    <div className="mt-5 flex flex-wrap gap-3">
                                        <Button>
                                            <Zap className="mr-2 h-4 w-4" />
                                            Run Test
                                        </Button>

                                        <Button variant="outline">
                                            Edit Flow
                                        </Button>

                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                handleUpdateStatus(
                                                    selectedFlow,
                                                    selectedFlow.status === "active"
                                                        ? "paused"
                                                        : "active"
                                                )
                                            }
                                        >
                                            {selectedFlow.status === "active"
                                                ? "Pause Flow"
                                                : "Activate Flow"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                                <Workflow className="h-7 w-7 text-primary" />
                            </div>

                            <h2 className="text-xl font-semibold">
                                Select an AI flow
                            </h2>

                            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                                Choose a flow from the left to inspect triggers,
                                nodes, runs, conversion rate and workflow preview.
                            </p>
                        </div>
                    )}
                </Card>
            </div>

            {canCreateFlow && isNewFlowOpen && (
                <NewFlowModal
                    open={isNewFlowOpen}
                    onClose={() => setIsNewFlowOpen(false)}
                />
            )}
        </div>
    );
};

export default FlowsPage;