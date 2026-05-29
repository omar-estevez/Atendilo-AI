import { AnimatePresence, motion } from "framer-motion"
import { Outlet, useLocation } from "react-router"
import { useState } from "react"
import { Sidebar } from "../components/layout/Sidebar"
import { Header } from "../components/layout/Header"
import { ScrollManager } from "@/utils/ScrollManager"

export const DashLayout = () => {
    const location = useLocation()

    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    return (
        <div className="min-h-screen bg-background">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/3 rounded-full blur-[200px]" />
                <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-accent/3 rounded-full blur-[150px]" />
            </div>

            <Sidebar
                sidebarCollapsed={sidebarCollapsed}
                sidebarOpen={sidebarOpen}
                onCloseSidebar={() => setSidebarOpen(false)}
            />

            <div
                className={`relative transition-all duration-300 ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-72"
                    }`}
            >
                <Header
                    sidebarCollapsed={sidebarCollapsed}
                    sidebarOpen={sidebarOpen}
                    setSidebarCollapsed={setSidebarCollapsed}
                    setSidebarOpen={setSidebarOpen}
                />

                <main className="p-4 lg:p-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ScrollManager />
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    )
}

export default DashLayout