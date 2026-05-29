import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    // AlertTriangle,
    Mail,
    MessageSquare,
    Phone,
    RefreshCw,
    Search,
    User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { LeadStatus } from "@/services/dashboard/leadService";
import { useLeadsStore } from "@/store/dashboard/leadStore";
import { useNavigate } from "react-router";
import { getInitials, formatLabel, formatDate, getLeadStatusClass, getLeadIcon, getScoreClass } from "./helpers/LeadsHelpers";
import NewBookingModal from "../bookings/new-booking/NewBookingModal";



export const LeadsPage = () => {
    const navigate = useNavigate();

    const {
        leads,
        selectedLead,
        isLoading,
        error,
        loadLeads,
        selectLead,
    } = useLeadsStore();

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
    const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);

    useEffect(() => {
        loadLeads();
    }, [loadLeads]);

    const filteredLeads = useMemo(() => {
        const search = searchTerm.toLowerCase();

        return leads.filter((lead) => {
            const matchesSearch =
                lead.contactName.toLowerCase().includes(search) ||
                (lead.email || "").toLowerCase().includes(search) ||
                (lead.phone || "").toLowerCase().includes(search);

            const matchesStatus =
                statusFilter === "all" || lead.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [leads, searchTerm, statusFilter]);

    const stats = useMemo(() => {
        return {
            total: leads.length,
            hot: leads.filter((lead) => lead.status === "hot").length,
            warm: leads.filter((lead) => lead.status === "warm").length,
            cold: leads.filter((lead) => lead.status === "cold").length,
        };
    }, [leads]);

    return (
        <div className="h-full px-5 py-6 sm:px-7 lg:px-8">
            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Leads
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Track customer intent, AI score, urgency and conversion opportunities.
                    </p>
                </div>

                <Button
                    variant="outline"
                    onClick={loadLeads}
                    disabled={isLoading}
                >
                    <RefreshCw
                        className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""
                            }`}
                    />
                    Refresh
                </Button>
            </div>

            {error && (
                <Card className="mb-4 border-red-500/30 bg-red-500/10 p-4">
                    <p className="text-sm text-red-400">{error}</p>
                </Card>
            )}

            <div className="mb-5 grid gap-4 md:grid-cols-4">
                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Total Leads</p>
                    <h3 className="mt-2 text-3xl font-bold">{stats.total}</h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Hot Leads</p>
                    <h3 className="mt-2 text-3xl font-bold text-red-400">
                        {stats.hot}
                    </h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Warm Leads</p>
                    <h3 className="mt-2 text-3xl font-bold text-amber-400">
                        {stats.warm}
                    </h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Cold Leads</p>
                    <h3 className="mt-2 text-3xl font-bold text-blue-400">
                        {stats.cold}
                    </h3>
                </Card>
            </div>

            <div className="grid h-[calc(100vh-300px)] min-h-[620px] grid-cols-1 gap-5 xl:grid-cols-[520px_1fr]">
                <Card className="flex min-h-0 flex-col overflow-hidden border-border/50 bg-card/60">
                    <div className="border-b border-border/50 bg-background/30 p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                                placeholder="Search leads..."
                                className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                            />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                            {(["all", "hot", "warm", "cold"] as const).map(
                                (status) => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={[
                                            "rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors",
                                            statusFilter === status
                                                ? "border-primary bg-primary/15 text-primary"
                                                : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground",
                                        ].join(" ")}
                                    >
                                        {status}
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex h-full items-center justify-center">
                                <p className="text-sm text-muted-foreground">
                                    Loading leads...
                                </p>
                            </div>
                        ) : filteredLeads.length > 0 ? (
                            <div className="divide-y divide-border/50">
                                {filteredLeads.map((lead, index) => {
                                    const isSelected =
                                        selectedLead?.id === lead.id;

                                    return (
                                        <motion.button
                                            key={lead.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            onClick={() => selectLead(lead)}
                                            className={[
                                                "w-full p-4 text-left transition-colors",
                                                isSelected
                                                    ? "bg-primary/10"
                                                    : "hover:bg-secondary/40",
                                            ].join(" ")}
                                        >
                                            <div className="flex gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                                                    {getInitials(lead.contactName)}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <p className="truncate font-semibold">
                                                                {lead.contactName}
                                                            </p>

                                                            <p className="mt-1 truncate text-xs text-muted-foreground">
                                                                {lead.channelName} · {formatLabel(lead.intent)}
                                                            </p>
                                                        </div>

                                                        <span className="shrink-0 text-xs text-muted-foreground">
                                                            {formatDate(lead.lastActivityAt)}
                                                        </span>
                                                    </div>

                                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                                        <span
                                                            className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] capitalize ${getLeadStatusClass(
                                                                lead.status
                                                            )}`}
                                                        >
                                                            {getLeadIcon(lead.status)}
                                                            {lead.status}
                                                        </span>

                                                        <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                                                            Score {lead.aiScore}%
                                                        </span>

                                                        {lead.urgency && (
                                                            <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-400">
                                                                {formatLabel(lead.urgency)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                                <User className="mb-3 h-10 w-10 text-muted-foreground" />
                                <p className="font-medium">No leads found</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Try another search or status filter.
                                </p>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="flex min-h-0 flex-col overflow-hidden border-border/50 bg-card/60">
                    {selectedLead ? (
                        <div className="flex h-full flex-col">
                            <div className="border-b border-border/50 p-5">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-lg font-semibold text-primary">
                                        {getInitials(selectedLead.contactName)}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-xl font-semibold">
                                                {selectedLead.contactName}
                                            </h2>

                                            <span
                                                className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs capitalize ${getLeadStatusClass(
                                                    selectedLead.status
                                                )}`}
                                            >
                                                {getLeadIcon(selectedLead.status)}
                                                {selectedLead.status} lead
                                            </span>
                                        </div>

                                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                                            {selectedLead.email && (
                                                <span className="flex items-center gap-1">
                                                    <Mail className="h-4 w-4" />
                                                    {selectedLead.email}
                                                </span>
                                            )}

                                            {selectedLead.phone && (
                                                <span className="flex items-center gap-1">
                                                    <Phone className="h-4 w-4" />
                                                    {selectedLead.phone}
                                                </span>
                                            )}

                                            <span className="flex items-center gap-1">
                                                <MessageSquare className="h-4 w-4" />
                                                {selectedLead.channelName}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5">
                                <div className="mb-5 grid gap-4 md:grid-cols-4">
                                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            AI Score
                                        </p>
                                        <p
                                            className={`mt-1 text-2xl font-bold ${getScoreClass(
                                                selectedLead.aiScore
                                            )}`}
                                        >
                                            {selectedLead.aiScore}%
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Intent
                                        </p>
                                        <p className="mt-1 font-medium">
                                            {formatLabel(selectedLead.intent)}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Urgency
                                        </p>
                                        <p className="mt-1 font-medium">
                                            {formatLabel(selectedLead.urgency)}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Sentiment
                                        </p>
                                        <p className="mt-1 font-medium">
                                            {formatLabel(selectedLead.sentiment)}
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
                                    <p className="text-sm font-semibold text-primary">
                                        AI Summary
                                    </p>

                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {selectedLead.aiSummary ||
                                            "No AI summary available yet."}
                                    </p>
                                </div>

                                <div className="mt-5 grid gap-4 md:grid-cols-2">
                                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Lead Source
                                        </p>
                                        <p className="mt-1 font-medium">
                                            {formatLabel(selectedLead.source)}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Last Activity
                                        </p>
                                        <p className="mt-1 font-medium">
                                            {formatDate(selectedLead.lastActivityAt)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-wrap gap-3">
                                    <Button
                                        onClick={() =>
                                            navigate(
                                                `/dashboard/conversations?conversationId=${selectedLead.conversationId}`
                                            )
                                        }
                                    >
                                        Open Conversation
                                    </Button>

                                    <Button variant="outline">
                                        Mark Follow-up
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() => setIsNewBookingOpen(true)}
                                    >
                                        Create Booking
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                                <User className="h-7 w-7 text-primary" />
                            </div>

                            <h2 className="text-xl font-semibold">
                                Select a lead
                            </h2>

                            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                                Choose a lead from the left to inspect AI score,
                                intent, urgency, sentiment and contact details.
                            </p>
                        </div>
                    )}
                </Card>
            </div>

            {isNewBookingOpen && (
                <NewBookingModal
                    open={isNewBookingOpen}
                    onClose={() => setIsNewBookingOpen(false)}
                    defaultValues={
                        selectedLead
                            ? {
                                customerName: selectedLead.contactName,
                                serviceName: formatLabel(selectedLead.intent),
                                estimatedValue:
                                    selectedLead.status === "hot"
                                        ? 149
                                        : selectedLead.status === "warm"
                                            ? 79
                                            : 49,
                                notes: selectedLead.aiSummary || "",
                                contactId: selectedLead.contactId,
                                conversationId: selectedLead.conversationId,
                                source: "lead",
                            }
                            : undefined
                    }
                />
            )}
        </div>
    );
};

export default LeadsPage;