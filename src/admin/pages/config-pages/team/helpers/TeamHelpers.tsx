import type { UserRole } from "@/services/businessService";
import { Crown, Shield, UserCog, User } from "lucide-react";

export const getInitials = (name?: string | null, email?: string | null) => {
    const value = name || email || "User";

    return value
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
};

export const getRoleClass = (role: UserRole) => {
    switch (role) {
        case "owner":
            return "border-primary/25 bg-primary/15 text-primary";
        case "admin":
            return "border-purple-500/25 bg-purple-500/15 text-purple-400";
        case "agent":
            return "border-emerald-500/25 bg-emerald-500/15 text-emerald-400";
        case "viewer":
            return "border-blue-500/25 bg-blue-500/15 text-blue-400";
        default:
            return "border-border bg-secondary text-muted-foreground";
    }
};

export const getRoleIcon = (role: UserRole) => {
    switch (role) {
        case "owner":
            return <Crown className="h-4 w-4" />;
        case "admin":
            return <Shield className="h-4 w-4" />;
        case "agent":
            return <UserCog className="h-4 w-4" />;
        case "viewer":
            return <User className="h-4 w-4" />;
        default:
            return <User className="h-4 w-4" />;
    }
};