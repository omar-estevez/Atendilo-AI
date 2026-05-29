import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "@/store/authStore";
import { LumoraLoader } from "@/shared/components/LumoraLoader";

interface ModuleRouteProps {
    moduleKey: string;
}

export const ModuleRoute = ({ moduleKey }: ModuleRouteProps) => {

    const { hasModule, isInitialized, isAuthenticated, loadingStep } = useAuthStore()

    if (!isInitialized) {
        return (
            <LumoraLoader
                message="Verifying access"
                subMessage={loadingStep || "Checking your plan permissions..."}
            />
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!hasModule(moduleKey)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};