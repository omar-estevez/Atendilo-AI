import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDashboardDataStore } from "@/store/dashboard/dashboardDataStore";
import { Calendar, Plus } from "lucide-react";
import { formatBookingDate, formatBookingTime, getBookingStatusClass } from "../helpers/BookingsMainHelpers";
import { useNavigate } from "react-router";

export const BookingsSection = () => {

    const navigate = useNavigate();

    const { bookings } = useDashboardDataStore();
    return (
        <Card className="border-border/50 overflow-hidden">
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <h3 className="font-semibold">Upcoming Bookings</h3>
                <Button onClick={() => navigate("/dashboard/bookings")} variant="ghost" size="sm">
                    <Plus className="w-4 h-4" />
                </Button>
            </div>

            <div className="divide-y divide-border/50">
                {bookings.length > 0 ? (
                    bookings.slice(0, 5).map((booking) => (
                        <div
                            key={booking.id}
                            className="flex items-center justify-between border-b border-border/50 px-4 py-4 last:border-0"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                                    <Calendar className="h-4 w-4 text-primary" />
                                </div>

                                <div>
                                    <p className="font-semibold">
                                        {booking.customer_name}
                                    </p>

                                    <p className="text-sm text-muted-foreground">
                                        {booking.service_name}
                                    </p>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {formatBookingDate(booking.scheduled_at)},{" "}
                                        {formatBookingTime(booking.scheduled_at)}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="font-semibold text-emerald-400">
                                    ${Number(booking.estimated_value).toLocaleString()}
                                </p>

                                <p
                                    className={`mt-1 text-xs capitalize ${getBookingStatusClass(
                                        booking.status
                                    )}`}
                                >
                                    {booking.status}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                        <Calendar className="mb-3 h-8 w-8 text-muted-foreground" />
                        <p className="text-sm font-medium">No bookings yet</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            New bookings will appear here once created manually or captured by AI.
                        </p>
                    </div>
                )}
            </div>
        </Card>
    )
}
