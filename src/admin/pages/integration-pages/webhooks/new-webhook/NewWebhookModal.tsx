import { useState } from "react";
import { Globe2, Link2, ShieldCheck, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useWebhooksStore } from "@/store/dashboard/webhooksStore";

interface NewWebhookModalProps {
    open: boolean;
    onClose: () => void;
}

const availableEvents = [
    "lead.created",
    "lead.updated",
    "booking.created",
    "booking.confirmed",
    "booking.cancelled",
    "conversation.created",
    "conversation.closed",
    "message.received",
    "ai.reply_sent",
];

export const NewWebhookModal = ({
    open,
    onClose,
}: NewWebhookModalProps) => {
    const business = useAuthStore((state) => state.business);
    const createWebhook = useWebhooksStore((state) => state.createWebhook);

    const [name, setName] = useState("");
    const [endpointUrl, setEndpointUrl] = useState("");
    const [selectedEvents, setSelectedEvents] = useState<string[]>([
        "lead.created",
    ]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    if (!open) return null;

    const resetForm = () => {
        setName("");
        setEndpointUrl("");
        setSelectedEvents(["lead.created"]);
        setFormError(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const toggleEvent = (eventName: string) => {
        setSelectedEvents((current) => {
            if (current.includes(eventName)) {
                return current.filter((item) => item !== eventName);
            }

            return [...current, eventName];
        });
    };

    const isValidUrl = (value: string) => {
        try {
            const url = new URL(value);
            return url.protocol === "https:";
        } catch {
            return false;
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!business) {
            setFormError("No business found.");
            return;
        }

        if (!name.trim()) {
            setFormError("Webhook name is required.");
            return;
        }

        if (!isValidUrl(endpointUrl)) {
            setFormError("Endpoint URL must be a valid HTTPS URL.");
            return;
        }

        if (selectedEvents.length === 0) {
            setFormError("Select at least one event.");
            return;
        }

        try {
            setIsSubmitting(true);
            setFormError(null);

            await createWebhook({
                business_id: business.id,
                name: name.trim(),
                endpoint_url: endpointUrl.trim(),
                events: selectedEvents,
                status: "active",
            });

            handleClose();
        } catch (error) {
            setFormError(
                error instanceof Error
                    ? error.message
                    : "Failed to create webhook"
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
                        <h2 className="text-lg font-semibold">New Webhook</h2>
                        <p className="text-sm text-muted-foreground">
                            Send Lumora events to external systems.
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
                            <ShieldCheck className="h-4 w-4" />
                            Secure Delivery
                        </p>

                        <p className="mt-2 text-sm text-muted-foreground">
                            Lumora will generate a webhook secret. Later, your backend can verify the signature of every webhook request.
                        </p>
                    </div>

                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                            <Globe2 className="h-4 w-4 text-primary" />
                            Webhook Name
                        </label>

                        <input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="CRM Lead Sync"
                            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                            <Link2 className="h-4 w-4 text-primary" />
                            Endpoint URL
                        </label>

                        <input
                            value={endpointUrl}
                            onChange={(event) =>
                                setEndpointUrl(event.target.value)
                            }
                            placeholder="https://yourdomain.com/webhooks/lumora"
                            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                        />

                        <p className="mt-2 text-xs text-muted-foreground">
                            Only HTTPS endpoints are allowed.
                        </p>
                    </div>

                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <label className="text-sm font-medium">
                                Events
                            </label>

                            <span className="text-xs text-muted-foreground">
                                {selectedEvents.length} selected
                            </span>
                        </div>

                        <div className="grid gap-2 md:grid-cols-2">
                            {availableEvents.map((eventName) => {
                                const isSelected =
                                    selectedEvents.includes(eventName);

                                return (
                                    <button
                                        key={eventName}
                                        type="button"
                                        onClick={() => toggleEvent(eventName)}
                                        className={[
                                            "rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                                            isSelected
                                                ? "border-primary bg-primary/15 text-primary"
                                                : "border-border bg-background hover:bg-secondary/50",
                                        ].join(" ")}
                                    >
                                        {eventName}
                                    </button>
                                );
                            })}
                        </div>
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
                            {isSubmitting ? "Creating..." : "Create Webhook"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewWebhookModal;