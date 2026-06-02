import { useState } from "react";
import { Plug, Settings2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useIntegrationsStore } from "@/store/dashboard/integrationsStore";
import type {
    IntegrationProvider,
    IntegrationStatus,
} from "@/services/dashboard/integrationsService";

interface NewIntegrationModalProps {
    open: boolean;
    onClose: () => void;
}

const providers: {
    value: IntegrationProvider;
    label: string;
    description: string;
}[] = [
        {
            value: "twilio",
            label: "Twilio",
            description: "SMS and WhatsApp messaging.",
        },
        {
            value: "stripe",
            label: "Stripe",
            description: "Payments, deposits and invoices.",
        },
        {
            value: "google_calendar",
            label: "Google Calendar",
            description: "Sync bookings and appointments.",
        },
        {
            value: "zapier",
            label: "Zapier",
            description: "Connect automations with external apps.",
        },
        {
            value: "meta_whatsapp",
            label: "Meta WhatsApp",
            description: "Official WhatsApp Business Cloud API.",
        },
        {
            value: "smtp_email",
            label: "SMTP Email",
            description: "Send email notifications and replies.",
        },
        {
            value: "custom",
            label: "Custom",
            description: "Custom integration or internal system.",
        },
    ];

const getDefaultName = (provider: IntegrationProvider) => {
    return providers.find((item) => item.value === provider)?.label || "Custom";
};

export const NewIntegrationModal = ({
    open,
    onClose,
}: NewIntegrationModalProps) => {
    const business = useAuthStore((state) => state.business);
    const createIntegration = useIntegrationsStore(
        (state) => state.createIntegration
    );

    const [provider, setProvider] =
        useState<IntegrationProvider>("twilio");
    const [name, setName] = useState("Twilio");
    const [description, setDescription] = useState(
        "SMS and WhatsApp messaging."
    );
    const [status, setStatus] =
        useState<IntegrationStatus>("disconnected");
    const [configJson, setConfigJson] = useState("{}");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    if (!open) return null;

    const resetForm = () => {
        setProvider("twilio");
        setName("Twilio");
        setDescription("SMS and WhatsApp messaging.");
        setStatus("disconnected");
        setConfigJson("{}");
        setFormError(null);
    };

    const handleProviderChange = (value: IntegrationProvider) => {
        const selectedProvider = providers.find((item) => item.value === value);

        setProvider(value);
        setName(selectedProvider?.label || getDefaultName(value));
        setDescription(selectedProvider?.description || "");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!business) {
            setFormError("No business found.");
            return;
        }

        if (!name.trim()) {
            setFormError("Integration name is required.");
            return;
        }

        let parsedConfig: Record<string, unknown>;

        try {
            parsedConfig = JSON.parse(configJson || "{}") as Record<string, unknown>;
        } catch {
            setFormError("Config must be valid JSON.");
            return;
        }

        try {
            setIsSubmitting(true);
            setFormError(null);

            await createIntegration({
                business_id: business.id,
                provider,
                name: name.trim(),
                description: description.trim() || null,
                status,
                config: parsedConfig,
            });

            handleClose();
        } catch (error) {
            setFormError(
                error instanceof Error
                    ? error.message
                    : "Failed to create integration"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl">
                <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-semibold">
                            New Integration
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Add an external provider connection to Atendilo.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-5">
                    {formError && (
                        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
                            <p className="text-sm text-red-400">
                                {formError}
                            </p>
                        </div>
                    )}

                    <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                            <Plug className="h-4 w-4" />
                            Integration Setup
                        </p>

                        <p className="mt-2 text-sm text-muted-foreground">
                            This stores integration metadata for MVP. Real OAuth/API connection will be handled later by backend or Edge Functions.
                        </p>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Provider
                        </label>

                        <select
                            value={provider}
                            onChange={(event) =>
                                handleProviderChange(
                                    event.target.value as IntegrationProvider
                                )
                            }
                            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
                        >
                            {providers.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Name
                            </label>

                            <input
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Status
                            </label>

                            <select
                                value={status}
                                onChange={(event) =>
                                    setStatus(
                                        event.target.value as IntegrationStatus
                                    )
                                }
                                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
                            >
                                <option value="disconnected">
                                    Disconnected
                                </option>
                                <option value="connected">Connected</option>
                                <option value="error">Error</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Description
                        </label>

                        <input
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                            <Settings2 className="h-4 w-4 text-primary" />
                            Config JSON
                        </label>

                        <textarea
                            value={configJson}
                            onChange={(event) =>
                                setConfigJson(event.target.value)
                            }
                            className="min-h-[130px] w-full resize-none rounded-xl border border-border bg-background px-3 py-3 font-mono text-sm outline-none transition-colors focus:border-primary"
                        />
                    </div>

                    <div className="flex justify-end gap-3 border-t border-border/50 pt-5">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {isSubmitting
                                ? "Creating..."
                                : "Create Integration"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewIntegrationModal;