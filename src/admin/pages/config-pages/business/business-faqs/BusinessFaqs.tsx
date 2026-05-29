import type { BusinessFaq, BusinessNewFaq } from "@/admin/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CircleQuestionMark, Plus, Trash2 } from "lucide-react";
import type { Dispatch, ReactNode, SetStateAction } from "react";

interface FaqsProps {
    sectionHeader: (
        icon: ReactNode,
        title: string,
        description?: string
    ) => ReactNode;
    faqs: BusinessFaq[];
    deleteFaq: (faqId: string) => void;
    newFaq: BusinessNewFaq;
    setNewFaq: Dispatch<SetStateAction<BusinessNewFaq>>;
    inputClass: string;
    addFaq: () => void;
}

export const BusinessFaqs = ({
    sectionHeader,
    faqs,
    deleteFaq,
    newFaq,
    setNewFaq,
    inputClass,
    addFaq,
}: FaqsProps) => {
    return (
        <Card className="overflow-hidden border-border/50 bg-card/60">
            <div className="border-b border-border/50 bg-background/30 p-5">
                {sectionHeader(
                    <CircleQuestionMark className="h-5 w-5" />,
                    "FAQs",
                    "Common questions Lumora can answer automatically."
                )}
            </div>

            <div className="space-y-5 p-5">
                {faqs.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2">
                        {faqs.map((faq) => (
                            <div
                                key={faq.id}
                                className="rounded-xl border border-border/50 bg-background/40 p-4"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="mb-2 flex items-center gap-2 text-primary">
                                            <CircleQuestionMark className="h-4 w-4" />
                                            <p className="font-medium">
                                                {faq.question}
                                            </p>
                                        </div>

                                        <p className="text-sm text-muted-foreground">
                                            {faq.answer}
                                        </p>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteFaq(faq.id)}
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
                        <CircleQuestionMark className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                        <p className="font-medium">No FAQs yet</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Add FAQs so the AI can answer common questions faster.
                        </p>
                    </div>
                )}

                <div className="rounded-2xl border border-border/50 bg-secondary/20 p-5">
                    <h4 className="mb-4 font-semibold">Add New Question</h4>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Question
                            </label>

                            <input
                                value={newFaq.question}
                                onChange={(event) =>
                                    setNewFaq({
                                        ...newFaq,
                                        question: event.target.value,
                                    })
                                }
                                placeholder="Do you offer same-day service?"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Answer
                            </label>

                            <textarea
                                rows={3}
                                value={newFaq.answer}
                                onChange={(event) =>
                                    setNewFaq({
                                        ...newFaq,
                                        answer: event.target.value,
                                    })
                                }
                                placeholder="Write the answer customers should receive."
                                className={`${inputClass} resize-none`}
                            />
                        </div>

                        <Button
                            type="button"
                            onClick={addFaq}
                            disabled={
                                !newFaq.question.trim() ||
                                !newFaq.answer.trim()
                            }
                            className="bg-primary hover:bg-primary/90"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Question
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};