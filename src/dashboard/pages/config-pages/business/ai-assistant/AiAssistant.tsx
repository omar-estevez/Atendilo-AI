import type { AiAssistantType } from "@/dashboard/types";
import { Card } from "@/components/ui/card";
import { Brain, MessageSquareText, Sparkles } from "lucide-react";
import type { Dispatch, ReactNode, SetStateAction } from "react";

interface AiAssistantProps {
    sectionHeader: (
        icon: ReactNode,
        title: string,
        description?: string
    ) => ReactNode;
    aiAssistant: AiAssistantType;
    setAiAssistant: Dispatch<SetStateAction<AiAssistantType>>;
    inputClass: string;
    smallSelectClass: string;
    showSavedMessage?: (message: string) => void;
}

export const AiAssistant = ({
    sectionHeader,
    aiAssistant,
    setAiAssistant,
    inputClass,
    smallSelectClass,
}: AiAssistantProps) => {
    return (
        <Card className="overflow-hidden border-border/50 bg-card/60">
            <div className="border-b border-border/50 bg-background/30 p-5">
                {sectionHeader(
                    <Brain className="h-5 w-5" />,
                    "AI Assistant",
                    "Define how Lumora should speak, sell, book, and escalate."
                )}
            </div>

            <div className="space-y-5 p-5">
                <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
                    <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <Sparkles className="h-4 w-4" />
                        AI Behavior
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        These settings will become part of the AI system context
                        when replying to customers.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            AI Assistant Name
                        </label>

                        <input
                            value={aiAssistant.name}
                            onChange={(event) =>
                                setAiAssistant({
                                    ...aiAssistant,
                                    name: event.target.value,
                                })
                            }
                            placeholder="Sofia"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Tone
                        </label>

                        <select
                            value={aiAssistant.tone}
                            onChange={(event) =>
                                setAiAssistant({
                                    ...aiAssistant,
                                    tone: event.target.value,
                                })
                            }
                            className={smallSelectClass}
                        >
                            <option>Friendly</option>
                            <option>Professional</option>
                            <option>Sales-focused</option>
                            <option>Luxury</option>
                            <option>Casual</option>
                            <option>Bilingual</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Main Goal
                        </label>

                        <input
                            value={aiAssistant.goal}
                            onChange={(event) =>
                                setAiAssistant({
                                    ...aiAssistant,
                                    goal: event.target.value,
                                })
                            }
                            placeholder="Capture leads and book appointments"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Language
                        </label>

                        <select
                            value={aiAssistant.language}
                            onChange={(event) =>
                                setAiAssistant({
                                    ...aiAssistant,
                                    language: event.target.value,
                                })
                            }
                            className={smallSelectClass}
                        >
                            <option>English</option>
                            <option>Spanish</option>
                            <option>Bilingual</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Response Style
                    </label>

                    <input
                        value={aiAssistant.responseStyle}
                        onChange={(event) =>
                            setAiAssistant({
                                ...aiAssistant,
                                responseStyle: event.target.value,
                            })
                        }
                        placeholder="Short, clear, sales-focused"
                        className={inputClass}
                    />
                </div>

                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                        <MessageSquareText className="h-4 w-4 text-primary" />
                        AI Instructions
                    </label>

                    <textarea
                        rows={6}
                        value={aiAssistant.instructions}
                        onChange={(event) =>
                            setAiAssistant({
                                ...aiAssistant,
                                instructions: event.target.value,
                            })
                        }
                        placeholder="Tell Lumora how to respond to customers..."
                        className={`${inputClass} resize-none`}
                    />
                </div>
            </div>
        </Card>
    );
};