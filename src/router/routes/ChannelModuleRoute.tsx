import { Navigate, Outlet, useParams } from "react-router";
import { useAuthStore } from "@/store/authStore";
import { LumoraLoader } from "@/shared/components/LumoraLoader";

const allowedChannels = ["whatsapp", "sms", "webchat", "email"];

export const ChannelModuleRoute = () => {
    const { channel } = useParams();

    const { hasModule, isInitialized, isAuthenticated } = useAuthStore()

    if (!isInitialized) {
        return (
            <LumoraLoader
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

    if (!hasModule(channel)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};