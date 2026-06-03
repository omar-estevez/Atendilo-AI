import { RouterProvider } from "react-router"
import { appRouter } from "./router/app.router"
import { AuthBootstrap } from "./components/auth/AuthBootstrap"
import { Toaster } from "sonner"
import { Suspense } from "react"
import { AppFallbackLoader } from "./shared/components/AppFallbackLoader"

export const AgencyApp = () => {
    return (
        <>
            <AuthBootstrap />

            <Suspense fallback={<AppFallbackLoader />}>
                <RouterProvider router={appRouter} />
            </Suspense>

            <Toaster theme="system" />
        </>
    )
}