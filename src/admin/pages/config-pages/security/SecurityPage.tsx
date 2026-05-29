import { useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    // CheckCircle2,
    Laptop,
    LockKeyhole,
    LogIn,
    LogOut,
    RefreshCw,
    ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSecurityStore } from "@/store/dashboard/securityStore";
import { formatTimeAgo, getActivityIcon, getDeviceIcon } from "./helpers/SecurityHelpers";

export const SecurityPage = () => {
    const {
        settings,
        sessions,
        activities,
        isLoading,
        isUpdating,
        error,
        loadSecurity,
        changePassword,
        toggleTwoFactor,
        signOutOtherSessions,
    } = useSecurityStore();

    const [modalType, setModalType] = useState<"2fa" | "password" | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const [savedMessage, setSavedMessage] = useState("");

    useEffect(() => {
        loadSecurity();
    }, [loadSecurity]);

    const twoFactorEnabled = Boolean(settings?.two_factor_enabled);

    const passwordUpdatedAt = settings?.password_updated_at || null;

    const lastActivity = useMemo(() => {
        return activities[0] || null;
    }, [activities]);

    const securityStatus = twoFactorEnabled ? "Strong" : "Good";

    const showSavedMessage = (message: string) => {
        setSavedMessage(message);

        window.setTimeout(() => {
            setSavedMessage("");
        }, 2500);
    };

    const handleToggleTwoFactor = async () => {
        await toggleTwoFactor(!twoFactorEnabled);
        showSavedMessage(
            !twoFactorEnabled
                ? "Two-factor authentication enabled"
                : "Two-factor authentication disabled"
        );
        setModalType(null);
    };

    const handleChangePassword = async () => {
        setFormError(null);

        if (newPassword.length < 8) {
            setFormError("Password must be at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setFormError("Passwords do not match.");
            return;
        }

        await changePassword(newPassword);

        setNewPassword("");
        setConfirmPassword("");
        setModalType(null);
        showSavedMessage("Password updated successfully");
    };

    return (
        <div className="space-y-6 px-5 py-6 sm:px-7 lg:px-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Security</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage account protection, active sessions, and security activity.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {savedMessage && (
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-sm text-emerald-400">
                            {savedMessage}
                        </span>
                    )}

                    <Button
                        variant="outline"
                        onClick={loadSecurity}
                        disabled={isLoading}
                    >
                        <RefreshCw
                            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""
                                }`}
                        />
                        Refresh
                    </Button>
                </div>
            </div>

            {error && (
                <Card className="border-red-500/30 bg-red-500/10 p-4">
                    <p className="text-sm text-red-400">{error}</p>
                </Card>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card className="border-border/50 bg-card/60 p-5">
                    <div className="mb-1 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        <p className="text-sm text-muted-foreground">
                            Security Status
                        </p>
                    </div>

                    <p className="text-3xl font-bold text-emerald-400">
                        {isLoading ? "..." : securityStatus}
                    </p>
                </Card>

                <Card className="border-border/50 bg-card/60 p-5">
                    <div className="mb-1 flex items-center gap-2">
                        <Laptop className="h-4 w-4 text-primary" />
                        <p className="text-sm text-muted-foreground">
                            Active Sessions
                        </p>
                    </div>

                    <p className="text-3xl font-bold">
                        {isLoading ? "..." : sessions.length}
                    </p>
                </Card>

                <Card className="border-border/50 bg-card/60 p-5">
                    <div className="mb-1 flex items-center gap-2">
                        <LogIn className="h-4 w-4 text-blue-400" />
                        <p className="text-sm text-muted-foreground">
                            Last Activity
                        </p>
                    </div>

                    <p className="text-3xl font-bold text-blue-400">
                        {lastActivity
                            ? formatTimeAgo(lastActivity.created_at)
                            : "N/A"}
                    </p>
                </Card>
            </div>

            <Card className="overflow-hidden border-border/50 bg-card/60">
                <div className="border-b border-border/50 bg-background/30 p-5">
                    <h3 className="font-semibold">Authentication</h3>
                    <p className="text-sm text-muted-foreground">
                        Protect access to this workspace.
                    </p>
                </div>

                <div className="space-y-4 p-5">
                    <div className="flex flex-col gap-4 rounded-xl border border-border/50 bg-background/40 p-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <ShieldCheck className="h-5 w-5" />
                            </div>

                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-medium">
                                        Two-Factor Authentication
                                    </p>

                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs ${twoFactorEnabled
                                            ? "bg-emerald-500/20 text-emerald-400"
                                            : "bg-amber-500/20 text-amber-400"
                                            }`}
                                    >
                                        {twoFactorEnabled
                                            ? "Enabled"
                                            : "Recommended"}
                                    </span>
                                </div>

                                <p className="text-sm text-muted-foreground">
                                    MVP setting for 2FA. Real TOTP setup will be connected later.
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setModalType("2fa")}
                        >
                            {twoFactorEnabled ? "Manage" : "Configure"}
                        </Button>
                    </div>

                    <div className="flex flex-col gap-4 rounded-xl border border-border/50 bg-background/40 p-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <LockKeyhole className="h-5 w-5" />
                            </div>

                            <div>
                                <p className="font-medium">Password</p>
                                <p className="text-sm text-muted-foreground">
                                    Last updated:{" "}
                                    {passwordUpdatedAt
                                        ? formatTimeAgo(passwordUpdatedAt)
                                        : "Not recorded"}
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setModalType("password")}
                        >
                            Change Password
                        </Button>
                    </div>
                </div>
            </Card>

            <Card className="overflow-hidden border-border/50 bg-card/60">
                <div className="flex flex-col gap-3 border-b border-border/50 bg-background/30 p-5 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h3 className="font-semibold">Active Sessions</h3>
                        <p className="text-sm text-muted-foreground">
                            Devices currently signed into this account.
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={signOutOtherSessions}
                        disabled={isUpdating}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out other sessions
                    </Button>
                </div>

                <div className="divide-y divide-border/50">
                    {sessions.length > 0 ? (
                        sessions.map((session) => {
                            const DeviceIcon = getDeviceIcon(session.device);

                            return (
                                <div
                                    key={session.id}
                                    className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <DeviceIcon className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-medium">
                                                    {session.browser} -{" "}
                                                    {session.device}
                                                </p>

                                                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
                                                    Current session
                                                </span>
                                            </div>

                                            <p className="text-sm text-muted-foreground">
                                                {session.location} ·{" "}
                                                {session.ipAddress} ·{" "}
                                                {session.lastActive}
                                            </p>
                                        </div>
                                    </div>

                                    <span className="text-sm text-emerald-400">
                                        Active now
                                    </span>
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-5 text-sm text-muted-foreground">
                            No active session found.
                        </div>
                    )}
                </div>
            </Card>

            <Card className="overflow-hidden border-border/50 bg-card/60">
                <div className="border-b border-border/50 bg-background/30 p-5">
                    <h3 className="font-semibold">Security Activity</h3>
                    <p className="text-sm text-muted-foreground">
                        Recent security events on this workspace.
                    </p>
                </div>

                <div className="divide-y divide-border/50">
                    {activities.length > 0 ? (
                        activities.map((activity) => {
                            const ActivityIcon = getActivityIcon(activity.type);

                            return (
                                <div key={activity.id} className="p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/40 text-primary">
                                            <ActivityIcon className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <p className="font-medium">
                                                {activity.action}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatTimeAgo(
                                                    activity.created_at
                                                )}{" "}
                                                ·{" "}
                                                {activity.location ||
                                                    "Unknown location"}{" "}
                                                · IP:{" "}
                                                {activity.ip_address ||
                                                    "Hidden"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-5 text-sm text-muted-foreground">
                            No security activity yet.
                        </div>
                    )}
                </div>
            </Card>

            <Card className="border-amber-500/20 bg-amber-500/5 p-5">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-400" />

                    <div>
                        <p className="font-medium text-amber-400">
                            Keep your account secure
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Enable 2FA, use a strong password, and review active sessions regularly.
                        </p>
                    </div>
                </div>
            </Card>

            {modalType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl">
                        <div className="border-b border-border/50 p-5">
                            <h3 className="text-lg font-semibold">
                                {modalType === "2fa"
                                    ? "Two-Factor Authentication"
                                    : "Change Password"}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {modalType === "2fa"
                                    ? "Enable or disable the MVP 2FA security setting."
                                    : "Choose a new password for your account."}
                            </p>
                        </div>

                        <div className="space-y-4 p-5">
                            {formError && (
                                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
                                    <p className="text-sm text-red-400">
                                        {formError}
                                    </p>
                                </div>
                            )}

                            {modalType === "2fa" ? (
                                <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
                                    <p className="text-sm text-muted-foreground">
                                        Current status:{" "}
                                        <span className="font-medium text-foreground">
                                            {twoFactorEnabled
                                                ? "Enabled"
                                                : "Disabled"}
                                        </span>
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(event) =>
                                            setNewPassword(event.target.value)
                                        }
                                        placeholder="New password"
                                        className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
                                    />

                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(event) =>
                                            setConfirmPassword(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Confirm new password"
                                        className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
                                    />
                                </>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 border-t border-border/50 p-5">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setModalType(null);
                                    setFormError(null);
                                    setNewPassword("");
                                    setConfirmPassword("");
                                }}
                                disabled={isUpdating}
                            >
                                Cancel
                            </Button>

                            <Button
                                onClick={
                                    modalType === "2fa"
                                        ? handleToggleTwoFactor
                                        : handleChangePassword
                                }
                                disabled={isUpdating}
                                className="bg-primary hover:bg-primary/90"
                            >
                                {isUpdating
                                    ? "Saving..."
                                    : modalType === "2fa"
                                        ? twoFactorEnabled
                                            ? "Disable"
                                            : "Enable"
                                        : "Update Password"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SecurityPage;