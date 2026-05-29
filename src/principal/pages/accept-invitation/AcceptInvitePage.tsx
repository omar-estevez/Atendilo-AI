import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
    AlertTriangle,
    CheckCircle2,
    Loader2,
    Mail,
    ShieldCheck,
    UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    acceptInviteService,
    type PublicTeamInvitation,
} from "@/services/acceptInviteService";
import { useAuthStore } from "@/store/authStore";

const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
};

export const AcceptInvitePage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const initializeAuth = useAuthStore((state) => state.initializeAuth);

    const token = searchParams.get("token");

    const [invitation, setInvitation] =
        useState<PublicTeamInvitation | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isAccepting, setIsAccepting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const redirectPath = useMemo(() => {
        return `/accept-invite?token=${token || ""}`;
    }, [token]);

    useEffect(() => {
        const loadInvitation = async () => {
            if (!token) {
                setError("Invalid invitation link.");
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                const [session, invitationData] = await Promise.all([
                    acceptInviteService.getSession(),
                    acceptInviteService.getInvitationByToken(token),
                ]);

                setIsAuthenticated(Boolean(session));

                if (!invitationData) {
                    setError("Invitation not found.");
                    return;
                }

                setInvitation(invitationData);

                if (invitationData.status !== "pending") {
                    setError(`This invitation is ${invitationData.status}.`);
                    return;
                }

                if (new Date(invitationData.expires_at) < new Date()) {
                    setError("This invitation has expired.");
                    return;
                }
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load invitation"
                );
            } finally {
                setIsLoading(false);
            }
        };

        loadInvitation();
    }, [token]);

    const handleAcceptInvite = async () => {
        if (!token) return;

        try {
            setIsAccepting(true);
            setError(null);

            await acceptInviteService.acceptInvitation(token);

            await initializeAuth();

            setSuccess(true);

            window.setTimeout(() => {
                navigate("/dashboard", { replace: true });
            }, 1200);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to accept invitation"
            );
        } finally {
            setIsAccepting(false);
        }
    };

    const goToLogin = () => {
        navigate(`/login?redirect=${encodeURIComponent(redirectPath)}`);
    };

    const goToRegister = () => {
        navigate(`/register?redirect=${encodeURIComponent(redirectPath)}`);
    };

    return (
        <div className="min-h-screen bg-background px-4 py-10">
            <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-xl items-center justify-center">
                <Card className="w-full overflow-hidden border-border/50 bg-card/70">
                    <div className="border-b border-border/50 bg-background/30 p-6 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
                            <UserPlus className="h-7 w-7 text-primary" />
                        </div>

                        <h1 className="text-2xl font-bold">
                            Accept Invitation
                        </h1>

                        <p className="mt-2 text-sm text-muted-foreground">
                            Join a Lumora workspace and collaborate with your team.
                        </p>
                    </div>

                    <div className="space-y-5 p-6">
                        {isLoading && (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                            </div>
                        )}

                        {!isLoading && error && (
                            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                                <p className="flex items-center gap-2 font-semibold text-red-400">
                                    <AlertTriangle className="h-5 w-5" />
                                    Invitation issue
                                </p>

                                <p className="mt-2 text-sm text-muted-foreground">
                                    {error}
                                </p>
                            </div>
                        )}

                        {!isLoading && success && (
                            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                                <p className="flex items-center gap-2 font-semibold text-emerald-400">
                                    <CheckCircle2 className="h-5 w-5" />
                                    Invitation accepted
                                </p>

                                <p className="mt-2 text-sm text-muted-foreground">
                                    Redirecting you to the dashboard...
                                </p>
                            </div>
                        )}

                        {!isLoading && invitation && !success && (
                            <>
                                <div className="rounded-2xl border border-primary/20 bg-primary/10 p-5">
                                    <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                                        <ShieldCheck className="h-4 w-4" />
                                        Workspace Invitation
                                    </p>

                                    <div className="mt-4 space-y-3 text-sm">
                                        <div className="flex justify-between gap-4">
                                            <span className="text-muted-foreground">
                                                Business
                                            </span>
                                            <span className="font-medium">
                                                {invitation.business_name}
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-4">
                                            <span className="text-muted-foreground">
                                                Email
                                            </span>
                                            <span className="font-medium">
                                                {invitation.email}
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-4">
                                            <span className="text-muted-foreground">
                                                Role
                                            </span>
                                            <span className="font-medium">
                                                {formatRole(invitation.role)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-4">
                                            <span className="text-muted-foreground">
                                                Expires
                                            </span>
                                            <span className="font-medium">
                                                {new Date(
                                                    invitation.expires_at
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {!isAuthenticated ? (
                                    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
                                        <p className="flex items-center gap-2 font-semibold text-amber-400">
                                            <Mail className="h-5 w-5" />
                                            Sign in required
                                        </p>

                                        <p className="mt-2 text-sm text-muted-foreground">
                                            You need to log in or create an account with the invited email before accepting.
                                        </p>

                                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                            <Button
                                                className="bg-primary hover:bg-primary/90"
                                                onClick={goToLogin}
                                            >
                                                Log In
                                            </Button>

                                            <Button
                                                variant="outline"
                                                onClick={goToRegister}
                                            >
                                                Create Account
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button
                                        onClick={handleAcceptInvite}
                                        disabled={isAccepting || Boolean(error)}
                                        className="w-full bg-primary hover:bg-primary/90"
                                    >
                                        {isAccepting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Accepting...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                Accept Invitation
                                            </>
                                        )}
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AcceptInvitePage;