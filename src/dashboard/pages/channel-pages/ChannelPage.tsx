import { useEffect, useMemo } from "react";
import { useParams } from "react-router";
import {
    Code2,
    // Phone,
    RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useChannelsStore } from "@/store/dashboard/channelsStore";
import { useAuthStore } from "@/store/authStore";
import type {
    // Channel,
    ChannelType,
} from "@/services/dashboard/channelsService";
import { getChannelIcon, getChannelTitle, getChannelDescription, getStatusClass, getStatusIcon } from "./helpers/ChannelHelpers";
import { ChannelConfigForm } from "./channel-config-form/ChannelConfigForm";
import { WebChatPreview } from "@/dashboard/components/webchat/WebChatPreview";
import { toast } from "sonner";

const allowedChannels: ChannelType[] = [
    "whatsapp",
    "sms",
    "webchat",
    "email",
];

export const ChannelPage = () => {
    const { channel } = useParams();

    const {
        selectedChannel,
        isLoading,
        error,
        loadChannelByType,
        createChannelByType,
        updateChannelStatus,
        updateChannelConfig,
    } = useChannelsStore();

    const { hasPermission, business } = useAuthStore();

    const canManageChannels = hasPermission("channels.manage");
    const businessId = business?.id;

    const channelType = channel as ChannelType;

    const isValidChannel = allowedChannels.includes(channelType);

    useEffect(() => {
        if (!isValidChannel) return;

        loadChannelByType(channelType);
    }, [channelType, isValidChannel, loadChannelByType]);

    const stats = useMemo(() => {
        const status = selectedChannel?.status || "inactive";
        const config = selectedChannel?.config || {};

        return [
            {
                label: "Status",
                value: status,
            },
            {
                label: "Provider",
                value: String(config.provider || "Not configured"),
            },
            {
                label: "Auto Reply",
                value:
                    config.auto_reply_enabled === true
                        ? "Enabled"
                        : "Disabled",
            },
            {
                label: "Configuration",
                value: selectedChannel ? "Saved" : "Not created",
            },
        ];
    }, [selectedChannel]);

    const handleCreateChannel = async () => {
        if (!canManageChannels) return;

        await createChannelByType(channelType);
    };

    const handleUpdateChannelStatus: typeof updateChannelStatus = async (...args) => {
        if (!canManageChannels) return;

        await updateChannelStatus(...args);
    };

    const handleUpdateChannelConfig: typeof updateChannelConfig = async (...args) => {
        if (!canManageChannels) return;

        await updateChannelConfig(...args);
    };

    if (!isValidChannel) {
        return (
            <div className="h-full px-5 py-6 sm:px-7 lg:px-8">
                <Card className="border-red-500/30 bg-red-500/10 p-6">
                    <h1 className="text-xl font-bold">Invalid channel</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        This channel is not supported.
                    </p>
                </Card>
            </div>
        );
    }

    const widgetInstallCode = businessId
        ? `<script 
  src="https://atendilo-ai.estevezneira95.workers.dev/widget.js" 
  data-business-id="${businessId}"
  data-api-url="https://atendilo-ai.onrender.com">
</script>`
        : "";

    const handleCopyWidgetCode = async () => {
        if (!widgetInstallCode) return;

        await navigator.clipboard.writeText(widgetInstallCode);

        toast.success("Widget code copied");
    };

    return (
        <div className="h-full px-5 py-6 sm:px-7 lg:px-8">
            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
                        {getChannelIcon(channelType)}
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {getChannelTitle(channelType)}
                        </h1>

                        <p className="max-w-2xl text-sm text-muted-foreground">
                            {getChannelDescription(channelType)}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => loadChannelByType(channelType)}
                        disabled={isLoading}
                    >
                        <RefreshCw
                            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""
                                }`}
                        />
                        Refresh
                    </Button>

                    {canManageChannels && !selectedChannel && (
                        <Button
                            className="bg-primary hover:bg-primary/90"
                            onClick={handleCreateChannel}
                            disabled={isLoading}
                        >
                            Create Channel
                        </Button>
                    )}
                </div>
            </div>

            {!canManageChannels && (
                <Card className="mb-4 border-border/50 bg-muted/10 p-4">
                    <p className="text-sm text-muted-foreground">
                        View-only access. Only owners and admins can create channels, update configuration or change channel status.
                    </p>
                </Card>
            )}

            {error && (
                <Card className="mb-4 border-red-500/30 bg-red-500/10 p-4">
                    <p className="text-sm text-red-400">{error}</p>
                </Card>
            )}

            <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((item) => (
                    <Card
                        key={item.label}
                        className="border-border/50 bg-card/60 p-4"
                    >
                        <p className="text-sm text-muted-foreground">
                            {item.label}
                        </p>

                        <h3 className="mt-2 text-xl font-bold capitalize">
                            {item.value}
                        </h3>
                    </Card>
                ))}
            </div>

            <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
                <Card className="border-border/50 bg-card/60">
                    <div className="border-b border-border/50 bg-background/30 p-5">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="font-semibold">
                                    Channel Configuration
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Configure provider settings and automation behavior.
                                </p>
                            </div>

                            {selectedChannel && (
                                <span
                                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs capitalize ${getStatusClass(
                                        selectedChannel.status
                                    )}`}
                                >
                                    {getStatusIcon(selectedChannel.status)}
                                    {selectedChannel.status}
                                </span>
                            )}
                        </div>
                    </div>

                    {canManageChannels ? (
                        <ChannelConfigForm
                            key={`${channelType}-${selectedChannel?.id || "new"}`}
                            channelType={channelType}
                            selectedChannel={selectedChannel}
                            updateChannelConfig={handleUpdateChannelConfig}
                            updateChannelStatus={handleUpdateChannelStatus}
                        />
                    ) : (
                        <div className="space-y-4 p-5">
                            <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
                                <h3 className="font-semibold">
                                    Configuration Preview
                                </h3>

                                <p className="mt-2 text-sm text-muted-foreground">
                                    You can view this channel configuration, but you cannot modify provider settings, automation behavior or status.
                                </p>

                                <pre className="mt-4 overflow-x-auto rounded-xl border border-border/60 bg-card/60 p-4 text-xs text-muted-foreground">
                                    {JSON.stringify(selectedChannel?.config || {}, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </Card>

                <div className="space-y-5">
                    <Card className="border-border/50 bg-card/60">
                        <div className="border-b border-border/50 bg-background/30 p-5">
                            <h2 className="font-semibold">Setup Guide</h2>
                            <p className="text-sm text-muted-foreground">
                                Suggested steps for this channel.
                            </p>
                        </div>

                        <div className="space-y-3 p-5">
                            {[
                                "Create channel record",
                                "Add provider configuration",
                                "Save settings",
                                "Activate channel",
                                "Connect backend webhooks",
                            ].map((step, index) => (
                                <div
                                    key={step}
                                    className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/40 p-3"
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
                    </Card>

                    <Card className="border-border/50 bg-card/60">
                        <div className="border-b border-border/50 bg-background/30 p-5">
                            <div className="flex items-center gap-2">
                                <Code2 className="h-5 w-5 text-primary" />
                                <h2 className="font-semibold">
                                    Backend Status
                                </h2>
                            </div>
                        </div>

                        {channelType === "webchat" ? (
                            <div className="p-5">
                                <p className="font-semibold text-emerald-400">
                                    Backend connected
                                </p>

                                <p className="mt-2 text-sm text-muted-foreground">
                                    Web Chat is connected to the Node/Express API, Supabase and Gemini AI.
                                    Use the preview below to test real conversations.
                                </p>
                            </div>
                        ) : (
                            <div className="p-5">
                                <p className="font-semibold text-amber-400">
                                    Backend not connected yet
                                </p>

                                <p className="mt-2 text-sm text-muted-foreground">
                                    This page stores channel configuration.
                                    Later, Node/Express will use this config to connect providers like Twilio, SMTP or email providers.
                                </p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {channelType === "webchat" && businessId && selectedChannel?.status === 'active' && (
                <div className="mt-5 space-y-5">
                    <Card className="border-border/50 bg-card/60 p-5">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold">
                                Widget Install Code
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Copy this code and paste it before the closing body tag on your website.
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCopyWidgetCode}
                            disabled={!widgetInstallCode}
                        >
                            Copy Code
                        </Button>

                        <div className="rounded-xl border border-border bg-background p-4">
                            <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
                                <code>{widgetInstallCode}</code>
                            </pre>
                        </div>
                    </Card>

                    <Card className="border-border/50 bg-card/60 p-5">
                        <div className="mb-5">
                            <h2 className="text-lg font-semibold">
                                Web Chat Preview
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Test how Atendilo AI will respond to visitors on your website.
                            </p>
                        </div>

                        <WebChatPreview businessId={businessId} />
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ChannelPage;