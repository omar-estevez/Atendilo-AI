import type { EscalationContactTypes, EscalationRuleKey } from "@/dashboard/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Phone, ShieldAlert, ToggleLeft, ToggleRight } from "lucide-react";
import type { Dispatch, ReactNode, SetStateAction } from "react";

interface EscalationRulesProps {
    sectionHeader: (
        icon: ReactNode,
        title: string,
        description?: string
    ) => ReactNode;
    inputClass: string;
    showSavedMessage?: (message: string) => void;
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
            description: "Escalate refund, cancellation or money-back requests.",
        },
        {
            key: "angry",
            label: "Customer is angry",
            description: "Escalate negative, aggressive or frustrated conversations.",
        },
        {
            key: "customPricing",
            label: "Customer requests custom pricing",
            description: "Escalate quotes that require manual review.",
        },
        {
            key: "human",
            label: "Customer wants a person",
            description: "Escalate when the customer asks for a human directly.",
        },
        {
            key: "lowConfidence",
            label: "AI confidence is below 70%",
            description: "Escalate when AI is not confident enough.",
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
        <Card className="overflow-hidden border-border/50 bg-card/60">
            <div className="border-b border-border/50 bg-background/30 p-5">
                {sectionHeader(
                    <ShieldAlert className="h-5 w-5" />,
                    "Escalation Rules",
                    "Decide when Atendilo should hand off the conversation to a human."
                )}
            </div>

            <div className="space-y-5 p-5">
                <div className="grid gap-3 md:grid-cols-2">
                    {rules.map((rule) => {
                        const isEnabled = escalationRules[rule.key];

                        return (
                            <div
                                key={rule.key}
                                className="flex items-start justify-between gap-3 rounded-xl border border-border/40 bg-background/40 p-4"
                            >
                                <div>
                                    <p className="font-medium">{rule.label}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {rule.description}
                                    </p>
                                    <p
                                        className={`mt-2 text-xs ${isEnabled
                                            ? "text-emerald-400"
                                            : "text-muted-foreground"
                                            }`}
                                    >
                                        {isEnabled ? "Enabled" : "Disabled"}
                                    </p>
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        toggleEscalationRule(rule.key)
                                    }
                                >
                                    {isEnabled ? (
                                        <ToggleRight className="h-7 w-7 text-primary" />
                                    ) : (
                                        <ToggleLeft className="h-7 w-7 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                        );
                    })}
                </div>

                <div className="rounded-2xl border border-border/50 bg-secondary/20 p-5">
                    <h4 className="mb-4 font-semibold">Escalation Contact</h4>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                                <Phone className="h-4 w-4 text-primary" />
                                Phone Number
                            </label>

                            <input
                                type="tel"
                                value={escalationContact.phone}
                                onChange={(event) =>
                                    setEscalationContact({
                                        ...escalationContact,
                                        phone: event.target.value,
                                    })
                                }
                                placeholder="+1 346 000 0000"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                                <Mail className="h-4 w-4 text-primary" />
                                Email
                            </label>

                            <input
                                type="email"
                                value={escalationContact.email}
                                onChange={(event) =>
                                    setEscalationContact({
                                        ...escalationContact,
                                        email: event.target.value,
                                    })
                                }
                                placeholder="owner@business.com"
                                className={inputClass}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};