import { LumoraLoader } from "@/shared/components/LumoraLoader";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { Navigate, Outlet } from "react-router";

export const ProtectedRoute = () => {

    const { isAuthenticated, isInitialized, isLoading, loadingStep, initializeAuth, profile, business, modules, error } = useAuthStore();

    const hasWorkspaceData =
        Boolean(profile) &&
        Boolean(business) &&
        modules.length > 0;

    const shouldLoadWorkspace =
        isInitialized &&
        isAuthenticated &&
        !hasWorkspaceData &&
        !isLoading;

    useEffect(() => {
        if (!isInitialized || shouldLoadWorkspace) {
            initializeAuth();
        }
    }, [initializeAuth, isInitialized, shouldLoadWorkspace]);

    if (!isInitialized || isLoading || (isAuthenticated && !hasWorkspaceData && !error)) {
        return (
            <LumoraLoader
                message="Loading Lumora"
                subMessage={loadingStep || "Preparing your AI workspace..."}
            />
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};