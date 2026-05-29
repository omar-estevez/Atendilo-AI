import { useEffect, useMemo, useState } from "react";
import {
    CheckCircle2,
    Copy,
    KeyRound,
    Plus,
    RefreshCw,
    Shield,
    Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useApiKeysStore } from "@/store/dashboard/apiKeysStore";
import type { ApiKey } from "@/services/dashboard/apiKeysService";
import NewApiKeyModal from "./new-api-key/NewApiKeyModal";
import { formatDate, formatTimeAgo, getStatusClass, getStatusIcon } from "./helpers/ApiKeyHelpers";

export const ApiKeysPage = () => {
    const {
        apiKeys,
        newlyCreatedKey,
        isLoading,
        error,
        loadApiKeys,
        revokeApiKey,
        deleteApiKey,
        clearNewlyCreatedKey,
    } = useApiKeysStore();

    const [isNewApiKeyOpen, setIsNewApiKeyOpen] = useState(false);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    useEffect(() => {
        loadApiKeys();
    }, [loadApiKeys]);

    const stats = useMemo(() => {
        return {
            total: apiKeys.length,
            active: apiKeys.filter((key) => key.status === "active").length,
            revoked: apiKeys.filter((key) => key.status === "revoked").length,
            used: apiKeys.filter((key) => key.last_used_at).length,
        };
    }, [apiKeys]);

    const handleCopy = async (value: string) => {
        await navigator.clipboard.writeText(value);
        setCopiedKey(value);

        window.setTimeout(() => {
            setCopiedKey(null);
        }, 1500);
    };

    const handleRevoke = async (apiKey: ApiKey) => {
        await revokeApiKey(apiKey);
    };

    const handleDelete = async (apiKey: ApiKey) => {
        await deleteApiKey(apiKey);
    };

    return (
        <div className="h-full px-5 py-6 sm:px-7 lg:px-8">
            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        API Keys
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage API keys for secure external access to Lumora.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={loadApiKeys}
                        disabled={isLoading}
                    >
                        <RefreshCw
                            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""
                                }`}
                        />
                        Refresh
                    </Button>

                    <Button
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => setIsNewApiKeyOpen(true)}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New API Key
                    </Button>
                </div>
            </div>

            {error && (
                <Card className="mb-4 border-red-500/30 bg-red-500/10 p-4">
                    <p className="text-sm text-red-400">{error}</p>
                </Card>
            )}

            {newlyCreatedKey && (
                <Card className="mb-5 border-emerald-500/30 bg-emerald-500/10 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <p className="flex items-center gap-2 font-semibold text-emerald-400">
                                <CheckCircle2 className="h-5 w-5" />
                                API Key created successfully
                            </p>

                            <p className="mt-2 text-sm text-muted-foreground">
                                Copy this key now. You will not be able to see it again.
                            </p>

                            <div className="mt-4 rounded-xl border border-border/60 bg-background/70 p-3 font-mono text-sm">
                                {newlyCreatedKey}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => handleCopy(newlyCreatedKey)}
                            >
                                <Copy className="mr-2 h-4 w-4" />
                                {copiedKey === newlyCreatedKey
                                    ? "Copied"
                                    : "Copy"}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={clearNewlyCreatedKey}
                            >
                                Done
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Total Keys</p>
                    <h3 className="mt-2 text-3xl font-bold">{stats.total}</h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Active</p>
                    <h3 className="mt-2 text-3xl font-bold text-emerald-400">
                        {stats.active}
                    </h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Revoked</p>
                    <h3 className="mt-2 text-3xl font-bold text-red-400">
                        {stats.revoked}
                    </h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Used Keys</p>
                    <h3 className="mt-2 text-3xl font-bold text-primary">
                        {stats.used}
                    </h3>
                </Card>
            </div>

            <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
                <Card className="overflow-hidden border-border/50 bg-card/60">
                    <div className="border-b border-border/50 bg-background/30 p-5">
                        <div className="flex items-center gap-2">
                            <KeyRound className="h-5 w-5 text-primary" />
                            <h2 className="font-semibold">Keys</h2>
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Active and revoked API keys for this business.
                        </p>
                    </div>

                    <div className="divide-y divide-border/50">
                        {isLoading ? (
                            <div className="flex min-h-[320px] items-center justify-center">
                                <p className="text-sm text-muted-foreground">
                                    Loading API keys...
                                </p>
                            </div>
                        ) : apiKeys.length > 0 ? (
                            apiKeys.map((apiKey) => (
                                <div
                                    key={apiKey.id}
                                    className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15">
                                            <KeyRound className="h-6 w-6 text-primary" />
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-semibold">
                                                    {apiKey.name}
                                                </h3>

                                                <span
                                                    className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs capitalize ${getStatusClass(
                                                        apiKey.status
                                                    )}`}
                                                >
                                                    {getStatusIcon(apiKey.status)}
                                                    {apiKey.status}
                                                </span>
                                            </div>

                                            <p className="mt-2 font-mono text-sm text-muted-foreground">
                                                {apiKey.key_prefix}
                                                ••••••••••••••••••
                                            </p>

                                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                <span>
                                                    Created {formatDate(apiKey.created_at)}
                                                </span>
                                                <span>
                                                    Last used {formatTimeAgo(apiKey.last_used_at)}
                                                </span>
                                                <span>
                                                    Expires {formatDate(apiKey.expires_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {apiKey.status === "active" && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleRevoke(apiKey)
                                                }
                                            >
                                                Revoke
                                            </Button>
                                        )}

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(apiKey)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex min-h-[320px] flex-col items-center justify-center p-8 text-center">
                                <KeyRound className="mb-3 h-10 w-10 text-muted-foreground" />
                                <p className="font-medium">No API keys yet</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Create your first API key to connect external systems.
                                </p>
                            </div>
                        )}
                    </div>
                </Card>

                <div className="space-y-5">
                    <Card className="border-border/50 bg-card/60">
                        <div className="border-b border-border/50 bg-background/30 p-5">
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" />
                                <h2 className="font-semibold">
                                    Security Notes
                                </h2>
                            </div>
                        </div>

                        <div className="space-y-3 p-5 text-sm text-muted-foreground">
                            <p>
                                API keys should be stored securely and never exposed in frontend code.
                            </p>

                            <p>
                                Use API keys only from trusted backend services.
                            </p>

                            <p>
                                Revoke keys immediately if you suspect they were compromised.
                            </p>
                        </div>
                    </Card>

                    <Card className="border-border/50 bg-card/60">
                        <div className="border-b border-border/50 bg-background/30 p-5">
                            <h2 className="font-semibold">
                                Example Usage
                            </h2>
                        </div>

                        <div className="p-5">
                            <pre className="overflow-x-auto rounded-xl border border-border/60 bg-background/70 p-4 text-xs text-muted-foreground">
                                {`fetch("https://api.lumora.ai/v1/messages", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    channel: "webchat",
    message: "Hello"
  })
})`}
                            </pre>
                        </div>
                    </Card>
                </div>
            </div>

            {isNewApiKeyOpen && (
                <NewApiKeyModal
                    open={isNewApiKeyOpen}
                    onClose={() => setIsNewApiKeyOpen(false)}
                />
            )}
        </div>
    );
};

export default ApiKeysPage;