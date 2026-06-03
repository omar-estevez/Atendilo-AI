import { Card } from "@/components/ui/card";
import { useDashboardDataStore } from "@/store/dashboard/dashboardDataStore";
import { AnimatePresence, motion } from "framer-motion";
import { Activity } from "lucide-react";
import {
    getActivityStatusClass,
    getActivityIcon,
    formatActivityTime,
} from "../helpers/ActivityMainHelpers";

export const AiActivitySection = () => {
    const { aiActivityLogs } = useDashboardDataStore();

    return (
        <Card className="h-[520px] overflow-hidden border-border/60 bg-card/60">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
                <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">AI Activity Center</h3>
                </div>

                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                    Live
                </span>
            </div>

            <div className="h-[456px] overflow-y-auto px-5 py-3 custom-scrollbar">
                {aiActivityLogs.length > 0 ? (
                    <AnimatePresence initial={false}>
                        <div className="space-y-2">
                            {aiActivityLogs.map((activity) => (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="flex items-start gap-3 rounded-xl border border-border/40 bg-background/35 p-4"
                                >
                                    <div
                                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${getActivityStatusClass(
                                            activity.type
                                        )}`}
                                    >
                                        {getActivityIcon(activity.type)}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="truncate text-sm font-semibold">
                                                {activity.title}
                                            </p>
                                            <span className="shrink-0 text-xs text-muted-foreground">
                                                {formatActivityTime(activity.created_at)}
                                            </span>
                                        </div>

                                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                            {activity.description || "No description available"}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                        <Activity className="mb-3 h-9 w-9 text-muted-foreground" />
                        <p className="text-sm font-medium">No AI activity yet</p>
                        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                            Atendilo activity will appear here once AI starts handling
                            conversations.
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
};