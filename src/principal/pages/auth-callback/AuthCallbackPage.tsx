import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/store/authStore";
import { AtendiloLoader } from "@/shared/components/AtendiloLoader";

export const AuthCallbackPage = () => {
    const navigate = useNavigate();
    const { handleAuthCallback } = useAuthStore();

    useEffect(() => {
        const runCallback = async () => {
            try {
                await handleAuthCallback();
                navigate("/dashboard", { replace: true });
            } catch {
                navigate("/login", { replace: true });
            }
        };

        runCallback();
    }, [handleAuthCallback, navigate]);

    return <AtendiloLoader />;
};

export default AuthCallbackPage;