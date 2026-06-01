import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "@/store/authStore";
import { LumoraLoader } from "@/shared/components/LumoraLoader";

interface AccessRouteProps {
    moduleKey: string;
    permissionKey: string;
}

export const AccessRoute = ({
    moduleKey,
    permissionKey,
}: AccessRouteProps) => {
    const {
        hasModule,
        hasPermission,
        isInitialized,
        isAuthenticated,
        loadingStep,
    } = useAuthStore();

    if (!isInitialized) {
        return (
            <LumoraLoader
                message="Verifying access"
                subMessage={loadingStep || "Checking your access permissions..."}
            />
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const canAccessModule = hasModule(moduleKey);
    const canAccessPermission = hasPermission(permissionKey);

    if (!canAccessModule || !canAccessPermission) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};