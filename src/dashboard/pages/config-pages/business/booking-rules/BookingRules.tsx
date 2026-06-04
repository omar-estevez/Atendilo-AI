import type { Dispatch, ReactNode, SetStateAction } from "react";
import { CalendarClock, Link } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { BusinessBookingTypes } from "@/dashboard/types";

interface BookingRulesProps {
    sectionHeader: (
        icon: ReactNode,
        title: string,
        description?: string
    ) => ReactNode;
    inputClass: string;
    smallSelectClass: string;
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
        <Card className="border-border/60 bg-card/80 p-6">
            {sectionHeader(
                <CalendarClock className="h-5 w-5 text-primary" />,
                "Booking Settings",
                "Operational booking rules used by Atendilo when collecting appointment details. Long booking explanations should go in AI Knowledge."
            )}

            <div className="grid gap-4 md:grid-cols-3">
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
                    <label className="mb-2 block text-sm font-medium">Buffer Time</label>
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
            </div>

            <div className="mt-4">
                <label className="mb-2 block text-sm font-medium">Booking Link</label>
                <div className="relative">
                    <Link className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        value={bookingRules.bookingLink}
                        onChange={(event) =>
                            setBookingRules({
                                ...bookingRules,
                                bookingLink: event.target.value,
                            })
                        }
                        placeholder="https://calendly.com/your-business"
                        className={`${inputClass} pl-10`}
                    />
                </div>
            </div>

            <div className="mt-5 rounded-2xl border border-border bg-background/50 p-4">
                <h4 className="font-semibold">How Atendilo uses this</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                    The AI can use these settings when asking for date, time, service, and
                    contact details. Policies or special booking conditions should be
                    added in AI Knowledge.
                </p>
            </div>
        </Card>
    );
};