import { RouterProvider } from "react-router"
import { appRouter } from "./router/app.router"
import { AuthBootstrap } from "./components/auth/AuthBootstrap"

export const AgencyApp = () => {
    return (
        <>
            <AuthBootstrap />
            <RouterProvider router={appRouter} />
        </>
    )
}