import { useDashboardDataStore } from "@/store/dashboard/dashboardDataStore";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import { Brain, CirclePower } from "lucide-react";

export const BannerSection = () => {
    const { channels: realChannels } = useDashboardDataStore();
    const { hasModule, hasPermission } = useAuthStore();

    const canViewChannels = hasPermission("channels.view");

    const channels = canViewChannels
        ? realChannels.filter((channel) => hasModule(channel.key ?? channel.name?.toLowerCase()))
        : [];

    const getChannelStatusIcon = (status: string) => {
        switch (status) {
            case "active":
                return <CirclePower className="w-4 h-4 text-emerald-400" />;
            case "error":
                return <CirclePower className="w-4 h-4 text-red-400" />;
            case "inactive":
                return <CirclePower className="w-4 h-4 text-orange-400" />;
            default:
                return <CirclePower className="w-4 h-4 text-muted-foreground" />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-linear-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 p-4"
        >
            <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-accent/5" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

            <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-linear-to-r from-primary to-accent flex items-center justify-center">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">
                            Lumora AI is active and responding
                        </p>
                        <h2 className="text-lg font-semibold">
                            Your AI assistant is handling conversations across your enabled channels
                        </h2>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-5 text-sm">
                    {channels.length > 0 ? (
                        channels.map((channel) => (
                            <div key={channel.id} className="grid justify-items-center">
                                {getChannelStatusIcon(channel.status)}
                                <p className="text-muted-foreground">{channel.name}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No channels connected yet
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
