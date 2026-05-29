import { useState } from "react";
import { KeyRound, ShieldCheck, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useApiKeysStore } from "@/store/dashboard/apiKeysStore";

interface NewApiKeyModalProps {
    open: boolean;
    onClose: () => void;
}

export const NewApiKeyModal = ({ open, onClose }: NewApiKeyModalProps) => {
    const business = useAuthStore((state) => state.business);
    const createApiKey = useApiKeysStore((state) => state.createApiKey);

    const [name, setName] = useState("");
    const [expiresAt, setExpiresAt] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    if (!open) return null;

    const resetForm = () => {
        setName("");
        setExpiresAt("");
        setFormError(null);
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
            setFormError("API key name is required.");
            return;
        }

        try {
            setIsSubmitting(true);
            setFormError(null);

            await createApiKey({
                business_id: business.id,
                name: name.trim(),
                expires_at: expiresAt
                    ? new Date(expiresAt).toISOString()
                    : null,
            });

            handleClose();
        } catch (error) {
            setFormError(
                error instanceof Error
                    ? error.message
                    : "Failed to create API key"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl">
                <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-semibold">
                            New API Key
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Generate an API key for external integrations.
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

                    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold text-amber-400">
                            <ShieldCheck className="h-4 w-4" />
                            Important
                        </p>

                        <p className="mt-2 text-sm text-muted-foreground">
                            The API key will only be shown once after creation.
                            Copy it and store it safely.
                        </p>
                    </div>

                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                            <KeyRound className="h-4 w-4 text-primary" />
                            Key Name
                        </label>

                        <input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Production API Key"
                            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="mb-2 text-sm font-medium">
                            Expiration Date
                        </label>

                        <input
                            type="date"
                            value={expiresAt}
                            onChange={(event) =>
                                setExpiresAt(event.target.value)
                            }
                            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
                        />

                        <p className="mt-2 text-xs text-muted-foreground">
                            Leave empty if this key should not expire.
                        </p>
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
                            {isSubmitting ? "Creating..." : "Create API Key"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewApiKeyModal;