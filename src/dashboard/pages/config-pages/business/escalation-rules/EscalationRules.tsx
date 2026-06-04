import type { Dispatch, ReactNode, SetStateAction } from "react";
import {
    Mail,
    Phone,
    ShieldAlert,
    ToggleLeft,
    ToggleRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type {
    EscalationContactTypes,
    EscalationRuleKey,
} from "@/dashboard/types";

interface EscalationRulesProps {
    sectionHeader: (
        icon: ReactNode,
        title: string,
        description?: string
    ) => ReactNode;
    inputClass: string;
    escalationContact: EscalationContactTypes;
    setEscalationContact: Dispatch<SetStateAction<EscalationContactTypes>>;
    escalationRules: Record<EscalationRuleKey, boolean>;
    toggleEscalationRule: (rule: EscalationRuleKey) => void;
}

const rules: {
    key: EscalationRuleKey;
    label: string;
    description: string;
}[] = [
        {
            key: "refund",
            label: "Customer asks for refund",
            description: "Hand off refund, cancellation, or money-back requests.",
        },
        {
            key: "angry",
            label: "Customer is angry",
            description: "Hand off negative, aggressive, or frustrated conversations.",
        },
        {
            key: "customPricing",
            label: "Customer requests custom pricing",
            description: "Hand off quotes that require manual review.",
        },
        {
            key: "human",
            label: "Customer wants a person",
            description: "Hand off when the customer asks for a human directly.",
        },
        {
            key: "lowConfidence",
            label: "AI confidence is below 70%",
            description: "Hand off when AI is not confident enough.",
        },
    ];

export const EscalationRules = ({
    sectionHeader,
    inputClass,
    escalationContact,
    setEscalationContact,
    escalationRules,
    toggleEscalationRule,
}: EscalationRulesProps) => {
    return (
        <Card className="border-border/60 bg-card/80 p-6">
            {sectionHeader(
                <ShieldAlert className="h-5 w-5 text-primary" />,
                "Human Handoff Rules",
                "Decide when Atendilo should stop handling the conversation alone and alert a human."
            )}

            <div className="space-y-3">
                {rules.map((rule) => {
                    const isEnabled = escalationRules[rule.key];

                    return (
                        <div
                            key={rule.key}
                            className="flex flex-col gap-3 rounded-2xl border border-border bg-background/50 p-4 md:flex-row md:items-center md:justify-between"
                        >
                            <div>
                                <h4 className="font-semibold">{rule.label}</h4>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {rule.description}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground">
                                    {isEnabled ? "Enabled" : "Disabled"}
                                </span>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => toggleEscalationRule(rule.key)}
                                >
                                    {isEnabled ? (
                                        <ToggleRight className="h-6 w-6 text-primary" />
                                    ) : (
                                        <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-background/50 p-4">
                <h4 className="mb-4 font-semibold">Human Handoff Contact</h4>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Phone Number
                        </label>
                        <div className="relative">
                            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                value={escalationContact.phone}
                                onChange={(event) =>
                                    setEscalationContact({
                                        ...escalationContact,
                                        phone: event.target.value,
                                    })
                                }
                                placeholder="+1 346 000 0000"
                                className={`${inputClass} pl-10`}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">Email</label>
                        <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                value={escalationContact.email}
                                onChange={(event) =>
                                    setEscalationContact({
                                        ...escalationContact,
                                        email: event.target.value,
                                    })
                                }
                                placeholder="owner@business.com"
                                className={`${inputClass} pl-10`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};