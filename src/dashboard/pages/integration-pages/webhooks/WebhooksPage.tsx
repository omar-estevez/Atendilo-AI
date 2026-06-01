import { useEffect, useMemo, useState } from "react";
import {
    Copy,
    Globe2,
    Link2,
    PauseCircle,
    PlayCircle,
    Plus,
    RefreshCw,
    Send,
    Trash2,
    Webhook,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWebhooksStore } from "@/store/dashboard/webhooksStore";
import { useAuthStore } from "@/store/authStore";
import type {
    Webhook as WebhookType,
} from "@/services/dashboard/webhooksService";
import NewWebhookModal from "./new-webhook/NewWebhookModal";
import { formatTimeAgo, getStatusClass, getStatusIcon } from "./helpers/WebhookHelpers";

export const WebhooksPage = () => {
    const {
        webhooks,
        selectedWebhook,
        isLoading,
        error,
        loadWebhooks,
        updateWebhookStatus,
        deleteWebhook,
        testWebhook,
        selectWebhook,
    } = useWebhooksStore();

    const [isNewWebhookOpen, setIsNewWebhookOpen] = useState(false);
    const [copiedValue, setCopiedValue] = useState<string | null>(null);

    const hasPermission = useAuthStore((state) => state.hasPermission);
    const canManageWebhooks = hasPermission("webhooks.manage");

    useEffect(() => {
        loadWebhooks();
    }, [loadWebhooks]);

    const stats = useMemo(() => {
        return {
            total: webhooks.length,
            active: webhooks.filter((item) => item.status === "active").length,
            paused: webhooks.filter((item) => item.status === "paused").length,
            failed: webhooks.filter((item) => item.status === "failed").length,
        };
    }, [webhooks]);

    const handleCopy = async (value: string) => {
        await navigator.clipboard.writeText(value);
        setCopiedValue(value);

        window.setTimeout(() => {
            setCopiedValue(null);
        }, 1500);
    };

    const handleTest = async (webhook: WebhookType) => {
        if (!canManageWebhooks) return;

        await testWebhook(webhook);
    };

    const handleUpdateStatus = async (
        webhook: WebhookType,
        status: WebhookType["status"]
    ) => {
        if (!canManageWebhooks) return;

        await updateWebhookStatus(webhook, status);
    };

    const handleDelete = async (webhook: WebhookType) => {
        if (!canManageWebhooks) return;

        await deleteWebhook(webhook);
    };

    return (
        <div className="h-full px-5 py-6 sm:px-7 lg:px-8">
            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Webhooks
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Send Lumora events to external apps, CRMs, automations and backend services.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={loadWebhooks}
                        disabled={isLoading}
                    >
                        <RefreshCw
                            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""
                                }`}
                        />
                        Refresh
                    </Button>

                    {canManageWebhooks && (
                        <Button
                            className="bg-primary hover:bg-primary/90"
                            onClick={() => setIsNewWebhookOpen(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            New Webhook
                        </Button>
                    )}
                </div>
            </div>

            {!canManageWebhooks && (
                <Card className="mb-4 border-border/50 bg-muted/10 p-4">
                    <p className="text-sm text-muted-foreground">
                        View-only access. Only owners and admins can create, test, activate, pause or delete webhooks.
                    </p>
                </Card>
            )}

            {error && (
                <Card className="mb-4 border-red-500/30 bg-red-500/10 p-4">
                    <p className="text-sm text-red-400">{error}</p>
                </Card>
            )}

            <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">
                        Total Webhooks
                    </p>
                    <h3 className="mt-2 text-3xl font-bold">{stats.total}</h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Active</p>
                    <h3 className="mt-2 text-3xl font-bold text-emerald-400">
                        {stats.active}
                    </h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Paused</p>
                    <h3 className="mt-2 text-3xl font-bold text-amber-400">
                        {stats.paused}
                    </h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Failed</p>
                    <h3 className="mt-2 text-3xl font-bold text-red-400">
                        {stats.failed}
                    </h3>
                </Card>
            </div>

            <div className="grid h-[calc(100vh-300px)] min-h-[640px] grid-cols-1 gap-5 xl:grid-cols-[520px_1fr]">
                <Card className="flex min-h-0 flex-col overflow-hidden border-border/50 bg-card/60">
                    <div className="border-b border-border/50 bg-background/30 p-5">
                        <div className="flex items-center gap-2">
                            <Webhook className="h-5 w-5 text-primary" />
                            <h2 className="font-semibold">Endpoints</h2>
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Configured webhook destinations.
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex h-full items-center justify-center">
                                <p className="text-sm text-muted-foreground">
                                    Loading webhooks...
                                </p>
                            </div>
                        ) : webhooks.length > 0 ? (
                            <div className="divide-y divide-border/50">
                                {webhooks.map((webhook) => {
                                    const isSelected =
                                        selectedWebhook?.id === webhook.id;

                                    return (
                                        <button
                                            key={webhook.id}
                                            onClick={() =>
                                                selectWebhook(webhook)
                                            }
                                            className={[
                                                "w-full p-4 text-left transition-colors",
                                                isSelected
                                                    ? "bg-primary/10"
                                                    : "hover:bg-secondary/40",
                                            ].join(" ")}
                                        >
                                            <div className="flex gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                                                    <Webhook className="h-5 w-5 text-primary" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <p className="truncate font-semibold">
                                                                {webhook.name}
                                                            </p>

                                                            <p className="mt-1 truncate text-xs text-muted-foreground">
                                                                {webhook.endpoint_url}
                                                            </p>
                                                        </div>

                                                        <span className="shrink-0 text-xs text-muted-foreground">
                                                            {formatTimeAgo(
                                                                webhook.last_triggered_at
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                                        <span
                                                            className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] capitalize ${getStatusClass(
                                                                webhook.status
                                                            )}`}
                                                        >
                                                            {getStatusIcon(
                                                                webhook.status
                                                            )}
                                                            {webhook.status}
                                                        </span>

                                                        <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                                                            {webhook.events.length} events
                                                        </span>

                                                        {webhook.failure_count > 0 && (
                                                            <span className="rounded-full border border-red-500/25 bg-red-500/10 px-2 py-0.5 text-[11px] text-red-400">
                                                                {webhook.failure_count} failures
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                                <Webhook className="mb-3 h-10 w-10 text-muted-foreground" />
                                <p className="font-medium">
                                    No webhooks yet
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Create your first webhook endpoint to send Lumora events externally.
                                </p>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="flex min-h-0 flex-col overflow-hidden border-border/50 bg-card/60">
                    {selectedWebhook ? (
                        <div className="flex h-full flex-col">
                            <div className="border-b border-border/50 p-5">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/20">
                                            <Webhook className="h-7 w-7 text-primary" />
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="text-xl font-semibold">
                                                    {selectedWebhook.name}
                                                </h2>

                                                <span
                                                    className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs capitalize ${getStatusClass(
                                                        selectedWebhook.status
                                                    )}`}
                                                >
                                                    {getStatusIcon(
                                                        selectedWebhook.status
                                                    )}
                                                    {selectedWebhook.status}
                                                </span>
                                            </div>

                                            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                                                Sends selected events to your external endpoint.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5">
                                <div className="mb-5 grid gap-4 md:grid-cols-3">
                                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Last Triggered
                                        </p>
                                        <p className="mt-1 font-medium">
                                            {formatTimeAgo(
                                                selectedWebhook.last_triggered_at
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Events
                                        </p>
                                        <p className="mt-1 font-medium">
                                            {selectedWebhook.events.length}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Failures
                                        </p>
                                        <p className="mt-1 font-medium">
                                            {selectedWebhook.failure_count}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-5 rounded-2xl border border-border/60 bg-background/40 p-4">
                                    <div className="mb-2 flex items-center gap-2">
                                        <Link2 className="h-4 w-4 text-primary" />
                                        <h3 className="font-semibold">
                                            Endpoint URL
                                        </h3>
                                    </div>

                                    <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card/60 p-3 lg:flex-row lg:items-center lg:justify-between">
                                        <p className="break-all font-mono text-sm text-muted-foreground">
                                            {selectedWebhook.endpoint_url}
                                        </p>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handleCopy(
                                                    selectedWebhook.endpoint_url
                                                )
                                            }
                                        >
                                            <Copy className="mr-2 h-4 w-4" />
                                            {copiedValue ===
                                                selectedWebhook.endpoint_url
                                                ? "Copied"
                                                : "Copy"}
                                        </Button>
                                    </div>
                                </div>

                                <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/10 p-4">
                                    <h3 className="font-semibold text-primary">
                                        Subscribed Events
                                    </h3>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {selectedWebhook.events.map((eventName) => (
                                            <span
                                                key={eventName}
                                                className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs text-primary"
                                            >
                                                {eventName}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {selectedWebhook.secret && (
                                    <div className="mb-5 rounded-2xl border border-border/60 bg-background/40 p-4">
                                        <h3 className="font-semibold">
                                            Webhook Secret
                                        </h3>

                                        <div className="mt-3 flex flex-col gap-2 rounded-xl border border-border/60 bg-card/60 p-3 lg:flex-row lg:items-center lg:justify-between">
                                            <p className="break-all font-mono text-sm text-muted-foreground">
                                                {selectedWebhook.secret}
                                            </p>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleCopy(
                                                        selectedWebhook.secret ||
                                                        ""
                                                    )
                                                }
                                            >
                                                <Copy className="mr-2 h-4 w-4" />
                                                {copiedValue ===
                                                    selectedWebhook.secret
                                                    ? "Copied"
                                                    : "Copy"}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                <div className="mb-5 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
                                    <p className="font-semibold text-amber-400">
                                        MVP Mode
                                    </p>

                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Test webhook currently simulates delivery by updating the last triggered timestamp. Later, the backend will send a signed POST request.
                                    </p>
                                </div>

                                {canManageWebhooks && (
                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            onClick={() =>
                                                handleTest(selectedWebhook)
                                            }
                                        >
                                            <Send className="mr-2 h-4 w-4" />
                                            Test Webhook
                                        </Button>

                                        {selectedWebhook.status !== "active" && (
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    handleUpdateStatus(
                                                        selectedWebhook,
                                                        "active"
                                                    )
                                                }
                                            >
                                                <PlayCircle className="mr-2 h-4 w-4" />
                                                Activate
                                            </Button>
                                        )}

                                        {selectedWebhook.status === "active" && (
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    handleUpdateStatus(
                                                        selectedWebhook,
                                                        "paused"
                                                    )
                                                }
                                            >
                                                <PauseCircle className="mr-2 h-4 w-4" />
                                                Pause
                                            </Button>
                                        )}

                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                handleDelete(selectedWebhook)
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
                        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                                <Globe2 className="h-7 w-7 text-primary" />
                            </div>

                            <h2 className="text-xl font-semibold">
                                Select a webhook
                            </h2>

                            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                                Choose an endpoint to inspect events, secret, status and delivery information.
                            </p>
                        </div>
                    )}
                </Card>
            </div>

            {canManageWebhooks && isNewWebhookOpen && (
                <NewWebhookModal
                    open={isNewWebhookOpen}
                    onClose={() => setIsNewWebhookOpen(false)}
                />
            )}
        </div>
    );
};

export default WebhooksPage;