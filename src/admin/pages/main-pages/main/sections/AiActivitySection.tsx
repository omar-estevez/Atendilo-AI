import { Card } from "@/components/ui/card";
import { useDashboardDataStore } from "@/store/dashboard/dashboardDataStore";
import { AnimatePresence } from "framer-motion";
import { Activity, Bot } from "lucide-react";
import { getActivityStatusClass, getActivityIcon, formatActivityTime } from "../helpers/ActivityMainHelpers";

export const AiActivitySection = () => {

    const { aiActivityLogs } = useDashboardDataStore();

    return (
        <Card className="lg:col-span-1 border-border/50 overflow-hidden">
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-linear-to-r from-primary/5 to-transparent">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Activity className="w-5 h-5 text-primary" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    </div>
                    <h3 className="font-semibold">AI Activity Center</h3>
                </div>

                <span className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-400 rounded-full font-medium">
                    Live
                </span>
            </div>

            <div className="divide-y divide-border/50 max-h-120 overflow-y-auto">
                <AnimatePresence mode="popLayout">
                    {aiActivityLogs.length > 0 ? (
                        aiActivityLogs.map((activity) => (
                            <div
                                key={activity.id}
                                className="flex items-start gap-3 border-b border-border/50 px-4 py-4 last:border-0"
                            >
                                <div
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${getActivityStatusClass(
                                        activity.status
                                    )}`}
                                >
                                    {getActivityIcon(activity.type)}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h4 className="truncate text-sm font-semibold">
                                                {activity.title}
                                            </h4>

                                            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                                                {activity.description || "No description available"}
                                            </p>
                                        </div>

                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {formatActivityTime(activity.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex h-48 flex-col items-center justify-center text-center">
                            <Bot className="mb-3 h-8 w-8 text-muted-foreground" />
                            <p className="text-sm font-medium">No AI activity yet</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Lumora activity will appear here once AI starts handling conversations.
                            </p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </Card>
    )
}
