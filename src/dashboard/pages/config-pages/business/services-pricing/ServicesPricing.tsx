import type { Dispatch, ReactNode, SetStateAction } from "react";
import { DollarSign, Plus, Timer, Toolbox, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { BusinessNewService, BusinessService } from "@/dashboard/types";

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
        <Card className="border-border/60 bg-card/80 p-6">
            {sectionHeader(
                <Toolbox className="h-5 w-5 text-primary" />,
                "Services & Pricing",
                "Structured services used by Atendilo for AI replies, bookings, quotes, and reporting. Do not repeat these in AI Knowledge unless there are special conditions."
            )}

            <div className="space-y-4">
                {services.length > 0 ? (
                    <div className="grid gap-3">
                        {services.map((service) => (
                            <div
                                key={service.id}
                                className="rounded-2xl border border-border bg-background/50 p-4"
                            >
                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <h4 className="font-semibold">{service.name}</h4>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {service.description}
                                        </p>

                                        <div className="mt-3 flex flex-wrap gap-2 text-sm">
                                            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-primary">
                                                <DollarSign className="mr-1 h-4 w-4" />
                                                {service.price}
                                            </span>

                                            <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-muted-foreground">
                                                <Timer className="mr-1 h-4 w-4" />
                                                {service.durationMinutes} min
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
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
                    <div className="rounded-2xl border border-dashed border-border bg-background/40 p-8 text-center">
                        <Toolbox className="mx-auto h-8 w-8 text-muted-foreground" />
                        <h4 className="mt-3 font-semibold">No services yet</h4>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Add services so Atendilo can quote customers and create better
                            booking requests.
                        </p>
                    </div>
                )}

                <div className="rounded-2xl border border-border bg-background/50 p-4">
                    <h4 className="mb-4 font-semibold">Add New Service</h4>

                    <div className="grid gap-4 md:grid-cols-3">
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
                                placeholder="Wash + Vacuum"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">Price</label>
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
                                placeholder="60"
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
                                        durationMinutes: event.target.value,
                                    })
                                }
                                placeholder="60"
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="mb-2 block text-sm font-medium">
                            Service Description
                        </label>
                        <textarea
                            value={newService.description}
                            onChange={(event) =>
                                setNewService({
                                    ...newService,
                                    description: event.target.value,
                                })
                            }
                            placeholder="What is included in this service?"
                            rows={4}
                            className={`${inputClass} resize-none`}
                        />
                    </div>

                    <div className="mt-4 flex justify-end">
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