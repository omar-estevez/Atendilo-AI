import { useState } from "react";
import { Camera, X } from "lucide-react";

interface EditProfileModalProps {
    currentName?: string | null;
    currentAvatarUrl?: string | null;
    currentEmail?: string | null;
    onClose: () => void;
    onSave: (data: {
        fullName: string;
        avatarFile: File | null;
    }) => Promise<void> | void;
}

const getInitials = (name?: string | null) => {
    if (!name) return "U";

    return name
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
};

export const EditProfileModal = ({
    currentName,
    currentAvatarUrl,
    currentEmail,
    onClose,
    onSave,
}: EditProfileModalProps) => {
    const [fullName, setFullName] = useState(currentName || "");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        currentAvatarUrl || null
    );
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) return;

        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        try {
            setSaving(true);

            await onSave({
                fullName: fullName.trim(),
                avatarFile,
            });

            onClose();
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-border/60 bg-background p-5 shadow-2xl">
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">Edit profile</h2>
                        <p className="text-sm text-muted-foreground">
                            Update your name and avatar.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="mb-5 flex flex-col items-center gap-3">
                    <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-primary/20">
                        {avatarPreview ? (
                            <img
                                src={avatarPreview}
                                alt="Avatar preview"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-2xl font-semibold text-primary">
                                {getInitials(fullName || currentEmail)}
                            </span>
                        )}

                        <label className="absolute bottom-1 right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90">
                            <Camera className="h-4 w-4" />

                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </label>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        JPG, PNG or WebP recommended.
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Full name</label>

                    <input
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        placeholder="Enter your full name"
                        className="w-full rounded-xl border border-border/60 bg-secondary/40 px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                    />
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={saving || !fullName.trim()}
                        className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? "Saving..." : "Save changes"}
                    </button>
                </div>
            </div>
        </div>
    );
};