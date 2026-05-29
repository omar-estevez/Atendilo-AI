import { useState } from "react";
import { X, Calendar, DollarSign, User, Briefcase, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useBookingsStore } from "@/store/dashboard/bookingsStore";
import type { BookingStatus } from "@/services/dashboard/bookingsService";

interface NewBookingModalProps {
    open: boolean;
    onClose: () => void;
    defaultValues?: {
        customerName?: string;
        serviceName?: string;
        estimatedValue?: number;
        notes?: string;
        contactId?: string | null;
        conversationId?: string | null;
        source?: string;
    };
}

const getLocalDateTimeValue = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 60);

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const NewBookingModal = ({ open, onClose, defaultValues }: NewBookingModalProps) => {
    const business = useAuthStore((state) => state.business);
    const createBooking = useBookingsStore((state) => state.createBooking);

    const [customerName, setCustomerName] = useState(defaultValues?.customerName || "");
    const [serviceName, setServiceName] = useState(defaultValues?.serviceName || "");
    const [scheduledAt, setScheduledAt] = useState(getLocalDateTimeValue());
    const [status, setStatus] = useState<BookingStatus>("pending");
    const [estimatedValue, setEstimatedValue] = useState(defaultValues?.estimatedValue ? String(defaultValues.estimatedValue) : "");
    const [notes, setNotes] = useState(defaultValues?.notes || "");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    if (!open) return null;

    const resetForm = () => {
        setCustomerName("");
        setServiceName("");
        setScheduledAt(getLocalDateTimeValue());
        setStatus("pending");
        setEstimatedValue("");
        setNotes("");
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

        if (!customerName.trim()) {
            setFormError("Customer name is required.");
            return;
        }

        if (!serviceName.trim()) {
            setFormError("Service name is required.");
            return;
        }

        if (!scheduledAt) {
            setFormError("Scheduled date and time are required.");
            return;
        }

        try {
            setIsSubmitting(true);
            setFormError(null);

            await createBooking({
                business_id: business.id,
                contact_id: defaultValues?.contactId || null,
                conversation_id: defaultValues?.conversationId || null,
                customer_name: customerName.trim(),
                service_name: serviceName.trim(),
                scheduled_at: new Date(scheduledAt).toISOString(),
                status,
                estimated_value: Number(estimatedValue || 0),
                notes: notes.trim() || null,
                source: defaultValues?.source || "manual",
            });

            handleClose();
        } catch (error) {
            setFormError(
                error instanceof Error
                    ? error.message
                    : "Failed to create booking"
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
                            New Booking
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Create a manual booking for this workspace.
                        </p>
                    </div>

                    <button
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

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                                <User className="h-4 w-4 text-primary" />
                                Customer Name
                            </label>

                            <input
                                value={customerName}
                                onChange={(event) =>
                                    setCustomerName(event.target.value)
                                }
                                placeholder="Maria Garcia"
                                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                                <Briefcase className="h-4 w-4 text-primary" />
                                Service
                            </label>

                            <input
                                value={serviceName}
                                onChange={(event) =>
                                    setServiceName(event.target.value)
                                }
                                placeholder="Full Detail"
                                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                                <Calendar className="h-4 w-4 text-primary" />
                                Date & Time
                            </label>

                            <input
                                type="datetime-local"
                                value={scheduledAt}
                                onChange={(event) =>
                                    setScheduledAt(event.target.value)
                                }
                                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="mb-2 text-sm font-medium">
                                Status
                            </label>

                            <select
                                value={status}
                                onChange={(event) =>
                                    setStatus(
                                        event.target.value as BookingStatus
                                    )
                                }
                                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
                            >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                                <DollarSign className="h-4 w-4 text-primary" />
                                Estimated Value
                            </label>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={estimatedValue}
                                onChange={(event) =>
                                    setEstimatedValue(event.target.value)
                                }
                                placeholder="149"
                                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="mb-2 text-sm font-medium">
                                Source
                            </label>

                            <div className="flex h-11 items-center rounded-xl border border-border bg-secondary/30 px-3 text-sm text-muted-foreground">
                                Manual
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                            <FileText className="h-4 w-4 text-primary" />
                            Notes
                        </label>

                        <textarea
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            placeholder="Add booking notes, customer requests, address, or internal details..."
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
                            {isSubmitting ? "Creating..." : "Create Booking"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewBookingModal;