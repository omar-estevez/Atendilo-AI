import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import {
    Bot,
    ChevronDown,
    Crown,
    LogOut,
    Plus,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { sidebarSections, type NavItem } from "@/dashboard/config/sidebarItems";

interface SidebarProps {
    sidebarCollapsed: boolean;
    sidebarOpen: boolean;
    onCloseSidebar?: () => void;
}

type ModuleStatus = "active" | "inactive" | "upgrade";

const getInitials = (name?: string | null) => {
    if (!name) return "U";

    return name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
};

const getBusinessLogo = (name?: string | null) => {
    if (!name) return "LM";

    return name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
};

const getStatusDotClass = (status?: ModuleStatus) => {
    if (status === "active") return "bg-emerald-400";
    if (status === "upgrade") return "bg-amber-400";
    if (status === "inactive") return "bg-muted-foreground";
    return "";
};

export const Sidebar = ({
    sidebarCollapsed,
    sidebarOpen,
    onCloseSidebar,
}: SidebarProps) => {

    const navigate = useNavigate();

    const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);

    const { business, profile, subscription, modules, hasModule, logout } = useAuthStore();

    const sidebarWidth = sidebarCollapsed ? "lg:w-20" : "lg:w-72";

    const currentPlanName = subscription?.plans?.name?.toLowerCase();

    const isHighestPlan =
        currentPlanName === "scale" ||
        currentPlanName === "business" ||
        currentPlanName === "enterprise";

    const activeModuleKeys = modules
        .filter((businessModule) => businessModule.enabled)
        .map((businessModule) => businessModule.modules.key);

    const getItemStatus = (item: NavItem): ModuleStatus => {
        if (activeModuleKeys.includes(item.moduleKey)) return "active";

        return "upgrade";
    };

    const visibleSections = sidebarSections
        .map((section) => ({
            ...section,
            items: section.items.filter((item) => hasModule(item.moduleKey)),
        }))
        .filter((section) => section.items.length > 0);

    const renderNavItem = (item: NavItem) => {
        const Icon = item.icon;
        const status = getItemStatus(item);

        return (
            <NavLink
                key={item.id}
                to={item.path}
                end={item.path === "/dashboard"}
                title={sidebarCollapsed ? item.label : undefined}
                onClick={onCloseSidebar}
                className={({ isActive }) =>
                    [
                        "group flex w-full items-center rounded-xl px-3 py-2.5 text-sm transition-all",
                        sidebarCollapsed ? "justify-center" : "justify-between",
                        isActive
                            ? "bg-primary/20 text-primary shadow-[inset_0_0_0_1px_rgba(56,189,248,0.25)]"
                            : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                    ].join(" ")
                }
            >
                <div className="flex min-w-0 items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0" />

                    {!sidebarCollapsed && (
                        <span className="truncate font-medium">{item.label}</span>
                    )}
                </div>

                {!sidebarCollapsed && (
                    <div className="flex shrink-0 items-center gap-2">
                        {item.badge && (
                            <span
                                className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${typeof item.badge === "number"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-emerald-500/20 text-emerald-400"
                                    }`}
                            >
                                {item.badge}
                            </span>
                        )}

                        <span
                            className={`h-2 w-2 rounded-full ${getStatusDotClass(status)}`}
                        />
                    </div>
                )}
            </NavLink>
        );
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    return (
        <>
            {sidebarOpen && (
                <button
                    className="fixed inset-0 z-30 bg-black/60 lg:hidden"
                    onClick={onCloseSidebar}
                    aria-label="Close sidebar"
                />
            )}

            <aside
                className={[
                    "fixed left-0 top-0 bottom-0 z-40 w-72 border-r border-border/50 bg-background/95 backdrop-blur-xl transition-all duration-300",
                    sidebarWidth,
                    sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                ].join(" ")}
            >
                <div className="flex h-full flex-col">
                    <div className="border-b border-border/50 p-3">
                        <div
                            className={`mb-3 flex items-center ${sidebarCollapsed ? "justify-center" : "gap-2"
                                }`}
                        >
                            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-r from-primary to-accent">
                                <Bot className="h-5 w-5 text-white" />
                                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400" />
                            </div>

                            {!sidebarCollapsed && (
                                <span className="text-xl font-bold tracking-tight">
                                    Lumora
                                </span>
                            )}
                        </div>

                        {!sidebarCollapsed && (
                            <div className="relative">
                                <button
                                    onClick={() => setWorkspaceMenuOpen((current) => !current)}
                                    className="flex w-full items-center justify-between rounded-xl bg-secondary/50 p-2.5 transition-colors hover:bg-secondary"
                                >
                                    <div className="flex min-w-0 items-center gap-2">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-xs font-semibold text-primary">
                                            {getBusinessLogo(business?.name)}
                                        </div>

                                        <div className="min-w-0 text-left">
                                            <p className="truncate text-sm font-semibold">
                                                {business?.name || "Lumora Business"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {subscription?.plans?.name || "No Plan"}
                                            </p>
                                        </div>
                                    </div>

                                    <ChevronDown
                                        className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${workspaceMenuOpen ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>

                                {workspaceMenuOpen && (
                                    <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-border/50 bg-background p-1 shadow-xl">
                                        <button className="flex w-full items-center gap-2 rounded-lg p-2 text-left transition-colors hover:bg-secondary">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-xs font-semibold text-primary">
                                                {getBusinessLogo(business?.name)}
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium">
                                                    {business?.name || "Lumora Business"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {subscription?.plans?.name || "No Plan"}
                                                </p>
                                            </div>
                                        </button>

                                        <div className="mt-1 border-t border-border/50 pt-1">
                                            <button
                                                onClick={() => {
                                                    setWorkspaceMenuOpen(false);
                                                    navigate("/dashboard/business");
                                                }}
                                                className="flex w-full items-center gap-2 rounded-lg p-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Business Settings
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <nav className="sidebar-scroll flex-1 overflow-y-auto px-2 py-4">
                        <div className="space-y-5">
                            {visibleSections.map((section) => {
                                const SectionIcon = section.icon;

                                return (
                                    <div key={section.title}>
                                        {!sidebarCollapsed && (
                                            <div className="mb-2 flex items-center gap-1 px-3">
                                                {SectionIcon && (
                                                    <SectionIcon className="h-3 w-3 text-primary" />
                                                )}
                                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                    {section.title}
                                                </p>
                                            </div>
                                        )}

                                        <div className="space-y-1">
                                            {section.items.map(renderNavItem)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </nav>

                    {!sidebarCollapsed && (
                        <div className="border-t border-border/50 p-3">
                            {isHighestPlan ? (
                                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                                    <div className="mb-2 flex items-center gap-2">
                                        <Crown className="h-4 w-4 text-amber-400" />
                                        <p className="font-semibold">
                                            {subscription?.plans?.name || "Scale"} Plan
                                        </p>
                                    </div>

                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                        All Lumora modules are unlocked.
                                    </p>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3">
                                    <div className="mb-2 flex items-center gap-2">
                                        <Crown className="h-4 w-4 text-amber-400" />
                                        <p className="font-semibold">
                                            {subscription?.plans?.name || "Starter"} Plan
                                        </p>
                                    </div>

                                    <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                                        Unlock AI voice, advanced automations, and premium channels.
                                    </p>

                                    <button onClick={() => navigate("/dashboard/billing")} className="cursor-pointer w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                                        Upgrade Plan
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="border-t border-border/50 p-3">
                        <div
                            className={`flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"
                                }`}
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20">
                                    <span className="text-sm font-semibold">
                                        {getInitials(profile?.full_name || profile?.email)}
                                    </span>
                                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-400" />
                                </div>

                                {!sidebarCollapsed && (
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold">
                                            {profile?.full_name || profile?.email || "User"}
                                        </p>
                                        <p className="text-xs capitalize text-muted-foreground">
                                            {profile?.role || "viewer"}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {!sidebarCollapsed && (
                                <button
                                    onClick={handleLogout}
                                    className="cursor-pointer rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;