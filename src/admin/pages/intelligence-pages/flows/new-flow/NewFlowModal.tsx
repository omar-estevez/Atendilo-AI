import { useState } from "react";
import { Bot, FileText, GitBranch, PlayCircle, X, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useAIFlowsStore } from "@/store/dashboard/aiFlowsStore";
import type { AIFlowStatus } from "@/services/dashboard/aiFlowsService";

interface NewFlowModalProps {
    open: boolean;
    onClose: () => void;
}

const triggerOptions = [
    { value: "manual", label: "Manual" },
    { value: "new_conversation", label: "New Conversation" },
    { value: "price_inquiry", label: "Price Inquiry" },
    { value: "booking_request", label: "Booking Request" },
    { value: "no_response", label: "No Response" },
    { value: "booking_completed", label: "Booking Completed" },
];

export const NewFlowModal = ({ open, onClose }: NewFlowModalProps) => {
    const business = useAuthStore((state) => state.business);
    const createFlow = useAIFlowsStore((state) => state.createFlow);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [triggerType, setTriggerType] = useState("manual");
    const [status, setStatus] = useState<AIFlowStatus>("draft");
    const [nodesCount, setNodesCount] = useState("4");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    if (!open) return null;

    const resetForm = () => {
        setName("");
        setDescription("");
        setTriggerType("manual");
        setStatus("draft");
        setNodesCount("4");
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
            setFormError("Flow name is required.");
            return;
        }

        try {
            setIsSubmitting(true);
            setFormError(null);

            await createFlow({
                business_id: business.id,
                name: name.trim(),
                description: description.trim() || null,
                trigger_type: triggerType,
                status,
                nodes_count: Number(nodesCount || 0),
            });

            handleClose();
        } catch (error) {
            setFormError(
                error instanceof Error
                    ? error.message
                    : "Failed to create AI flow"
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
                        <h2 className="text-lg font-semibold">New AI Flow</h2>
                        <p className="text-sm text-muted-foreground">
                            Create a workflow that Lumora AI can use to automate customer actions.
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
                            <p className="text-sm text-red-400">{formError}</p>
                        </div>
                    )}

                    <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                            <Bot className="h-4 w-4" />
                            AI Flow Setup
                        </p>

                        <p className="mt-2 text-sm text-muted-foreground">
                            For now this creates the flow record. Later we will connect nodes,
                            conditions, AI prompts, actions, and run history.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                                <GitBranch className="h-4 w-4 text-primary" />
                                Flow Name
                            </label>

                            <input
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="Example: Automatic Booking Flow"
                                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                                <Zap className="h-4 w-4 text-primary" />
                                Trigger
                            </label>

                            <select
                                value={triggerType}
                                onChange={(event) =>
                                    setTriggerType(event.target.value)
                                }
                                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
                            >
                                {triggerOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                                <PlayCircle className="h-4 w-4 text-primary" />
                                Status
                            </label>

                            <select
                                value={status}
                                onChange={(event) =>
                                    setStatus(event.target.value as AIFlowStatus)
                                }
                                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
                            >
                                <option value="draft">Draft</option>
                                <option value="active">Active</option>
                                <option value="paused">Paused</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 text-sm font-medium">
                                Estimated Nodes
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={nodesCount}
                                onChange={(event) =>
                                    setNodesCount(event.target.value)
                                }
                                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="mb-2 text-sm font-medium">
                                Initial Runs
                            </label>

                            <div className="flex h-11 items-center rounded-xl border border-border bg-secondary/30 px-3 text-sm text-muted-foreground">
                                0 runs
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                            <FileText className="h-4 w-4 text-primary" />
                            Description
                        </label>

                        <textarea
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                            placeholder="Describe what this flow should automate..."
                            className="min-h-[110px] w-full resize-none rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
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
                            {isSubmitting ? "Creating..." : "Create Flow"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewFlowModal;