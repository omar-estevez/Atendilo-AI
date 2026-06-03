import { useState } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BusinessProfile } from "./business-profile/BusinessProfile";
import { ServicesPricing } from "./services-pricing/ServicesPricing";
import { BusinessHours } from "./business-hours/BusinessHours";
import { AiAssistant } from "./ai-assistant/AiAssistant";
import { BusinessFaqs } from "./business-faqs/BusinessFaqs";
import { BookingRules } from "./booking-rules/BookingRules";
import { EscalationRules } from "./escalation-rules/EscalationRules";
import { useAuthStore } from "@/store/authStore";

import type {
    AiAssistantType,
    BusinessBookingTypes,
    BusinessDay,
    BusinessFaq,
    BusinessNewFaq,
    BusinessNewService,
    BusinessProfileType,
    BusinessService,
    EscalationContactTypes,
    EscalationRuleKey,
} from "@/dashboard/types";
import { toast } from "sonner";
import { AiKnowledge } from "./ai-knowledge/AiKnowledge";

type BusinessSettings = {
    services?: BusinessService[];
    businessHours?: BusinessDay[];
    aiAssistant?: AiAssistantType;
    faqs?: BusinessFaq[];
    bookingRules?: BusinessBookingTypes;
    escalationRules?: Record<EscalationRuleKey, boolean>;
    escalationContact?: EscalationContactTypes;
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

const defaultFaqs: BusinessFaq[] = [
    {
        id: "faq_001",
        question: "Do you go to the customer’s location?",
        answer:
            "Yes, we provide mobile service in Houston and surrounding areas.",
    },
    {
        id: "faq_002",
        question: "What payment methods do you accept?",
        answer: "We accept cash, Zelle, and card payments.",
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

const defaultAiAssistant: AiAssistantType = {
    name: "Sofia",
    tone: "Friendly",
    goal: "Capture leads and book appointments",
    language: "English",
    responseStyle: "Short, clear, sales-focused",
    instructions:
        "Always greet customers politely. Ask what service they need, what vehicle or project they have, and their preferred date/time. If the customer asks for pricing, provide starting prices and offer to book an appointment. If the customer sounds upset, escalate to a human.",
};

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

    const { business, updateBusiness } = useAuthStore()

    const settings = (business?.settings || {}) as BusinessSettings;

    const [businessProfile, setBusinessProfile] =
        useState<BusinessProfileType>({
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
        settings.businessHours?.length
            ? settings.businessHours
            : defaultHours
    );

    const [aiAssistant, setAiAssistant] = useState<AiAssistantType>({
        ...defaultAiAssistant,
        ...(settings.aiAssistant || {}),
    });

    const [faqs, setFaqs] = useState<BusinessFaq[]>(
        settings.faqs?.length ? settings.faqs : defaultFaqs
    );

    const [newFaq, setNewFaq] = useState<BusinessNewFaq>({
        question: "",
        answer: "",
    });

    const [bookingRules, setBookingRules] =
        useState<BusinessBookingTypes>({
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

    const showSavedMessage = (message: string) => {
        toast.success(message)
    };

    const sectionHeader = (
        icon: React.ReactNode,
        title: string,
        description?: string
    ) => (
        <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {icon}
            </div>

            <div>
                <h3 className="font-semibold">{title}</h3>
                {description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                        {description}
                    </p>
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
                    aiAssistant,
                    faqs,
                    bookingRules,
                    escalationRules,
                    escalationContact,
                },
            });

            showSavedMessage("Business settings saved successfully");
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

    const addFaq = () => {
        if (!newFaq.question.trim() || !newFaq.answer.trim()) return;

        const faq: BusinessFaq = {
            id: `faq_${Date.now()}`,
            question: newFaq.question.trim(),
            answer: newFaq.answer.trim(),
        };

        setFaqs((current) => [faq, ...current]);

        setNewFaq({
            question: "",
            answer: "",
        });
    };

    const deleteFaq = (faqId: string) => {
        setFaqs((current) => current.filter((faq) => faq.id !== faqId));
    };

    const toggleEscalationRule = (rule: EscalationRuleKey) => {
        setEscalationRules((current) => ({
            ...current,
            [rule]: !current[rule],
        }));
    };

    return (
        <div className="space-y-6 px-5 py-6 sm:px-7 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="text-2xl font-bold">
                        Business Settings
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        Configure the information Atendilo uses to answer customers,
                        quote services, book appointments, and escalate cases.
                    </p>
                </div>

                <Button
                    onClick={handleSaveAll}
                    disabled={isSaving}
                    className="bg-primary hover:bg-primary/90"
                >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save All Changes"}
                </Button>
            </div>

            {formError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                    <p className="text-sm text-red-400">{formError}</p>
                </div>
            )}

            <BusinessProfile
                businessProfile={businessProfile}
                setBusinessProfile={setBusinessProfile}
                inputClass={inputClass}
                sectionHeader={sectionHeader}
                showSavedMessage={showSavedMessage}
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

            <AiAssistant
                sectionHeader={sectionHeader}
                aiAssistant={aiAssistant}
                setAiAssistant={setAiAssistant}
                inputClass={inputClass}
                smallSelectClass={smallSelectClass}
                showSavedMessage={showSavedMessage}
            />

            <BusinessFaqs
                sectionHeader={sectionHeader}
                faqs={faqs}
                newFaq={newFaq}
                setNewFaq={setNewFaq}
                inputClass={inputClass}
                addFaq={addFaq}
                deleteFaq={deleteFaq}
            />

            <AiKnowledge
                sectionHeader={sectionHeader}
                inputClass={inputClass}
                smallSelectClass={smallSelectClass}
            />

            <BookingRules
                sectionHeader={sectionHeader}
                bookingRules={bookingRules}
                setBookingRules={setBookingRules}
                inputClass={inputClass}
                smallSelectClass={smallSelectClass}
                showSavedMessage={showSavedMessage}
            />

            <EscalationRules
                sectionHeader={sectionHeader}
                escalationRules={escalationRules}
                toggleEscalationRule={toggleEscalationRule}
                escalationContact={escalationContact}
                setEscalationContact={setEscalationContact}
                inputClass={inputClass}
                showSavedMessage={showSavedMessage}
            />
        </div>
    );
};

export default BusinessPage;