import { Smartphone, Laptop, LogIn, Shield, ShieldCheck, LockKeyhole, LogOut, KeyRound, Clock } from "lucide-react";

export const formatTimeAgo = (date?: string | null) => {
    if (!date) return "Never";

    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;

    return `${days}d ago`;
};

export const getDeviceIcon = (device: string) => {
    const lowerDevice = device.toLowerCase();

    if (
        lowerDevice.includes("iphone") ||
        lowerDevice.includes("android") ||
        lowerDevice.includes("phone")
    ) {
        return Smartphone;
    }

    return Laptop;
};

export const getActivityIcon = (type: string) => {
    switch (type) {
        case "login":
            return LogIn;
        case "settings":
            return Shield;
        case "two_factor":
            return ShieldCheck;
        case "password":
            return LockKeyhole;
        case "session":
            return LogOut;
        case "api_key":
            return KeyRound;
        default:
            return Clock;
    }
};