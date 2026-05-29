import { useMemo, useState } from "react";
import { Bot, FileText, MessageSquare, Tag, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useTemplatesStore } from "@/store/dashboard/templatesStore";
import type {
    TemplateChannel,
    TemplateType,
} from "@/services/dashboard/templatesService";

interface NewTemplateModalProps {
    open: boolean;
    onClose: () => void;
}

const templateTypes: { value: TemplateType; label: string }[] = [
    { value: "message", label: "Message" },
    { value: "follow_up", label: "Follow Up" },
    { value: "quote", label: "Quote" },
    { value: "booking_confirmation", label: "Booking Confirmation" },
    { value: "reminder", label: "Reminder" },
    { value: "review_request", label: "Review Request" },
    { value: "ai_prompt", label: "AI Prompt" },
];

const templateChannels: { value: TemplateChannel; label: string }[] = [
    { value: "all", label: "All Channels" },
    { value: "whatsapp", label: "WhatsApp" },
    { value: "sms", label: "SMS" },
    { value: "email", label: "Email" },
    { value: "webchat", label: "Web Chat" },
];

const extractVariables = (content: string) => {
    const matches = content.match(/{{\s*([a-zA-Z0-9_]+)\s*}}/g) || [];

    return Array.from(
        new Set(
            matches.map((match) =>
                match.replace(/[{}]/g, "").trim()
            )
        )
    );
};

export const NewTemplateModal = ({
    open,
    onClose,
}: NewTemplateModalProps) => {
    const business = useAuthStore((state) => state.business);
    const createTemplate = useTemplatesStore((state) => state.createTemplate);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<TemplateType>("message");
    const [channel, setChannel] = useState<TemplateChannel>("all");
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [isActive, setIsActive] = useState(true);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const variables = useMemo(() => extractVariables(content), [content]);

    if (!open) return null;

    const resetForm = () => {
        setName("");
        setDescription("");
        setType("message");
        setChannel("all");
        setSubject("");
        setContent("");
        setIsActive(true);
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
            setFormError("Template name is required.");
            return;
        }

        if (!content.trim()) {
            setFormError("Template content is required.");
            return;
        }

        try {
            setIsSubmitting(true);
            setFormError(null);

            await createTemplate({
                business_id: business.id,
                name: name.trim(),
                description: description.trim() || null,
                type,
                channel,
                subject: subject.trim() || null,
                content: content.trim(),
                variables,
                is_active: isActive,
            });

            handleClose();
        } catch (error) {
            setFormError(
                error instanceof Error
                    ? error.message
                    : "Failed to create template"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl">
                <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-semibold">
                            New Template
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Create reusable replies, AI prompts, quotes, reminders or follow-ups.
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
                            <Bot className="h-4 w-4" />
                            Template Variables
                        </p>

                        <p className="mt-2 text-sm text-muted-foreground">
                            Use variables like {"{{customer_name}}"}, {"{{service_name}}"}, {"{{price}}"} or {"{{booking_time}}"}.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                                <FileText className="h-4 w-4 text-primary" />
                                Template Name
                            </label>

                            <input
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="Quick Price Reply"
                                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                                <Tag className="h-4 w-4 text-primary" />
                                Type
                            </label>

                            <select
                                value={type}
                                onChange={(event) =>
                                    setType(event.target.value as TemplateType)
                                }
                                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
                            >
                                {templateTypes.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                                <MessageSquare className="h-4 w-4 text-primary" />
                                Channel
                            </label>

                            <select
                                value={channel}
                                onChange={(event) =>
                                    setChannel(
                                        event.target.value as TemplateChannel
                                    )
                                }
                                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
                            >
                                {templateChannels.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 text-sm font-medium">
                                Status
                            </label>

                            <select
                                value={isActive ? "active" : "inactive"}
                                onChange={(event) =>
                                    setIsActive(event.target.value === "active")
                                }
                                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 text-sm font-medium">
                                Description
                            </label>

                            <input
                                value={description}
                                onChange={(event) =>
                                    setDescription(event.target.value)
                                }
                                placeholder="Used when customers ask for pricing..."
                                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                            />
                        </div>

                        {channel === "email" && (
                            <div className="md:col-span-2">
                                <label className="mb-2 text-sm font-medium">
                                    Email Subject
                                </label>

                                <input
                                    value={subject}
                                    onChange={(event) =>
                                        setSubject(event.target.value)
                                    }
                                    placeholder="Your appointment confirmation"
                                    className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 text-sm font-medium">
                            Content
                        </label>

                        <textarea
                            value={content}
                            onChange={(event) => setContent(event.target.value)}
                            placeholder="Hi {{customer_name}}, thanks for reaching out! Our {{service_name}} starts at ${{price}}..."
                            className="min-h-[150px] w-full resize-none rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                        />
                    </div>

                    <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="font-semibold">Detected Variables</h3>

                            <span className="text-xs text-muted-foreground">
                                {variables.length} found
                            </span>
                        </div>

                        {variables.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {variables.map((variable) => (
                                    <span
                                        key={variable}
                                        className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs text-primary"
                                    >
                                        {"{{"}
                                        {variable}
                                        {"}}"}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No variables detected yet.
                            </p>
                        )}
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
                                : "Create Template"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewTemplateModal;