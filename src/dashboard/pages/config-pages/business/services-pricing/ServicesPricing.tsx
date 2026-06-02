import type { BusinessNewService, BusinessService } from "@/dashboard/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DollarSign, Plus, Timer, Toolbox, Trash2 } from "lucide-react";
import type { Dispatch, ReactNode, SetStateAction } from "react";

interface ServicesProps {
    sectionHeader: (
        icon: ReactNode,
        title: string,
        description?: string
    ) => ReactNode;
    services: BusinessService[];
    deleteService: (serviceId: string) => void;
    newService: BusinessNewService;
    setNewService: Dispatch<SetStateAction<BusinessNewService>>;
    inputClass: string;
    addService: () => void;
}

export const ServicesPricing = ({
    sectionHeader,
    services,
    deleteService,
    newService,
    setNewService,
    inputClass,
    addService,
}: ServicesProps) => {
    const canAddService =
        newService.name.trim() &&
        newService.description.trim() &&
        newService.price &&
        newService.durationMinutes;

    return (
        <Card className="overflow-hidden border-border/50 bg-card/60">
            <div className="border-b border-border/50 bg-background/30 p-5">
                {sectionHeader(
                    <Toolbox className="h-5 w-5" />,
                    "Services & Pricing",
                    "Services the AI can quote, recommend, and use when creating bookings."
                )}
            </div>

            <div className="space-y-5 p-5">
                {services.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2">
                        {services.map((service) => (
                            <div
                                key={service.id}
                                className="rounded-xl border border-border/50 bg-background/40 p-4"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="mb-1 flex items-center gap-2 text-primary">
                                            <Toolbox className="h-4 w-4" />
                                            <p className="truncate font-semibold">
                                                {service.name}
                                            </p>
                                        </div>

                                        <p className="line-clamp-2 text-sm text-muted-foreground">
                                            {service.description}
                                        </p>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400">
                                                <DollarSign className="h-3.5 w-3.5" />
                                                {service.price}
                                            </span>

                                            <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs text-primary">
                                                <Timer className="h-3.5 w-3.5" />
                                                {service.durationMinutes} min
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteService(service.id)}
                                        className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-border/60 p-6 text-center">
                        <Toolbox className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                        <p className="font-medium">No services yet</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Add at least one service so Atendilo can quote customers.
                        </p>
                    </div>
                )}

                <div className="rounded-2xl border border-border/50 bg-secondary/20 p-5">
                    <h4 className="mb-4 font-semibold">Add New Service</h4>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Service Name
                            </label>

                            <input
                                value={newService.name}
                                onChange={(event) =>
                                    setNewService({
                                        ...newService,
                                        name: event.target.value,
                                    })
                                }
                                placeholder="Interior Cleaning"
                                className={inputClass}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Price
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={newService.price}
                                    onChange={(event) =>
                                        setNewService({
                                            ...newService,
                                            price: event.target.value,
                                        })
                                    }
                                    placeholder="149"
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Duration Minutes
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={newService.durationMinutes}
                                    onChange={(event) =>
                                        setNewService({
                                            ...newService,
                                            durationMinutes:
                                                event.target.value,
                                        })
                                    }
                                    placeholder="120"
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Service Description
                            </label>

                            <textarea
                                rows={3}
                                value={newService.description}
                                onChange={(event) =>
                                    setNewService({
                                        ...newService,
                                        description: event.target.value,
                                    })
                                }
                                placeholder="Professional vehicle detailing service."
                                className={`${inputClass} resize-none`}
                            />
                        </div>

                        <Button
                            type="button"
                            onClick={addService}
                            disabled={!canAddService}
                            className="bg-primary hover:bg-primary/90"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Service
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};