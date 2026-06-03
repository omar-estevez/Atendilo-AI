import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
    Brain,
    CheckCircle2,
    FileText,
    Pencil,
    Plus,
    Search,
    Sparkles,
    Trash2,
    X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { knowledgeBaseService } from "@/services/dashboard/knowledgeBaseService";
import type {
    KnowledgeBaseCategory,
    KnowledgeBaseItem,
    KnowledgeBaseStatus,
    NewKnowledgeBaseItem,
} from "@/dashboard/types";

interface AiKnowledgeProps {
    sectionHeader: (
        icon: ReactNode,
        title: string,
        description?: string
    ) => ReactNode;
    inputClass: string;
    smallSelectClass: string;
}

const categoryOptions: {
    label: string;
    value: KnowledgeBaseCategory;
}[] = [
        { label: "Company Info", value: "company_info" },
        { label: "Services", value: "services" },
        { label: "Pricing", value: "pricing" },
        { label: "Policies", value: "policies" },
        { label: "Service Area", value: "service_area" },
        { label: "Booking", value: "booking" },
        { label: "FAQ", value: "faq" },
        { label: "Promotions", value: "promotions" },
        { label: "Custom", value: "custom" },
    ];

const statusOptions: {
    label: string;
    value: KnowledgeBaseStatus;
}[] = [
        { label: "Active", value: "active" },
        { label: "Draft", value: "draft" },
        { label: "Archived", value: "archived" },
    ];

const defaultNewKnowledge: NewKnowledgeBaseItem = {
    title: "",
    content: "",
    category: "custom",
    status: "active",
    priority: "1",
};

const getCategoryLabel = (category: KnowledgeBaseCategory) => {
    return (
        categoryOptions.find((item) => item.value === category)?.label || category
    );
};

export const AiKnowledge = ({
    sectionHeader,
    inputClass,
    smallSelectClass,
}: AiKnowledgeProps) => {
    const { business } = useAuthStore();

    const [items, setItems] = useState<KnowledgeBaseItem[]>([]);
    const [newItem, setNewItem] =
        useState<NewKnowledgeBaseItem>(defaultNewKnowledge);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<NewKnowledgeBaseItem | null>(
        null
    );
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<KnowledgeBaseStatus | "all">(
        "all"
    );
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesSearch =
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus =
                statusFilter === "all" || item.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [items, searchTerm, statusFilter]);

    const activeKnowledgeCount = items.filter(
        (item) => item.status === "active"
    ).length;

    useEffect(() => {
        if (!business?.id) return;

        let isMounted = true;

        Promise.resolve().then(async () => {
            try {
                setIsLoading(true);

                const data = await knowledgeBaseService.getByBusinessId(business.id);

                if (isMounted) {
                    setItems(data);
                }
            } catch (error) {
                if (isMounted) {
                    toast.error(
                        error instanceof Error
                            ? error.message
                            : "Failed to load AI knowledge base"
                    );
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        });

        return () => {
            isMounted = false;
        };
    }, [business?.id]);

    const resetNewItem = () => {
        setNewItem(defaultNewKnowledge);
    };

    const canCreate =
        newItem.title.trim() && newItem.content.trim() && Number(newItem.priority);

    const handleCreate = async () => {
        if (!business?.id) {
            toast.error("Business not found");
            return;
        }

        if (!canCreate) {
            toast.error("Title, content and priority are required");
            return;
        }

        try {
            setIsSaving(true);

            const created = await knowledgeBaseService.create({
                business_id: business.id,
                title: newItem.title.trim(),
                content: newItem.content.trim(),
                category: newItem.category,
                status: newItem.status,
                priority: Number(newItem.priority),
                metadata: {},
            });

            setItems((current) => [created, ...current]);
            resetNewItem();
            toast.success("AI knowledge saved");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to save knowledge"
            );
        } finally {
            setIsSaving(false);
        }
    };

    const startEditing = (item: KnowledgeBaseItem) => {
        setEditingItemId(item.id);
        setEditingItem({
            title: item.title,
            content: item.content,
            category: item.category,
            status: item.status,
            priority: String(item.priority),
        });
    };

    const cancelEditing = () => {
        setEditingItemId(null);
        setEditingItem(null);
    };

    const handleUpdate = async (itemId: string) => {
        if (!editingItem) return;

        if (!editingItem.title.trim() || !editingItem.content.trim()) {
            toast.error("Title and content are required");
            return;
        }

        try {
            setIsSaving(true);

            const updated = await knowledgeBaseService.update(itemId, {
                title: editingItem.title.trim(),
                content: editingItem.content.trim(),
                category: editingItem.category,
                status: editingItem.status,
                priority: Number(editingItem.priority || 1),
            });

            setItems((current) =>
                current.map((item) => (item.id === itemId ? updated : item))
            );

            cancelEditing();
            toast.success("AI knowledge updated");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to update knowledge"
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (itemId: string) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this knowledge item?"
        );

        if (!confirmed) return;

        try {
            setIsSaving(true);
            await knowledgeBaseService.remove(itemId);

            setItems((current) => current.filter((item) => item.id !== itemId));
            toast.success("AI knowledge deleted");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to delete knowledge"
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="border-border/60 bg-card/80 p-6">
            {sectionHeader(
                <Brain className="h-5 w-5 text-primary" />,
                "AI Knowledge Base",
                "Specific business information the AI should use when answering customers."
            )}

            <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border bg-background/60 p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        Total Knowledge
                    </div>
                    <p className="mt-2 text-2xl font-bold">{items.length}</p>
                </div>

                <div className="rounded-2xl border border-border bg-background/60 p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4" />
                        Active Items
                    </div>
                    <p className="mt-2 text-2xl font-bold">{activeKnowledgeCount}</p>
                </div>

                <div className="rounded-2xl border border-border bg-background/60 p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Sparkles className="h-4 w-4" />
                        AI Usage
                    </div>
                    <p className="mt-2 text-sm font-medium">
                        Active items will be used by the AI.
                    </p>
                </div>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-background/50 p-4">
                <h4 className="mb-4 font-semibold">Add New Knowledge</h4>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium">Title</label>
                        <input
                            value={newItem.title}
                            onChange={(event) =>
                                setNewItem({ ...newItem, title: event.target.value })
                            }
                            placeholder="Pricing, Service Area, Refund Policy..."
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">Category</label>
                        <select
                            value={newItem.category}
                            onChange={(event) =>
                                setNewItem({
                                    ...newItem,
                                    category: event.target.value as KnowledgeBaseCategory,
                                })
                            }
                            className={smallSelectClass}
                        >
                            {categoryOptions.map((category) => (
                                <option key={category.value} value={category.value}>
                                    {category.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">Status</label>
                        <select
                            value={newItem.status}
                            onChange={(event) =>
                                setNewItem({
                                    ...newItem,
                                    status: event.target.value as KnowledgeBaseStatus,
                                })
                            }
                            className={smallSelectClass}
                        >
                            {statusOptions.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Priority
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={newItem.priority}
                            onChange={(event) =>
                                setNewItem({ ...newItem, priority: event.target.value })
                            }
                            placeholder="1"
                            className={inputClass}
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium">Content</label>
                    <textarea
                        value={newItem.content}
                        onChange={(event) =>
                            setNewItem({ ...newItem, content: event.target.value })
                        }
                        placeholder="Write the exact information the AI should know and use when answering customers..."
                        rows={5}
                        className={`${inputClass} resize-none`}
                    />
                </div>

                <div className="mt-4 flex justify-end">
                    <Button
                        type="button"
                        onClick={handleCreate}
                        disabled={!canCreate || isSaving}
                        className="bg-primary hover:bg-primary/90"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        {isSaving ? "Saving..." : "Add Knowledge"}
                    </Button>
                </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search knowledge..."
                        className={`${inputClass} pl-10`}
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(event.target.value as KnowledgeBaseStatus | "all")
                    }
                    className={smallSelectClass}
                >
                    <option value="all">All Status</option>
                    {statusOptions.map((status) => (
                        <option key={status.value} value={status.value}>
                            {status.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mt-6 space-y-4">
                {isLoading ? (
                    <div className="rounded-2xl border border-border bg-background/40 p-6 text-center text-sm text-muted-foreground">
                        Loading AI knowledge...
                    </div>
                ) : filteredItems.length > 0 ? (
                    filteredItems.map((item) => {
                        const isEditing = editingItemId === item.id;

                        return (
                            <div
                                key={item.id}
                                className="rounded-2xl border border-border bg-background/50 p-4"
                            >
                                {isEditing && editingItem ? (
                                    <div className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    Title
                                                </label>
                                                <input
                                                    value={editingItem.title}
                                                    onChange={(event) =>
                                                        setEditingItem({
                                                            ...editingItem,
                                                            title: event.target.value,
                                                        })
                                                    }
                                                    className={inputClass}
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    Category
                                                </label>
                                                <select
                                                    value={editingItem.category}
                                                    onChange={(event) =>
                                                        setEditingItem({
                                                            ...editingItem,
                                                            category: event.target
                                                                .value as KnowledgeBaseCategory,
                                                        })
                                                    }
                                                    className={smallSelectClass}
                                                >
                                                    {categoryOptions.map((category) => (
                                                        <option
                                                            key={category.value}
                                                            value={category.value}
                                                        >
                                                            {category.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    Status
                                                </label>
                                                <select
                                                    value={editingItem.status}
                                                    onChange={(event) =>
                                                        setEditingItem({
                                                            ...editingItem,
                                                            status: event.target
                                                                .value as KnowledgeBaseStatus,
                                                        })
                                                    }
                                                    className={smallSelectClass}
                                                >
                                                    {statusOptions.map((status) => (
                                                        <option key={status.value} value={status.value}>
                                                            {status.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    Priority
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    value={editingItem.priority}
                                                    onChange={(event) =>
                                                        setEditingItem({
                                                            ...editingItem,
                                                            priority: event.target.value,
                                                        })
                                                    }
                                                    className={inputClass}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium">
                                                Content
                                            </label>
                                            <textarea
                                                value={editingItem.content}
                                                onChange={(event) =>
                                                    setEditingItem({
                                                        ...editingItem,
                                                        content: event.target.value,
                                                    })
                                                }
                                                rows={5}
                                                className={`${inputClass} resize-none`}
                                            />
                                        </div>

                                        <div className="flex justify-end gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={cancelEditing}
                                                disabled={isSaving}
                                            >
                                                <X className="mr-2 h-4 w-4" />
                                                Cancel
                                            </Button>

                                            <Button
                                                type="button"
                                                onClick={() => handleUpdate(item.id)}
                                                disabled={isSaving}
                                                className="bg-primary hover:bg-primary/90"
                                            >
                                                Save
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h4 className="font-semibold">{item.title}</h4>

                                                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                                                        {getCategoryLabel(item.category)}
                                                    </span>

                                                    <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                                                        {item.status}
                                                    </span>

                                                    <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                                                        Priority {item.priority}
                                                    </span>
                                                </div>

                                                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                                                    {item.content}
                                                </p>
                                            </div>

                                            <div className="flex shrink-0 gap-2">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => startEditing(item)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>

                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="rounded-2xl border border-dashed border-border bg-background/40 p-8 text-center">
                        <Brain className="mx-auto h-8 w-8 text-muted-foreground" />
                        <h4 className="mt-3 font-semibold">No AI knowledge yet</h4>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Add pricing, policies, service areas, FAQs, and instructions so
                            Atendilo can answer better.
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
};