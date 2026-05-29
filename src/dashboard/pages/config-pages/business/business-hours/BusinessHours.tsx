import type { BusinessDay } from "@/dashboard/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, ToggleLeft, ToggleRight } from "lucide-react";
import type { ReactNode } from "react";

interface BusinessHoursProps {
    sectionHeader: (
        icon: ReactNode,
        title: string,
        description?: string
    ) => ReactNode;
    businessHours: BusinessDay[];
    updateBusinessHour: (
        day: string,
        field: keyof Omit<BusinessDay, "day">,
        value: string | boolean
    ) => void;
}

export const BusinessHours = ({
    sectionHeader,
    businessHours,
    updateBusinessHour,
}: BusinessHoursProps) => {
    return (
        <Card className="overflow-hidden border-border/50 bg-card/60">
            <div className="border-b border-border/50 bg-background/30 p-5">
                {sectionHeader(
                    <Clock className="h-5 w-5" />,
                    "Business Hours",
                    "Set when Lumora can offer appointments or mark the business as closed."
                )}
            </div>

            <div className="space-y-3 p-5">
                {businessHours.map((item) => (
                    <div
                        key={item.day}
                        className="flex flex-col gap-3 rounded-xl border border-border/40 bg-background/40 p-4 md:flex-row md:items-center md:justify-between"
                    >
                        <div>
                            <p className="font-medium">{item.day}</p>
                            <p
                                className={`text-xs ${item.enabled
                                    ? "text-emerald-400"
                                    : "text-muted-foreground"
                                    }`}
                            >
                                {item.enabled ? "Open" : "Closed"}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <input
                                type="time"
                                value={item.open}
                                disabled={!item.enabled}
                                onChange={(event) =>
                                    updateBusinessHour(
                                        item.day,
                                        "open",
                                        event.target.value
                                    )
                                }
                                className="h-10 rounded-lg border border-border/50 bg-secondary/50 px-3 text-sm outline-none disabled:opacity-40"
                            />

                            <span className="text-muted-foreground">-</span>

                            <input
                                type="time"
                                value={item.close}
                                disabled={!item.enabled}
                                onChange={(event) =>
                                    updateBusinessHour(
                                        item.day,
                                        "close",
                                        event.target.value
                                    )
                                }
                                className="h-10 rounded-lg border border-border/50 bg-secondary/50 px-3 text-sm outline-none disabled:opacity-40"
                            />

                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    updateBusinessHour(
                                        item.day,
                                        "enabled",
                                        !item.enabled
                                    )
                                }
                            >
                                {item.enabled ? (
                                    <ToggleRight className="h-7 w-7 text-primary" />
                                ) : (
                                    <ToggleLeft className="h-7 w-7 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};