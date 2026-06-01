import { RouterProvider } from "react-router"
import { appRouter } from "./router/app.router"
import { AuthBootstrap } from "./components/auth/AuthBootstrap"
import { Toaster } from "sonner"

export const AgencyApp = () => {
    return (
        <>
            <AuthBootstrap />
            <RouterProvider router={appRouter} />
            <Toaster theme="system" />
        </>
    )
}