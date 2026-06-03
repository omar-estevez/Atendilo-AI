import { Outlet } from "react-router"
import { Navigation } from "../components/Navigation"
import { Footer } from "../components/Footer"
import { ScrollManager } from "@/utils/ScrollManager"

export const MainLayout = () => {
    return (
        <main className="min-h-screen">
            <ScrollManager />
            <Navigation />
            <Outlet />
            <Footer />
        </main>
    )
}

export default MainLayout;