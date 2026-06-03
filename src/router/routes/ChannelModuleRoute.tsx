import { Navigate, Outlet, useParams } from "react-router";
import { useAuthStore } from "@/store/authStore";
import { AtendiloLoader } from "@/shared/components/AtendiloLoader";

const allowedChannels = ["whatsapp", "sms", "webchat", "email"];

export const ChannelModuleRoute = () => {
    const { channel } = useParams();

    const {
        hasModule,
        hasPermission,
        isInitialized,
        isAuthenticated,
    } = useAuthStore();

    if (!isInitialized) {
        return (
            <AtendiloLoader
                message="Initializing AI workspace"
                subMessage="Checking your session, subscription and active modules..."
            />
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!channel || !allowedChannels.includes(channel)) {
        return <Navigate to="/dashboard" replace />;
    }

    const hasChannelModule = hasModule(channel);
    const canViewChannels = hasPermission("channels.view");

    if (!hasChannelModule || !canViewChannels) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default ChannelModuleRoute;