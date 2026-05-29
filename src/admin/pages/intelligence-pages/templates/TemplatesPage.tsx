import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    Bot,
    Copy,
    FileText,
    MoreVertical,
    Plus,
    RefreshCw,
    Search,
    ToggleLeft,
    ToggleRight,
    Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTemplatesStore } from "@/store/dashboard/templatesStore";
import type {
    Template,
    TemplateChannel,
    TemplateType,
} from "@/services/dashboard/templatesService";
import { getTypeIcon, getTypeClass, formatLabel, getChannelClass } from "./helpers/TemplateHelpers";
import NewTemplateModal from "./new-template/NewTemplateModal";

export const TemplatesPage = () => {
    const {
        templates,
        selectedTemplate,
        isLoading,
        error,
        loadTemplates,
        toggleTemplate,
        deleteTemplate,
        selectTemplate,
    } = useTemplatesStore();

    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<TemplateType | "all">("all");
    const [channelFilter, setChannelFilter] =
        useState<TemplateChannel | "all">("all");
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [isNewTemplateOpen, setIsNewTemplateOpen] = useState(false);

    useEffect(() => {
        loadTemplates();
    }, [loadTemplates]);

    const filteredTemplates = useMemo(() => {
        const search = searchTerm.toLowerCase();

        return templates.filter((template) => {
            const matchesSearch =
                template.name.toLowerCase().includes(search) ||
                (template.description || "").toLowerCase().includes(search) ||
                template.content.toLowerCase().includes(search);

            const matchesType =
                typeFilter === "all" || template.type === typeFilter;

            const matchesChannel =
                channelFilter === "all" ||
                template.channel === channelFilter;

            return matchesSearch && matchesType && matchesChannel;
        });
    }, [templates, searchTerm, typeFilter, channelFilter]);

    const stats = useMemo(() => {
        return {
            total: templates.length,
            active: templates.filter((template) => template.is_active).length,
            aiPrompts: templates.filter((template) => template.type === "ai_prompt")
                .length,
            usage: templates.reduce(
                (total, template) => total + template.usage_count,
                0
            ),
        };
    }, [templates]);

    const handleCopy = async (template: Template) => {
        await navigator.clipboard.writeText(template.content);
    };

    return (
        <div className="h-full px-5 py-6 sm:px-7 lg:px-8">
            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Templates
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage reusable AI prompts, replies, quotes, follow-ups and booking messages.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={loadTemplates}
                        disabled={isLoading}
                    >
                        <RefreshCw
                            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""
                                }`}
                        />
                        Refresh
                    </Button>

                    <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsNewTemplateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Template
                    </Button>
                </div>
            </div>

            {error && (
                <Card className="mb-4 border-red-500/30 bg-red-500/10 p-4">
                    <p className="text-sm text-red-400">{error}</p>
                </Card>
            )}

            <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Total Templates</p>
                    <h3 className="mt-2 text-3xl font-bold">{stats.total}</h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Active</p>
                    <h3 className="mt-2 text-3xl font-bold text-emerald-400">
                        {stats.active}
                    </h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">AI Prompts</p>
                    <h3 className="mt-2 text-3xl font-bold text-primary">
                        {stats.aiPrompts}
                    </h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Total Usage</p>
                    <h3 className="mt-2 text-3xl font-bold text-blue-400">
                        {stats.usage.toLocaleString()}
                    </h3>
                </Card>
            </div>

            <div className="grid h-[calc(100vh-300px)] min-h-[640px] grid-cols-1 gap-5 xl:grid-cols-[520px_1fr]">
                <Card className="flex min-h-0 flex-col overflow-hidden border-border/50 bg-card/60">
                    <div className="border-b border-border/50 bg-background/30 p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                                placeholder="Search templates..."
                                className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                            />
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3">
                            <select
                                value={typeFilter}
                                onChange={(event) =>
                                    setTypeFilter(
                                        event.target.value as TemplateType | "all"
                                    )
                                }
                                className="h-9 rounded-lg border border-border bg-background px-2 text-xs outline-none focus:border-primary"
                            >
                                <option value="all">All Types</option>
                                <option value="message">Message</option>
                                <option value="follow_up">Follow Up</option>
                                <option value="quote">Quote</option>
                                <option value="booking_confirmation">
                                    Booking Confirmation
                                </option>
                                <option value="reminder">Reminder</option>
                                <option value="review_request">
                                    Review Request
                                </option>
                                <option value="ai_prompt">AI Prompt</option>
                            </select>

                            <select
                                value={channelFilter}
                                onChange={(event) =>
                                    setChannelFilter(
                                        event.target.value as
                                        | TemplateChannel
                                        | "all"
                                    )
                                }
                                className="h-9 rounded-lg border border-border bg-background px-2 text-xs outline-none focus:border-primary"
                            >
                                <option value="all">All Channels</option>
                                <option value="all">Global</option>
                                <option value="whatsapp">WhatsApp</option>
                                <option value="sms">SMS</option>
                                <option value="email">Email</option>
                                <option value="webchat">Web Chat</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex h-full items-center justify-center">
                                <p className="text-sm text-muted-foreground">
                                    Loading templates...
                                </p>
                            </div>
                        ) : filteredTemplates.length > 0 ? (
                            <div className="divide-y divide-border/50">
                                {filteredTemplates.map((template, index) => {
                                    const isSelected =
                                        selectedTemplate?.id === template.id;

                                    return (
                                        <motion.button
                                            key={template.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            onClick={() =>
                                                selectTemplate(template)
                                            }
                                            className={[
                                                "w-full p-4 text-left transition-colors",
                                                isSelected
                                                    ? "bg-primary/10"
                                                    : "hover:bg-secondary/40",
                                            ].join(" ")}
                                        >
                                            <div className="flex gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                                                    {getTypeIcon(template.type)}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <p className="truncate font-semibold">
                                                                {template.name}
                                                            </p>

                                                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                                {template.description ||
                                                                    template.content}
                                                            </p>
                                                        </div>

                                                        <span className="shrink-0 text-xs text-muted-foreground">
                                                            {template.usage_count} uses
                                                        </span>
                                                    </div>

                                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                                        <span
                                                            className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${getTypeClass(
                                                                template.type
                                                            )}`}
                                                        >
                                                            {getTypeIcon(
                                                                template.type
                                                            )}
                                                            {formatLabel(
                                                                template.type
                                                            )}
                                                        </span>

                                                        <span
                                                            className={`rounded-full border px-2 py-0.5 text-[11px] ${getChannelClass(
                                                                template.channel
                                                            )}`}
                                                        >
                                                            {formatLabel(
                                                                template.channel
                                                            )}
                                                        </span>

                                                        <span
                                                            className={`rounded-full border px-2 py-0.5 text-[11px] ${template.is_active
                                                                ? "border-emerald-500/25 bg-emerald-500/15 text-emerald-400"
                                                                : "border-border bg-secondary text-muted-foreground"
                                                                }`}
                                                        >
                                                            {template.is_active
                                                                ? "Active"
                                                                : "Inactive"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                                <FileText className="mb-3 h-10 w-10 text-muted-foreground" />
                                <p className="font-medium">No templates found</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Create your first template for AI replies,
                                    quotes or follow-ups.
                                </p>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="flex min-h-0 flex-col overflow-hidden border-border/50 bg-card/60">
                    {selectedTemplate ? (
                        <div className="flex h-full flex-col">
                            <div className="border-b border-border/50 p-5">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/20">
                                            {getTypeIcon(selectedTemplate.type)}
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="text-xl font-semibold">
                                                    {selectedTemplate.name}
                                                </h2>

                                                <span
                                                    className={`rounded-full border px-2.5 py-1 text-xs ${getTypeClass(
                                                        selectedTemplate.type
                                                    )}`}
                                                >
                                                    {formatLabel(
                                                        selectedTemplate.type
                                                    )}
                                                </span>

                                                <span
                                                    className={`rounded-full border px-2.5 py-1 text-xs ${getChannelClass(
                                                        selectedTemplate.channel
                                                    )}`}
                                                >
                                                    {formatLabel(
                                                        selectedTemplate.channel
                                                    )}
                                                </span>
                                            </div>

                                            <p className="mt-2 text-sm text-muted-foreground">
                                                {selectedTemplate.description ||
                                                    "No description available."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setOpenMenuId(
                                                    openMenuId ===
                                                        selectedTemplate.id
                                                        ? null
                                                        : selectedTemplate.id
                                                )
                                            }
                                        >
                                            <MoreVertical className="mr-2 h-4 w-4" />
                                            Actions
                                        </Button>

                                        {openMenuId === selectedTemplate.id && (
                                            <div className="absolute right-0 top-10 z-50 w-52 overflow-hidden rounded-xl border border-border/60 bg-background shadow-xl">
                                                <button
                                                    onClick={() => {
                                                        toggleTemplate(
                                                            selectedTemplate
                                                        );
                                                        setOpenMenuId(null);
                                                    }}
                                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-secondary/60"
                                                >
                                                    {selectedTemplate.is_active ? (
                                                        <ToggleLeft className="h-4 w-4 text-amber-400" />
                                                    ) : (
                                                        <ToggleRight className="h-4 w-4 text-emerald-400" />
                                                    )}
                                                    {selectedTemplate.is_active
                                                        ? "Deactivate"
                                                        : "Activate"}
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        handleCopy(
                                                            selectedTemplate
                                                        );
                                                        setOpenMenuId(null);
                                                    }}
                                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-secondary/60"
                                                >
                                                    <Copy className="h-4 w-4 text-primary" />
                                                    Copy Content
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        deleteTemplate(
                                                            selectedTemplate
                                                        );
                                                        setOpenMenuId(null);
                                                    }}
                                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Delete Template
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5">
                                <div className="mb-5 grid gap-4 md:grid-cols-3">
                                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Status
                                        </p>
                                        <p className="mt-1 font-medium">
                                            {selectedTemplate.is_active
                                                ? "Active"
                                                : "Inactive"}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Usage
                                        </p>
                                        <p className="mt-1 font-medium">
                                            {selectedTemplate.usage_count} uses
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Variables
                                        </p>
                                        <p className="mt-1 font-medium">
                                            {selectedTemplate.variables.length}
                                        </p>
                                    </div>
                                </div>

                                {selectedTemplate.subject && (
                                    <div className="mb-5 rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Subject
                                        </p>
                                        <p className="mt-1 font-medium">
                                            {selectedTemplate.subject}
                                        </p>
                                    </div>
                                )}

                                <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/10 p-4">
                                    <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                                        <Bot className="h-4 w-4" />
                                        Template Content
                                    </p>

                                    <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-border/60 bg-background/60 p-4 text-sm leading-relaxed text-muted-foreground">
                                        {selectedTemplate.content}
                                    </pre>
                                </div>

                                <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
                                    <h3 className="font-semibold">Variables</h3>

                                    {selectedTemplate.variables.length > 0 ? (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {selectedTemplate.variables.map(
                                                (variable) => (
                                                    <span
                                                        key={variable}
                                                        className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs text-primary"
                                                    >
                                                        {"{{"}
                                                        {variable}
                                                        {"}}"}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            No variables detected.
                                        </p>
                                    )}
                                </div>

                                <div className="mt-5 flex flex-wrap gap-3">
                                    <Button
                                        onClick={() =>
                                            handleCopy(selectedTemplate)
                                        }
                                    >
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copy Template
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            toggleTemplate(selectedTemplate)
                                        }
                                    >
                                        {selectedTemplate.is_active
                                            ? "Deactivate"
                                            : "Activate"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                                <FileText className="h-7 w-7 text-primary" />
                            </div>

                            <h2 className="text-xl font-semibold">
                                Select a template
                            </h2>

                            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                                Choose a template from the left to inspect content,
                                variables, channel, usage and AI behavior.
                            </p>
                        </div>
                    )}
                </Card>
            </div>

            {isNewTemplateOpen && (
                <NewTemplateModal
                    open={isNewTemplateOpen}
                    onClose={() => setIsNewTemplateOpen(false)}
                />
            )}
        </div>
    );
};

export default TemplatesPage;