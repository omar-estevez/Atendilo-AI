import { X, Brain, Clock, User, Radio } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AIActivity } from "@/dashboard/types/activity"

interface ViewActivityModalProps {
    open: boolean
    activity: AIActivity | null
    onClose: () => void
}

export const ViewActivityModal = ({
    open,
    activity,
    onClose,
}: ViewActivityModalProps) => {
    if (!open || !activity) return null

    const statusClass =
        activity.status === "completed"
            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
            : activity.status === "pending"
                ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                : "bg-red-500/20 text-red-400 border-red-500/30"

    const formatChannel = (channel: string) => {
        if (channel === "webchat") return "Web Chat"
        if (channel === "voice") return "Voice AI"
        if (channel === "sms") return "SMS"
        return channel.charAt(0).toUpperCase() + channel.slice(1)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
            <div className="w-full max-w-2xl rounded-2xl border border-border/60 bg-background shadow-2xl">
                <div className="flex items-start justify-between border-b border-border/60 p-5">
                    <div>
                        <h2 className="text-xl font-bold">{activity.action}</h2>
                        <p className="text-sm text-muted-foreground">
                            AI activity details and execution context.
                        </p>
                    </div>

                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="space-y-5 p-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded-xl border border-border/60 bg-secondary/20 p-4">
                            <div className="mb-2 flex items-center gap-2">
                                <User className="h-4 w-4 text-primary" />
                                <p className="text-sm font-medium">Customer</p>
                            </div>
                            <p className="font-semibold">{activity.customer}</p>
                        </div>

                        <div className="rounded-xl border border-border/60 bg-secondary/20 p-4">
                            <div className="mb-2 flex items-center gap-2">
                                <Radio className="h-4 w-4 text-primary" />
                                <p className="text-sm font-medium">Channel</p>
                            </div>
                            <p className="font-semibold">{formatChannel(activity.channel)}</p>
                        </div>

                        <div className="rounded-xl border border-border/60 bg-secondary/20 p-4">
                            <div className="mb-2 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" />
                                <p className="text-sm font-medium">Time</p>
                            </div>
                            <p className="font-semibold">{activity.time}</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border/60 bg-secondary/20 p-4">
                        <p className="mb-2 text-sm font-medium">Status</p>
                        <span className={`inline-flex rounded-full border px-2 py-1 text-xs capitalize ${statusClass}`}>
                            {activity.status}
                        </span>
                    </div>

                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                        <div className="mb-2 flex items-center gap-2">
                            <Brain className="h-4 w-4 text-primary" />
                            <p className="font-medium text-primary">AI Details</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{activity.details}</p>
                    </div>

                    <div className="rounded-xl border border-border/60 bg-secondary/20 p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium">AI Confidence</p>
                            <span className="text-sm font-semibold">{activity.confidence}%</span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-secondary">
                            <div
                                className={`h-full rounded-full ${activity.confidence >= 90
                                    ? "bg-emerald-400"
                                    : activity.confidence >= 75
                                        ? "bg-amber-400"
                                        : "bg-red-400"
                                    }`}
                                style={{ width: `${activity.confidence}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end border-t border-border/60 p-5">
                    <Button onClick={onClose} className="bg-primary hover:bg-primary/90">
                        Close
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ViewActivityModal