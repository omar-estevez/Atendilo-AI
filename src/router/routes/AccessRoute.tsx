import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "@/store/authStore";
import { AtendiloLoader } from "@/shared/components/AtendiloLoader";

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
            <AtendiloLoader
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

export default AccessRoute;