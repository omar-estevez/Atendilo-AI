import { useState } from "react";
import { Mail, ShieldCheck, UserPlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useTeamInvitationsStore } from "@/store/dashboard/teamInvitationsStore";
import type { UserRole } from "@/services/businessService";

interface InviteMemberModalProps {
    open: boolean;
    onClose: () => void;
}

const roleOptions: { value: UserRole; label: string; description: string }[] = [
    {
        value: "admin",
        label: "Admin",
        description: "Can manage settings, team, integrations and operations.",
    },
    {
        value: "agent",
        label: "Agent",
        description: "Can manage conversations, leads and bookings.",
    },
    {
        value: "viewer",
        label: "Viewer",
        description: "Can only view dashboard data and reports.",
    },
];

export const InviteMemberModal = ({
    open,
    onClose,
}: InviteMemberModalProps) => {
    const business = useAuthStore((state) => state.business);
    const profile = useAuthStore((state) => state.profile);
    const createInvitation = useTeamInvitationsStore(
        (state) => state.createInvitation
    );

    const [email, setEmail] = useState("");
    const [role, setRole] = useState<UserRole>("agent");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    if (!open) return null;

    const resetForm = () => {
        setEmail("");
        setRole("agent");
        setFormError(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const isValidEmail = (value: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!business) {
            setFormError("No business found.");
            return;
        }

        if (!isValidEmail(email)) {
            setFormError("Enter a valid email address.");
            return;
        }

        try {
            setIsSubmitting(true);
            setFormError(null);

            await createInvitation({
                business_id: business.id,
                email,
                role,
                invited_by: profile?.id || null,
            });

            handleClose();
        } catch (error) {
            setFormError(
                error instanceof Error
                    ? error.message
                    : "Failed to invite member"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl">
                <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Invite Team Member
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Send an invitation link to join this Atendilo workspace.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-5">
                    {formError && (
                        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
                            <p className="text-sm text-red-400">
                                {formError}
                            </p>
                        </div>
                    )}

                    <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                            <ShieldCheck className="h-4 w-4" />
                            Secure Invitation Flow
                        </p>

                        <p className="mt-2 text-sm text-muted-foreground">
                            The person will not be added as a real user until they accept the invitation.
                        </p>
                    </div>

                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                            <Mail className="h-4 w-4 text-primary" />
                            Email Address
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="teammate@example.com"
                            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="mb-3 block text-sm font-medium">
                            Role
                        </label>

                        <div className="grid gap-3">
                            {roleOptions.map((option) => {
                                const isSelected = role === option.value;

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setRole(option.value)}
                                        className={[
                                            " cursor-pointer rounded-xl border p-4 text-left transition-colors",
                                            isSelected
                                                ? "border-primary bg-primary/15"
                                                : "border-border bg-background hover:bg-secondary/40",
                                        ].join(" ")}
                                    >
                                        <p className="font-medium capitalize">
                                            {option.label}
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {option.description}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-border/50 pt-5">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-primary hover:bg-primary/90"
                        >
                            <UserPlus className="mr-2 h-4 w-4" />
                            {isSubmitting ? "Creating..." : "Create Invite"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InviteMemberModal;