import { useState, type ReactNode } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

import { BusinessProfile } from "./business-profile/BusinessProfile";
import { ServicesPricing } from "./services-pricing/ServicesPricing";
import { BusinessHours } from "./business-hours/BusinessHours";
import { BookingRules } from "./booking-rules/BookingRules";
import { EscalationRules } from "./escalation-rules/EscalationRules";
import { AiKnowledge } from "./ai-knowledge/AiKnowledge";

import type {
    BusinessBookingTypes,
    BusinessDay,
    BusinessNewService,
    BusinessProfileType,
    BusinessService,
    EscalationContactTypes,
    EscalationRuleKey,
} from "@/dashboard/types";

type BusinessSettings = {
    services?: BusinessService[];
    businessHours?: BusinessDay[];
    bookingRules?: BusinessBookingTypes;
    escalationRules?: Record<EscalationRuleKey, boolean>;
    escalationContact?: EscalationContactTypes;

    // Legacy fields kept only to avoid breaking old businesses that still have them in settings.
    aiAssistant?: unknown;
    faqs?: unknown;
};

const defaultServices: BusinessService[] = [
    {
        id: "service_001",
        name: "Full Detail",
        description: "Complete interior and exterior detail.",
        price: 149,
        durationMinutes: 150,
    },
];

const defaultHours: BusinessDay[] = [
    { day: "Monday", open: "09:00", close: "18:00", enabled: true },
    { day: "Tuesday", open: "09:00", close: "18:00", enabled: true },
    { day: "Wednesday", open: "09:00", close: "18:00", enabled: true },
    { day: "Thursday", open: "09:00", close: "18:00", enabled: true },
    { day: "Friday", open: "09:00", close: "18:00", enabled: true },
    { day: "Saturday", open: "09:00", close: "18:00", enabled: true },
    { day: "Sunday", open: "09:00", close: "18:00", enabled: false },
];

const defaultBookingRules: BusinessBookingTypes = {
    minimumNotice: "1 hour",
    bufferTime: "15 minutes",
    requireDeposit: "Yes",
    bookingLink: "",
};

const defaultEscalationRules: Record<EscalationRuleKey, boolean> = {
    refund: true,
    angry: true,
    customPricing: true,
    human: true,
    lowConfidence: true,
};

const defaultEscalationContact: EscalationContactTypes = {
    phone: "",
    email: "",
};

export const BusinessPage = () => {
    const { business, updateBusiness } = useAuthStore();

    const settings = (business?.settings || {}) as BusinessSettings;

    const [businessProfile, setBusinessProfile] = useState<BusinessProfileType>({
        businessName: business?.name || "",
        industry: business?.industry || "",
        address: business?.address || "",
        city: business?.city || "",
        state: business?.state || "",
        country: business?.country || "United States",
        timezone: business?.timezone || "America/Chicago",
        email: business?.email || "",
        phone: business?.phone || "",
        website: business?.website || "",
    });

    const [services, setServices] = useState<BusinessService[]>(
        settings.services?.length ? settings.services : defaultServices
    );

    const [newService, setNewService] = useState<BusinessNewService>({
        name: "",
        description: "",
        price: "",
        durationMinutes: "",
    });

    const [businessHours, setBusinessHours] = useState<BusinessDay[]>(
        settings.businessHours?.length ? settings.businessHours : defaultHours
    );

    const [bookingRules, setBookingRules] = useState<BusinessBookingTypes>({
        ...defaultBookingRules,
        ...(settings.bookingRules || {}),
    });

    const [escalationRules, setEscalationRules] = useState<
        Record<EscalationRuleKey, boolean>
    >({
        ...defaultEscalationRules,
        ...(settings.escalationRules || {}),
    });

    const [escalationContact, setEscalationContact] =
        useState<EscalationContactTypes>({
            ...defaultEscalationContact,
            ...(settings.escalationContact || {}),
        });

    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const inputClass =
        "w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

    const smallSelectClass =
        "h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary";

    const sectionHeader = (
        icon: ReactNode,
        title: string,
        description?: string
    ) => (
        <div className="mb-5 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                {icon}
            </div>

            <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                {description && (
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                )}
            </div>
        </div>
    );

    const handleSaveAll = async () => {
        if (!businessProfile.businessName.trim()) {
            setFormError("Business name is required.");
            return;
        }

        try {
            setIsSaving(true);
            setFormError(null);

            await updateBusiness({
                name: businessProfile.businessName.trim(),
                industry: businessProfile.industry.trim() || null,
                address: businessProfile.address.trim() || null,
                city: businessProfile.city.trim() || null,
                state: businessProfile.state.trim() || null,
                country: businessProfile.country.trim() || null,
                timezone: businessProfile.timezone.trim() || null,
                email: businessProfile.email.trim() || null,
                phone: businessProfile.phone.trim() || null,
                website: businessProfile.website.trim() || null,

                settings: {
                    services,
                    businessHours,
                    bookingRules,
                    escalationRules,
                    escalationContact,
                },
            });

            toast.success("Business settings saved successfully");
        } catch (error) {
            setFormError(
                error instanceof Error
                    ? error.message
                    : "Failed to save business settings"
            );
        } finally {
            setIsSaving(false);
        }
    };

    const addService = () => {
        if (
            !newService.name.trim() ||
            !newService.description.trim() ||
            !newService.price ||
            !newService.durationMinutes
        ) {
            return;
        }

        const service: BusinessService = {
            id: `service_${Date.now()}`,
            name: newService.name.trim(),
            description: newService.description.trim(),
            price: Number(newService.price),
            durationMinutes: Number(newService.durationMinutes),
        };

        setServices((current) => [service, ...current]);

        setNewService({
            name: "",
            description: "",
            price: "",
            durationMinutes: "",
        });
    };

    const deleteService = (serviceId: string) => {
        setServices((current) =>
            current.filter((service) => service.id !== serviceId)
        );
    };

    const updateBusinessHour = (
        day: string,
        field: keyof Omit<BusinessDay, "day">,
        value: string | boolean
    ) => {
        setBusinessHours((current) =>
            current.map((item) =>
                item.day === day ? { ...item, [field]: value } : item
            )
        );
    };

    const toggleEscalationRule = (rule: EscalationRuleKey) => {
        setEscalationRules((current) => ({
            ...current,
            [rule]: !current[rule],
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Business Settings</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Configure the business data Atendilo uses for AI replies, bookings,
                        quotes, schedules, and human handoff.
                    </p>
                </div>

                <Button
                    type="button"
                    onClick={handleSaveAll}
                    disabled={isSaving}
                    className="bg-primary hover:bg-primary/90"
                >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save All Changes"}
                </Button>
            </div>

            {formError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {formError}
                </div>
            )}

            <BusinessProfile
                businessProfile={businessProfile}
                setBusinessProfile={setBusinessProfile}
                inputClass={inputClass}
                sectionHeader={sectionHeader}
            />

            <ServicesPricing
                sectionHeader={sectionHeader}
                services={services}
                deleteService={deleteService}
                newService={newService}
                setNewService={setNewService}
                inputClass={inputClass}
                addService={addService}
            />

            <BusinessHours
                sectionHeader={sectionHeader}
                businessHours={businessHours}
                updateBusinessHour={updateBusinessHour}
            />

            <BookingRules
                sectionHeader={sectionHeader}
                bookingRules={bookingRules}
                setBookingRules={setBookingRules}
                inputClass={inputClass}
                smallSelectClass={smallSelectClass}
            />

            <AiKnowledge
                sectionHeader={sectionHeader}
                inputClass={inputClass}
                smallSelectClass={smallSelectClass}
            />

            <EscalationRules
                sectionHeader={sectionHeader}
                escalationRules={escalationRules}
                toggleEscalationRule={toggleEscalationRule}
                escalationContact={escalationContact}
                setEscalationContact={setEscalationContact}
                inputClass={inputClass}
            />
        </div>
    );
};

export default BusinessPage;