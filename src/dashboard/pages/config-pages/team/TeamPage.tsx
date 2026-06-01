import { useEffect, useMemo, useState } from "react";
import {
    Clock,
    Copy,
    Mail,
    RefreshCw,
    UserPlus,
    Users,
    XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTeamStore } from "@/store/dashboard/teamStore";
import type { Profile, UserRole } from "@/services/businessService";
import { getInitials, getRoleClass, getRoleIcon } from "./helpers/TeamHelpers";
import { useTeamInvitationsStore } from "@/store/dashboard/teamInvitationsStore";
import { getInviteUrl } from "@/services/dashboard/teamInvitationsService";
import InviteMemberModal from "./invite-member/InviteMemberModal";
import { useAuthStore } from "@/store/authStore";

const roleDescription: Record<UserRole, string> = {
    owner: "Full access to billing, team, integrations, and business settings.",
    admin: "Can manage most workspace settings, team operations, and integrations.",
    agent: "Can manage conversations, leads, bookings, and customer activity.",
    viewer: "Read-only access to dashboard data and reports.",
};

export const TeamPage = () => {
    const {
        members,
        selectedMember,
        isLoading,
        error,
        loadTeamMembers,
        updateMemberRole,
        selectMember,
    } = useTeamStore();

    const {
        invitations,
        newlyCreatedInvitation,
        isLoading: isLoadingInvitations,
        error: invitationsError,
        loadInvitations,
        cancelInvitation,
        deleteInvitation,
        clearNewlyCreatedInvitation,
    } = useTeamInvitationsStore();

    const { hasPermission } = useAuthStore();

    const canInvite = hasPermission("team.invite");
    const canChangeRole = hasPermission("team.change_role");

    const [isUpdatingRole, setIsUpdatingRole] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [copiedValue, setCopiedValue] = useState<string | null>(null);

    useEffect(() => {
        loadTeamMembers();
        loadInvitations();
    }, [loadTeamMembers, loadInvitations]);

    const stats = useMemo(() => {
        return {
            total: members.length,
            owners: members.filter((member) => member.role === "owner").length,
            admins: members.filter((member) => member.role === "admin").length,
            agents: members.filter((member) => member.role === "agent").length,
        };
    }, [members]);

    const handleRoleChange = async (member: Profile, role: UserRole) => {
        try {
            setIsUpdatingRole(true);
            await updateMemberRole(member, role);
        } finally {
            setIsUpdatingRole(false);
        }
    };

    const pendingInvitations = invitations.filter(
        (invitation) => invitation.status === "pending"
    );

    const handleCopy = async (value: string) => {
        await navigator.clipboard.writeText(value);
        setCopiedValue(value);

        window.setTimeout(() => {
            setCopiedValue(null);
        }, 1500);
    };

    return (
        <div className="h-full px-5 py-6 sm:px-7 lg:px-8">
            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Team Settings
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage workspace members, roles and access permissions.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={loadTeamMembers}
                        disabled={isLoading}
                    >
                        <RefreshCw
                            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""
                                }`}
                        />
                        Refresh
                    </Button>

                    {canInvite && (
                        <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsInviteOpen(true)}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Invite Member
                        </Button>
                    )}
                </div>
            </div>

            {error && (
                <Card className="mb-4 border-red-500/30 bg-red-500/10 p-4">
                    <p className="text-sm text-red-400">{error}</p>
                </Card>
            )}

            {invitationsError && (
                <Card className="mb-4 border-red-500/30 bg-red-500/10 p-4">
                    <p className="text-sm text-red-400">{invitationsError}</p>
                </Card>
            )}

            {newlyCreatedInvitation && (
                <Card className="mb-5 border-emerald-500/30 bg-emerald-500/10 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <p className="font-semibold text-emerald-400">
                                Invitation created
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Copy this invitation link and send it to{" "}
                                {newlyCreatedInvitation.email}.
                            </p>

                            <div className="mt-4 rounded-xl border border-border/60 bg-background/70 p-3 font-mono text-xs">
                                {getInviteUrl(newlyCreatedInvitation.token)}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() =>
                                    handleCopy(getInviteUrl(newlyCreatedInvitation.token))
                                }
                            >
                                <Copy className="mr-2 h-4 w-4" />
                                {copiedValue === getInviteUrl(newlyCreatedInvitation.token)
                                    ? "Copied"
                                    : "Copy"}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={clearNewlyCreatedInvitation}
                            >
                                Done
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">
                        Total Members
                    </p>
                    <h3 className="mt-2 text-3xl font-bold">{stats.total}</h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Owners</p>
                    <h3 className="mt-2 text-3xl font-bold text-primary">
                        {stats.owners}
                    </h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Admins</p>
                    <h3 className="mt-2 text-3xl font-bold text-purple-400">
                        {stats.admins}
                    </h3>
                </Card>

                <Card className="border-border/50 bg-card/60 p-4">
                    <p className="text-sm text-muted-foreground">Agents</p>
                    <h3 className="mt-2 text-3xl font-bold text-emerald-400">
                        {stats.agents}
                    </h3>
                </Card>
            </div>

            <Card className="mb-5 overflow-hidden border-border/50 bg-card/60">
                <div className="border-b border-border/50 bg-background/30 p-5">
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        <h2 className="font-semibold">Pending Invitations</h2>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                        People invited but not added to the workspace yet.
                    </p>
                </div>

                <div className="divide-y divide-border/50">
                    {isLoadingInvitations ? (
                        <div className="p-5 text-sm text-muted-foreground">
                            Loading invitations...
                        </div>
                    ) : pendingInvitations.length > 0 ? (
                        pendingInvitations.map((invitation) => {
                            const inviteUrl = getInviteUrl(invitation.token);

                            return (
                                <div
                                    key={invitation.id}
                                    className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
                                >
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-semibold">
                                                {invitation.email}
                                            </p>

                                            <span
                                                className={`rounded-full border px-2.5 py-1 text-xs capitalize ${getRoleClass(
                                                    invitation.role
                                                )}`}
                                            >
                                                {invitation.role}
                                            </span>

                                            <span className="rounded-full border border-amber-500/25 bg-amber-500/15 px-2.5 py-1 text-xs text-amber-400">
                                                pending
                                            </span>
                                        </div>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Expires{" "}
                                            {new Date(
                                                invitation.expires_at
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCopy(inviteUrl)}
                                        >
                                            <Copy className="mr-2 h-4 w-4" />
                                            {copiedValue === inviteUrl
                                                ? "Copied"
                                                : "Copy Link"}
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => cancelInvitation(invitation)}
                                        >
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Cancel
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => deleteInvitation(invitation)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-5 text-sm text-muted-foreground">
                            No pending invitations.
                        </div>
                    )}
                </div>
            </Card>

            <div className="grid h-[calc(90vh-300px)] min-h-[600px] grid-cols-1 gap-5 xl:grid-cols-[520px_1fr]">
                <Card className="flex min-h-0 flex-col overflow-hidden border-border/50 bg-card/60">
                    <div className="border-b border-border/50 bg-background/30 p-5">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            <h2 className="font-semibold">Members</h2>
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                            People with access to this workspace.
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex h-full items-center justify-center">
                                <p className="text-sm text-muted-foreground">
                                    Loading team members...
                                </p>
                            </div>
                        ) : members.length > 0 ? (
                            <div className="divide-y divide-border/50">
                                {members.map((member) => {
                                    const isSelected =
                                        selectedMember?.id === member.id;

                                    return (
                                        <button
                                            key={member.id}
                                            onClick={() => selectMember(member)}
                                            className={[
                                                "w-full p-4 text-left transition-colors",
                                                isSelected
                                                    ? "bg-primary/10"
                                                    : "hover:bg-secondary/40",
                                            ].join(" ")}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 font-semibold text-primary">
                                                    {member.avatar_url ? (
                                                        <img
                                                            src={
                                                                member.avatar_url
                                                            }
                                                            alt={
                                                                member.full_name ||
                                                                member.email
                                                            }
                                                            className="h-full w-full rounded-xl object-cover"
                                                        />
                                                    ) : (
                                                        getInitials(
                                                            member.full_name,
                                                            member.email
                                                        )
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="truncate font-semibold">
                                                                {member.full_name ||
                                                                    "Unnamed User"}
                                                            </p>
                                                            <p className="truncate text-sm text-muted-foreground">
                                                                {member.email}
                                                            </p>
                                                        </div>

                                                        <span
                                                            className={`flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] capitalize ${getRoleClass(
                                                                member.role
                                                            )}`}
                                                        >
                                                            {getRoleIcon(
                                                                member.role
                                                            )}
                                                            {member.role}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                                <Users className="mb-3 h-10 w-10 text-muted-foreground" />
                                <p className="font-medium">
                                    No team members found
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Invite users to collaborate in this workspace.
                                </p>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="flex min-h-0 flex-col overflow-hidden border-border/50 bg-card/60">
                    {selectedMember ? (
                        <div className="flex h-full flex-col">
                            <div className="border-b border-border/50 p-5">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-lg font-bold text-primary">
                                        {selectedMember.avatar_url ? (
                                            <img
                                                src={selectedMember.avatar_url}
                                                alt={
                                                    selectedMember.full_name ||
                                                    selectedMember.email
                                                }
                                                className="h-full w-full rounded-2xl object-cover"
                                            />
                                        ) : (
                                            getInitials(
                                                selectedMember.full_name,
                                                selectedMember.email
                                            )
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-xl font-semibold">
                                                {selectedMember.full_name ||
                                                    "Unnamed User"}
                                            </h2>

                                            <span
                                                className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs capitalize ${getRoleClass(
                                                    selectedMember.role
                                                )}`}
                                            >
                                                {getRoleIcon(
                                                    selectedMember.role
                                                )}
                                                {selectedMember.role}
                                            </span>
                                        </div>

                                        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                            <Mail className="h-4 w-4" />
                                            {selectedMember.email}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5">
                                <div className="mb-5 grid gap-4 md:grid-cols-2">
                                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Role
                                        </p>
                                        <p className="mt-1 capitalize">
                                            {selectedMember.role}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Joined
                                        </p>
                                        <p className="mt-1">
                                            {new Date(
                                                selectedMember.created_at
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/10 p-4">
                                    <p className="font-semibold text-primary">
                                        Current Permissions
                                    </p>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {
                                            roleDescription[
                                            selectedMember.role
                                            ]
                                        }
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-border/60 bg-background/40 p-5">
                                    <h3 className="mb-4 font-semibold">
                                        Change Role
                                    </h3>

                                    {canChangeRole ? (
                                        <select
                                            value={selectedMember.role}
                                            disabled={
                                                selectedMember.role === "owner" ||
                                                isUpdatingRole
                                            }
                                            onChange={(event) =>
                                                handleRoleChange(
                                                    selectedMember,
                                                    event.target.value as UserRole
                                                )
                                            }
                                            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="owner">Owner</option>
                                            <option value="admin">Admin</option>
                                            <option value="agent">Agent</option>
                                            <option value="viewer">Viewer</option>
                                        </select>
                                    ) : (
                                        <span className="text-muted-foreground">
                                            {selectedMember.role}
                                        </span>
                                    )}

                                    {selectedMember.role === "owner" && (
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            Owner role cannot be changed from this page.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                            <Users className="mb-3 h-10 w-10 text-muted-foreground" />
                            <p className="font-medium">Select a team member</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Choose a person to inspect their role and permissions.
                            </p>
                        </div>
                    )}
                </Card>
            </div>

            {isInviteOpen && (
                <InviteMemberModal
                    open={isInviteOpen}
                    onClose={() => setIsInviteOpen(false)}
                />
            )}
        </div>
    );
};

export default TeamPage;