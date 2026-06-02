import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    Calendar,
    CheckCircle2,
    // DollarSign,
    MoreVertical,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    XCircle,
    CalendarDays,
    // AlertTriangle,
    User,
    MessageSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useBookingsStore } from "@/store/dashboard/bookingsStore";
import type { Booking, BookingStatus } from "@/services/dashboard/bookingsService";
import { isToday, isThisWeek, getStatusContainerClass, getStatusIcon, formatDate, formatTime, getStatusClass, formatStatus, getInitials, formatFullDate } from "./helpers/BookingHelpers";
import NewBookingModal from "./new-booking/NewBookingModal";
import { useAuthStore } from "@/store/authStore";

export const BookingsPage = () => {
    const {
        bookings,
        selectedBooking,
        isLoading,
        error,
        loadBookings,
        updateBookingStatus,
        deleteBooking,
        selectBooking,
    } = useBookingsStore();

    const { hasPermission } = useAuthStore();

    const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
    const [calendarView, setCalendarView] = useState<"today" | "week" | "month">(
        "today"
    );
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const canCreateBooking = hasPermission("bookings.create");
    const canEditBooking = hasPermission("bookings.edit");
    const canDeleteBooking = hasPermission("bookings.delete");
    const canManageBooking = canEditBooking || canDeleteBooking;

    useEffect(() => {
        loadBookings();
    }, [loadBookings]);

    const filteredBookings = useMemo(() => {
        const search = searchTerm.toLowerCase();

        return bookings.filter((booking) => {
            const matchesSearch =
                booking.customer_name.toLowerCase().includes(search) ||
                booking.service_name.toLowerCase().includes(search) ||
                (booking.notes || "").toLowerCase().includes(search);

            const matchesStatus =
                statusFilter === "all" || booking.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [bookings, searchTerm, statusFilter]);

    const calendarBookings = useMemo(() => {
        if (calendarView === "today") {
            return bookings.filter((booking) => isToday(booking.scheduled_at));
        }

        if (calendarView === "week") {
            return bookings.filter((booking) => isThisWeek(booking.scheduled_at));
        }

        return bookings;
    }, [bookings, calendarView]);

    const stats = useMemo(() => {
        return {
            today: bookings.filter((booking) => isToday(booking.scheduled_at)).length,
            week: bookings.filter((booking) => isThisWeek(booking.scheduled_at)).length,
            confirmed: bookings.filter((booking) => booking.status === "confirmed")
                .length,
            pending: bookings.filter((booking) => booking.status === "pending")
                .length,
        };
    }, [bookings]);

    const totalValue = useMemo(() => {
        return bookings.reduce(
            (total, booking) => total + Number(booking.estimated_value || 0),
            0
        );
    }, [bookings]);

    const handleUpdateStatus = async (
        booking: Booking,
        status: BookingStatus
    ) => {

        if (status === "cancelled" && !canDeleteBooking) return;
        if (status !== "cancelled" && !canEditBooking) return;

        await updateBookingStatus(booking, status);
        setOpenMenuId(null);
    };

    const handleDelete = async (booking: Booking) => {
        if (!canDeleteBooking) return;

        await deleteBooking(booking);
        setOpenMenuId(null);
    };

    return (
        <div className="h-full px-5 py-6 sm:px-7 lg:px-8">
            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Bookings
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage appointments created manually, captured by AI, or linked to customer conversations.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={loadBookings}
                        disabled={isLoading}
                    >
                        <RefreshCw
                            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""
                                }`}
                        />
                        Refresh
                    </Button>

                    {canCreateBooking && (
                        <Button
                            className="bg-primary hover:bg-primary/90"
                            onClick={() => setIsNewBookingOpen(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            New Booking
                        </Button>
                    )}
                </div>
            </div>

            {error && (
                <Card className="mb-4 border-red-500/30 bg-red-500/10 p-4">
                    <p className="text-sm text-red-400">{error}</p>
                </Card>
            )}

            <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Bookings Today</p>
                    <h3 className="mt-2 text-3xl font-bold">{stats.today}</h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">This Week</p>
                    <h3 className="mt-2 text-3xl font-bold">{stats.week}</h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Confirmed</p>
                    <h3 className="mt-2 text-3xl font-bold text-emerald-400">
                        {stats.confirmed}
                    </h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <h3 className="mt-2 text-3xl font-bold text-amber-400">
                        {stats.pending}
                    </h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Pipeline Value</p>
                    <h3 className="mt-2 text-3xl font-bold text-primary">
                        ${totalValue.toLocaleString()}
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
                                placeholder="Search bookings..."
                                className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                            />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                            {(
                                [
                                    "all",
                                    "confirmed",
                                    "pending",
                                    "completed",
                                    "cancelled",
                                ] as const
                            ).map((status) => (
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
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex h-full items-center justify-center">
                                <p className="text-sm text-muted-foreground">
                                    Loading bookings...
                                </p>
                            </div>
                        ) : filteredBookings.length > 0 ? (
                            <div className="divide-y divide-border/50">
                                {filteredBookings.map((booking, index) => {
                                    const isSelected =
                                        selectedBooking?.id === booking.id;

                                    return (
                                        <motion.button
                                            key={booking.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            onClick={() => selectBooking(booking)}
                                            className={[
                                                "w-full p-4 text-left transition-colors",
                                                isSelected
                                                    ? "bg-primary/10"
                                                    : "hover:bg-secondary/40",
                                            ].join(" ")}
                                        >
                                            <div className="flex gap-3">
                                                <div
                                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${getStatusContainerClass(
                                                        booking.status
                                                    )}`}
                                                >
                                                    {getStatusIcon(booking.status)}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <p className="truncate font-semibold">
                                                                {booking.customer_name}
                                                            </p>

                                                            <p className="mt-1 truncate text-xs text-muted-foreground">
                                                                {booking.service_name}
                                                            </p>
                                                        </div>

                                                        <div className="shrink-0 text-right">
                                                            <p className="text-xs font-medium">
                                                                {formatDate(
                                                                    booking.scheduled_at
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {formatTime(
                                                                    booking.scheduled_at
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                                                        <span
                                                            className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] capitalize ${getStatusClass(
                                                                booking.status
                                                            )}`}
                                                        >
                                                            {getStatusIcon(
                                                                booking.status
                                                            )}
                                                            {formatStatus(
                                                                booking.status
                                                            )}
                                                        </span>

                                                        <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-400">
                                                            $
                                                            {Number(
                                                                booking.estimated_value
                                                            ).toLocaleString()}
                                                        </span>

                                                        {booking.source && (
                                                            <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                                                                {booking.source}
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
                                <Calendar className="mb-3 h-10 w-10 text-muted-foreground" />
                                <p className="font-medium">No bookings found</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Try another search or status filter.
                                </p>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="flex min-h-0 flex-col overflow-hidden border-border/50 bg-card/60">
                    {selectedBooking ? (
                        <div className="flex h-full flex-col">
                            <div className="border-b border-border/50 p-5">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-lg font-semibold text-primary">
                                            {getInitials(
                                                selectedBooking.customer_name
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="text-xl font-semibold">
                                                    {
                                                        selectedBooking.customer_name
                                                    }
                                                </h2>

                                                <span
                                                    className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs capitalize ${getStatusClass(
                                                        selectedBooking.status
                                                    )}`}
                                                >
                                                    {getStatusIcon(
                                                        selectedBooking.status
                                                    )}
                                                    {formatStatus(
                                                        selectedBooking.status
                                                    )}
                                                </span>
                                            </div>

                                            <p className="mt-2 text-sm text-muted-foreground">
                                                {selectedBooking.service_name}
                                            </p>
                                        </div>
                                    </div>

                                    {canManageBooking && (
                                        <div className="relative">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setOpenMenuId(
                                                        openMenuId === selectedBooking.id
                                                            ? null
                                                            : selectedBooking.id
                                                    )
                                                }
                                            >
                                                <MoreVertical className="mr-2 h-4 w-4" />
                                                Actions
                                            </Button>

                                            {openMenuId === selectedBooking.id && (
                                                <div className="absolute right-0 top-10 z-50 w-52 overflow-hidden rounded-xl border border-border/60 bg-background shadow-xl">
                                                    {canEditBooking && (
                                                        <>
                                                            <button
                                                                onClick={() =>
                                                                    handleUpdateStatus(
                                                                        selectedBooking,
                                                                        "confirmed"
                                                                    )
                                                                }
                                                                className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-secondary/60"
                                                            >
                                                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                                                Mark Confirmed
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    handleUpdateStatus(
                                                                        selectedBooking,
                                                                        "completed"
                                                                    )
                                                                }
                                                                className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-secondary/60"
                                                            >
                                                                <CheckCircle2 className="h-4 w-4 text-blue-400" />
                                                                Mark Completed
                                                            </button>
                                                        </>
                                                    )}

                                                    {canDeleteBooking && (
                                                        <>
                                                            <button
                                                                onClick={() =>
                                                                    handleUpdateStatus(
                                                                        selectedBooking,
                                                                        "cancelled"
                                                                    )
                                                                }
                                                                className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-secondary/60"
                                                            >
                                                                <XCircle className="h-4 w-4 text-red-400" />
                                                                Cancel Booking
                                                            </button>

                                                            <button
                                                                onClick={() => handleDelete(selectedBooking)}
                                                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                Delete Booking
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5">
                                <div className="mb-5 grid gap-4 md:grid-cols-4">
                                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Date
                                        </p>
                                        <p className="mt-1 font-medium">
                                            {formatFullDate(
                                                selectedBooking.scheduled_at
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Time
                                        </p>
                                        <p className="mt-1 font-medium">
                                            {formatTime(
                                                selectedBooking.scheduled_at
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Value
                                        </p>
                                        <p className="mt-1 font-medium text-emerald-400">
                                            $
                                            {Number(
                                                selectedBooking.estimated_value
                                            ).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Source
                                        </p>
                                        <p className="mt-1 font-medium capitalize">
                                            {selectedBooking.source || "manual"}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/10 p-4">
                                    <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                                        <img
                                            src="/icon.png"
                                            alt="Icono"
                                            className="w-5 h-5 object-contain"
                                        />
                                        Booking Intelligence
                                    </p>

                                    <p className="mt-2 text-sm text-muted-foreground">
                                        This booking was created from{" "}
                                        {selectedBooking.source || "manual"} workflow.
                                        Later, Atendilo AI can suggest follow-ups,
                                        reminders, rescheduling options, and
                                        calendar sync actions.
                                    </p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <User className="h-4 w-4" />
                                            Contact ID
                                        </p>
                                        <p className="mt-1 truncate text-sm font-medium">
                                            {selectedBooking.contact_id ||
                                                "No contact linked"}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <MessageSquare className="h-4 w-4" />
                                            Conversation ID
                                        </p>
                                        <p className="mt-1 truncate text-sm font-medium">
                                            {selectedBooking.conversation_id ||
                                                "No conversation linked"}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 rounded-2xl border border-border/60 bg-background/40 p-4">
                                    <h3 className="font-semibold">Notes</h3>

                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {selectedBooking.notes ||
                                            "No notes added for this booking."}
                                    </p>
                                </div>

                                {canManageBooking && (
                                    <div className="mt-5 flex flex-wrap gap-3">
                                        {canEditBooking && (
                                            <>
                                                <Button
                                                    onClick={() =>
                                                        handleUpdateStatus(
                                                            selectedBooking,
                                                            "confirmed"
                                                        )
                                                    }
                                                >
                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                    Confirm
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleUpdateStatus(
                                                            selectedBooking,
                                                            "completed"
                                                        )
                                                    }
                                                >
                                                    Mark Completed
                                                </Button>
                                            </>
                                        )}

                                        {canDeleteBooking && (
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    handleUpdateStatus(
                                                        selectedBooking,
                                                        "cancelled"
                                                    )
                                                }
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                                <Calendar className="h-7 w-7 text-primary" />
                            </div>

                            <h2 className="text-xl font-semibold">
                                Select a booking
                            </h2>

                            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                                Choose a booking from the left to inspect the
                                customer, service, schedule, value, source and
                                notes.
                            </p>
                        </div>
                    )}
                </Card>
            </div>

            <Card className="mt-5 overflow-hidden border-border/50 bg-card/60">
                <div className="flex flex-col gap-4 border-b border-border/50 bg-background/30 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h3 className="font-semibold">Booking Calendar</h3>
                        <p className="text-sm text-muted-foreground">
                            Preview bookings by day, week, or month.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {(
                            [
                                { id: "today", label: "Today" },
                                { id: "week", label: "Week" },
                                { id: "month", label: "Month" },
                            ] as const
                        ).map((view) => (
                            <Button
                                key={view.id}
                                variant={
                                    calendarView === view.id ? "outline" : "ghost"
                                }
                                size="sm"
                                onClick={() => setCalendarView(view.id)}
                                className={
                                    calendarView === view.id
                                        ? "border-primary text-primary"
                                        : ""
                                }
                            >
                                {view.label}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="p-5">
                    {calendarBookings.length > 0 ? (
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            {calendarBookings.slice(0, 8).map((booking) => (
                                <button
                                    key={booking.id}
                                    onClick={() => selectBooking(booking)}
                                    className="rounded-xl border border-border/60 bg-background/40 p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                                >
                                    <div className="mb-3 flex items-center justify-between">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
                                            <CalendarDays className="h-4 w-4 text-primary" />
                                        </div>

                                        <span
                                            className={`rounded-full border px-2 py-0.5 text-[11px] capitalize ${getStatusClass(
                                                booking.status
                                            )}`}
                                        >
                                            {booking.status}
                                        </span>
                                    </div>

                                    <p className="font-semibold">
                                        {booking.customer_name}
                                    </p>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {booking.service_name}
                                    </p>

                                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                                        <span>
                                            {formatDate(booking.scheduled_at)},{" "}
                                            {formatTime(booking.scheduled_at)}
                                        </span>

                                        <span className="font-medium text-emerald-400">
                                            $
                                            {Number(
                                                booking.estimated_value
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
                            <CalendarDays className="mb-3 h-10 w-10 text-muted-foreground" />
                            <p className="font-medium">
                                No bookings in this view
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Change the calendar view or create a new booking.
                            </p>
                        </div>
                    )}
                </div>
            </Card>

            {canCreateBooking && isNewBookingOpen && (
                <NewBookingModal
                    open={isNewBookingOpen}
                    onClose={() => setIsNewBookingOpen(false)}
                />
            )}
        </div>
    );
};

export default BookingsPage;