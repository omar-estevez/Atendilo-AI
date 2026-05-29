import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

export const AuthBootstrap = () => {

    const { quickCheckAuth, isInitialized } = useAuthStore();

    useEffect(() => {
        if (!isInitialized) {
            quickCheckAuth();
        }
    }, [quickCheckAuth, isInitialized]);

    return null;
};