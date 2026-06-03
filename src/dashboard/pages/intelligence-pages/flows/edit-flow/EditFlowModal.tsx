import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
    AIFlow,
    AIFlowStatus,
} from "@/services/dashboard/aiFlowsService";

const triggerOptions = [
    { value: "manual", label: "Manual" },
    { value: "new_conversation", label: "New Conversation" },
    { value: "service_question", label: "Service Question" },
    { value: "price_question", label: "Price Question" },
    { value: "booking_request", label: "Booking Request" },
    { value: "booking_ready", label: "Booking Ready / Confirmed" },
    { value: "human_handoff", label: "Human Handoff" },
    { value: "lead_score", label: "Lead Score Reached" },
    { value: "follow_up_required", label: "Follow-up Required" },
];

const statusOptions: { value: AIFlowStatus; label: string }[] = [
    { value: "active", label: "Active" },
    { value: "draft", label: "Draft" },
    { value: "paused", label: "Paused" },
    { value: "archived", label: "Archived" },
];

type EditFlowPayload = {
    name: string;
    description: string | null;
    trigger_type: string;
    status: AIFlowStatus;
    nodes_count: number;
};

type EditFlowModalProps = {
    open: boolean;
    flow: AIFlow | null;
    onClose: () => void;
    onSave: (flowId: string, payload: EditFlowPayload) => Promise<void>;
};

type EditFlowModalContentProps = {
    flow: AIFlow;
    onClose: () => void;
    onSave: (flowId: string, payload: EditFlowPayload) => Promise<void>;
};

const EditFlowModalContent = ({
    flow,
    onClose,
    onSave,
}: EditFlowModalContentProps) => {
    const [name, setName] = useState(flow.name || "");
    const [description, setDescription] = useState(flow.description || "");
    const [triggerType, setTriggerType] = useState(flow.trigger_type || "manual");
    const [status, setStatus] = useState<AIFlowStatus>(flow.status || "draft");
    const [nodesCount, setNodesCount] = useState(flow.nodes_count || 3);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!name.trim()) return;

        try {
            setIsSaving(true);

            await onSave(flow.id, {
                name: name.trim(),
                description: description.trim() || null,
                trigger_type: triggerType,
                status,
                nodes_count: Number(nodesCount || 1),
            });

            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="w-full max-w-xl rounded-2xl border border-border bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                    <h2 className="text-lg font-semibold">Edit Flow</h2>
                    <p className="text-sm text-muted-foreground">
                        Update workflow settings and trigger behavior.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
                <div>
                    <label className="mb-1 block text-sm font-medium">Flow name</label>
                    <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Human Handoff"
                        className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">Description</label>
                    <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="Describe what this workflow does..."
                        rows={3}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Trigger</label>
                        <select
                            value={triggerType}
                            onChange={(event) => setTriggerType(event.target.value)}
                            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                        >
                            {triggerOptions.map((trigger) => (
                                <option key={trigger.value} value={trigger.value}>
                                    {trigger.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Status</label>
                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(event.target.value as AIFlowStatus)
                            }
                            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                        >
                            {statusOptions.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">Nodes</label>
                    <input
                        type="number"
                        min={1}
                        max={20}
                        value={nodesCount}
                        onChange={(event) => setNodesCount(Number(event.target.value))}
                        className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    />
                </div>

                <div className="flex justify-end gap-3 border-t border-border pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>

                    <Button type="submit" disabled={isSaving || !name.trim()}>
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export const EditFlowModal = ({
    open,
    flow,
    onClose,
    onSave,
}: EditFlowModalProps) => {
    if (!open || !flow) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <EditFlowModalContent
                key={flow.id}
                flow={flow}
                onClose={onClose}
                onSave={onSave}
            />
        </div>
    );
};