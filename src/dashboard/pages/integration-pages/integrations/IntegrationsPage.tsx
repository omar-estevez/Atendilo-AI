import { useEffect, useMemo, useState } from "react";
import {
    Link2,
    Plug,
    Plus,
    RefreshCw,
    Settings2,
    Trash2,
    Unplug,
    Webhook,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useIntegrationsStore } from "@/store/dashboard/integrationsStore";
import { useAuthStore } from "@/store/authStore";
import type {
    Integration,
} from "@/services/dashboard/integrationsService";
import NewIntegrationModal from "./new-integration/NewIntegrationModal";
import { formatLabel, formatTimeAgo, getProviderIcon, getStatusClass, getStatusIcon } from "./helpers/IntegrationHelpers";

export const IntegrationsPage = () => {
    const {
        integrations,
        selectedIntegration,
        isLoading,
        error,
        loadIntegrations,
        connectIntegration,
        disconnectIntegration,
        syncIntegration,
        deleteIntegration,
        selectIntegration,
    } = useIntegrationsStore();

    const [isNewIntegrationOpen, setIsNewIntegrationOpen] = useState(false);

    const hasPermission = useAuthStore((state) => state.hasPermission);
    const canManageIntegrations = hasPermission("integrations.manage");

    useEffect(() => {
        loadIntegrations();
    }, [loadIntegrations]);

    const stats = useMemo(() => {
        return {
            total: integrations.length,
            connected: integrations.filter(
                (item) => item.status === "connected"
            ).length,
            disconnected: integrations.filter(
                (item) => item.status === "disconnected"
            ).length,
            error: integrations.filter((item) => item.status === "error")
                .length,
        };
    }, [integrations]);

    const handleConnect = async (integration: Integration) => {
        if (!canManageIntegrations) return;

        await connectIntegration(integration);
    };

    const handleDisconnect = async (integration: Integration) => {
        if (!canManageIntegrations) return;

        await disconnectIntegration(integration);
    };

    const handleSync = async (integration: Integration) => {
        if (!canManageIntegrations) return;

        await syncIntegration(integration);
    };

    const handleDelete = async (integration: Integration) => {
        if (!canManageIntegrations) return;

        await deleteIntegration(integration);
    };

    return (
        <div className="h-full px-5 py-6 sm:px-7 lg:px-8">
            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Integrations
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Connect Atendilo with messaging, payments, calendars and automation platforms.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={loadIntegrations}
                        disabled={isLoading}
                    >
                        <RefreshCw
                            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""
                                }`}
                        />
                        Refresh
                    </Button>

                    {canManageIntegrations && (
                        <Button
                            className="bg-primary hover:bg-primary/90"
                            onClick={() => setIsNewIntegrationOpen(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            New Integration
                        </Button>
                    )}
                </div>
            </div>

            {!canManageIntegrations && (
                <Card className="mb-4 border-border/50 bg-muted/10 p-4">
                    <p className="text-sm text-muted-foreground">
                        View-only access. Only owners and admins can connect, sync or delete integrations.
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
                        Total Integrations
                    </p>
                    <h3 className="mt-2 text-3xl font-bold">{stats.total}</h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Connected</p>
                    <h3 className="mt-2 text-3xl font-bold text-emerald-400">
                        {stats.connected}
                    </h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">
                        Disconnected
                    </p>
                    <h3 className="mt-2 text-3xl font-bold text-amber-400">
                        {stats.disconnected}
                    </h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Errors</p>
                    <h3 className="mt-2 text-3xl font-bold text-red-400">
                        {stats.error}
                    </h3>
                </Card>
            </div>

            <div className="grid h-[calc(100vh-300px)] min-h-[640px] grid-cols-1 gap-5 xl:grid-cols-[520px_1fr]">
                <Card className="flex min-h-0 flex-col overflow-hidden border-border/50 bg-card/60">
                    <div className="border-b border-border/50 bg-background/30 p-5">
                        <div className="flex items-center gap-2">
                            <Plug className="h-5 w-5 text-primary" />
                            <h2 className="font-semibold">Providers</h2>
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                            External systems connected to this workspace.
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex h-full items-center justify-center">
                                <p className="text-sm text-muted-foreground">
                                    Loading integrations...
                                </p>
                            </div>
                        ) : integrations.length > 0 ? (
                            <div className="divide-y divide-border/50">
                                {integrations.map((integration) => {
                                    const isSelected =
                                        selectedIntegration?.id === integration.id;

                                    return (
                                        <button
                                            key={integration.id}
                                            onClick={() =>
                                                selectIntegration(integration)
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
                                                    {getProviderIcon(
                                                        integration.provider
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <p className="truncate font-semibold">
                                                                {integration.name}
                                                            </p>

                                                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                                {integration.description ||
                                                                    formatLabel(
                                                                        integration.provider
                                                                    )}
                                                            </p>
                                                        </div>

                                                        <span className="shrink-0 text-xs text-muted-foreground">
                                                            {formatTimeAgo(
                                                                integration.last_synced_at
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                                        <span
                                                            className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] capitalize ${getStatusClass(
                                                                integration.status
                                                            )}`}
                                                        >
                                                            {getStatusIcon(
                                                                integration.status
                                                            )}
                                                            {integration.status}
                                                        </span>

                                                        <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                                                            {formatLabel(
                                                                integration.provider
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                                <Plug className="mb-3 h-10 w-10 text-muted-foreground" />
                                <p className="font-medium">
                                    No integrations yet
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Add your first integration to connect external tools.
                                </p>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="flex min-h-0 flex-col overflow-hidden border-border/50 bg-card/60">
                    {selectedIntegration ? (
                        <div className="flex h-full flex-col">
                            <div className="border-b border-border/50 p-5">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/20">
                                            {getProviderIcon(
                                                selectedIntegration.provider
                                            )}
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="text-xl font-semibold">
                                                    {selectedIntegration.name}
                                                </h2>

                                                <span
                                                    className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs capitalize ${getStatusClass(
                                                        selectedIntegration.status
                                                    )}`}
                                                >
                                                    {getStatusIcon(
                                                        selectedIntegration.status
                                                    )}
                                                    {selectedIntegration.status}
                                                </span>
                                            </div>

                                            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                                                {selectedIntegration.description ||
                                                    "No description available."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5">
                                <div className="mb-5 grid gap-4 md:grid-cols-3">
                                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Provider
                                        </p>
                                        <p className="mt-1 font-medium">
                                            {formatLabel(
                                                selectedIntegration.provider
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Last Synced
                                        </p>
                                        <p className="mt-1 font-medium">
                                            {formatTimeAgo(
                                                selectedIntegration.last_synced_at
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Config Fields
                                        </p>
                                        <p className="mt-1 font-medium">
                                            {
                                                Object.keys(
                                                    selectedIntegration.config ||
                                                    {}
                                                ).length
                                            }
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/10 p-4">
                                    <div className="mb-2 flex items-center gap-2">
                                        <Settings2 className="h-4 w-4 text-primary" />
                                        <h3 className="font-semibold text-primary">
                                            Configuration
                                        </h3>
                                    </div>

                                    <pre className="overflow-x-auto rounded-xl border border-border/60 bg-background/70 p-4 text-xs text-muted-foreground">
                                        {JSON.stringify(selectedIntegration.config || {}, null, 2)}
                                    </pre>
                                </div>

                                <div className="mb-5 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
                                    <p className="font-semibold text-amber-400">
                                        MVP Mode
                                    </p>

                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Connect and Sync currently update status and timestamp only. Real OAuth, API verification and token storage should happen in backend or Supabase Edge Functions.
                                    </p>
                                </div>

                                {canManageIntegrations && (
                                    <div className="flex flex-wrap gap-3">
                                        {selectedIntegration.status !==
                                            "connected" && (
                                                <Button
                                                    onClick={() =>
                                                        handleConnect(
                                                            selectedIntegration
                                                        )
                                                    }
                                                >
                                                    <Link2 className="mr-2 h-4 w-4" />
                                                    Connect
                                                </Button>
                                            )}

                                        {selectedIntegration.status ===
                                            "connected" && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleDisconnect(
                                                            selectedIntegration
                                                        )
                                                    }
                                                >
                                                    <Unplug className="mr-2 h-4 w-4" />
                                                    Disconnect
                                                </Button>
                                            )}

                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                handleSync(selectedIntegration)
                                            }
                                        >
                                            <RefreshCw className="mr-2 h-4 w-4" />
                                            Sync
                                        </Button>

                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                handleDelete(selectedIntegration)
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
                                <Webhook className="h-7 w-7 text-primary" />
                            </div>

                            <h2 className="text-xl font-semibold">
                                Select an integration
                            </h2>

                            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                                Choose a provider to inspect status, configuration and sync details.
                            </p>
                        </div>
                    )}
                </Card>
            </div>

            {canManageIntegrations && isNewIntegrationOpen && (
                <NewIntegrationModal
                    open={isNewIntegrationOpen}
                    onClose={() => setIsNewIntegrationOpen(false)}
                />
            )}
        </div>
    );
};

export default IntegrationsPage;