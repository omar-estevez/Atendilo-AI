import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useState } from "react";
import { formatConfigLabel, getDefaultConfig } from "../helpers/ChannelHelpers";
import type { Channel, ChannelStatus, ChannelType } from "@/services/dashboard/channelsService";

interface ChannelConfigFormProps {
    channelType: ChannelType;
    selectedChannel: Channel | null;
    updateChannelConfig: (
        channel: Channel,
        config: Record<string, unknown>
    ) => Promise<void>;
    updateChannelStatus: (
        channel: Channel,
        status: ChannelStatus
    ) => Promise<void>;
}

export const ChannelConfigForm = ({
    channelType,
    selectedChannel,
    updateChannelConfig,
    updateChannelStatus,
}: ChannelConfigFormProps) => {
    const [configDraft, setConfigDraft] = useState<Record<string, unknown>>({
        ...getDefaultConfig(channelType),
        ...(selectedChannel?.config || {}),
    });

    const [isSavingConfig, setIsSavingConfig] = useState(false);

    const handleConfigChange = (key: string, value: unknown) => {
        setConfigDraft((current) => ({
            ...current,
            [key]: value,
        }));
    };

    const handleSaveConfig = async () => {
        if (!selectedChannel) return;

        try {
            setIsSavingConfig(true);
            await updateChannelConfig(selectedChannel, configDraft);
        } finally {
            setIsSavingConfig(false);
        }
    };

    return (
        <div className="space-y-5 p-5">
            {!selectedChannel && (
                <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
                    <p className="font-semibold text-amber-400">
                        Channel not created yet
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Create this channel first before saving configuration.
                    </p>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(configDraft).map(([key, value]) => {
                    const isBoolean = typeof value === "boolean";

                    return (
                        <div key={key}>
                            <label className="mb-2 block text-sm font-medium">
                                {formatConfigLabel(key)}
                            </label>

                            {isBoolean ? (
                                <select
                                    value={value ? "true" : "false"}
                                    onChange={(event) =>
                                        handleConfigChange(
                                            key,
                                            event.target.value === "true"
                                        )
                                    }
                                    className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
                                >
                                    <option value="true">Enabled</option>
                                    <option value="false">Disabled</option>
                                </select>
                            ) : (
                                <input
                                    value={String(value ?? "")}
                                    onChange={(event) =>
                                        handleConfigChange(
                                            key,
                                            event.target.value
                                        )
                                    }
                                    placeholder={formatConfigLabel(key)}
                                    className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-wrap gap-3 border-t border-border/50 pt-5">
                <Button
                    onClick={handleSaveConfig}
                    disabled={!selectedChannel || isSavingConfig}
                >
                    <Save className="mr-2 h-4 w-4" />
                    {isSavingConfig ? "Saving..." : "Save Configuration"}
                </Button>

                {selectedChannel && (
                    <>
                        <Button
                            variant="outline"
                            onClick={() =>
                                updateChannelStatus(selectedChannel, "active")
                            }
                        >
                            Activate
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() =>
                                updateChannelStatus(selectedChannel, "inactive")
                            }
                        >
                            Deactivate
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};