import type { BusinessBookingTypes } from "@/dashboard/types";
import { Card } from "@/components/ui/card";
import { CalendarClock, Link } from "lucide-react";
import type { Dispatch, ReactNode, SetStateAction } from "react";

interface BookingRulesProps {
    sectionHeader: (
        icon: ReactNode,
        title: string,
        description?: string
    ) => ReactNode;
    inputClass: string;
    smallSelectClass: string;
    showSavedMessage?: (message: string) => void;
    bookingRules: BusinessBookingTypes;
    setBookingRules: Dispatch<SetStateAction<BusinessBookingTypes>>;
}

export const BookingRules = ({
    sectionHeader,
    inputClass,
    smallSelectClass,
    bookingRules,
    setBookingRules,
}: BookingRulesProps) => {
    return (
        <Card className="overflow-hidden border-border/50 bg-card/60">
            <div className="border-b border-border/50 bg-background/30 p-5">
                {sectionHeader(
                    <CalendarClock className="h-5 w-5" />,
                    "Booking Rules",
                    "Control how appointments are scheduled and confirmed."
                )}
            </div>

            <div className="space-y-5 p-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Minimum Notice
                        </label>

                        <select
                            value={bookingRules.minimumNotice}
                            onChange={(event) =>
                                setBookingRules({
                                    ...bookingRules,
                                    minimumNotice: event.target.value,
                                })
                            }
                            className={smallSelectClass}
                        >
                            <option>1 hour</option>
                            <option>2 hours</option>
                            <option>3 hours</option>
                            <option>24 hours</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Buffer Time
                        </label>

                        <select
                            value={bookingRules.bufferTime}
                            onChange={(event) =>
                                setBookingRules({
                                    ...bookingRules,
                                    bufferTime: event.target.value,
                                })
                            }
                            className={smallSelectClass}
                        >
                            <option>15 minutes</option>
                            <option>30 minutes</option>
                            <option>60 minutes</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Require Deposit
                        </label>

                        <select
                            value={bookingRules.requireDeposit}
                            onChange={(event) =>
                                setBookingRules({
                                    ...bookingRules,
                                    requireDeposit: event.target.value,
                                })
                            }
                            className={smallSelectClass}
                        >
                            <option>Yes</option>
                            <option>No</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                            <Link className="h-4 w-4 text-primary" />
                            Booking Link
                        </label>

                        <input
                            value={bookingRules.bookingLink}
                            onChange={(event) =>
                                setBookingRules({
                                    ...bookingRules,
                                    bookingLink: event.target.value,
                                })
                            }
                            placeholder="https://calendly.com/your-business"
                            className={inputClass}
                        />
                    </div>
                </div>

                <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
                    <p className="text-sm font-medium text-primary">
                        Booking AI Behavior
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Lumora will use these rules before offering appointment
                        times or confirming bookings.
                    </p>
                </div>
            </div>
        </Card>
    );
};