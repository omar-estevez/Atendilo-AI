import type { BusinessProfileType } from "@/admin/types";
import { Card } from "@/components/ui/card";
import { BriefcaseBusiness, Globe, Mail, MapPin, Phone } from "lucide-react";
import type { Dispatch, ReactNode, SetStateAction } from "react";

interface ProfileProps {
    businessProfile: BusinessProfileType;
    setBusinessProfile: Dispatch<SetStateAction<BusinessProfileType>>;
    inputClass: string;
    sectionHeader: (
        icon: ReactNode,
        title: string,
        description?: string
    ) => ReactNode;
    showSavedMessage?: (message: string) => void;
}

export const BusinessProfile = ({
    businessProfile,
    setBusinessProfile,
    inputClass,
    sectionHeader,
}: ProfileProps) => {
    return (
        <Card className="overflow-hidden border-border/50 bg-card/60">
            <div className="border-b border-border/50 bg-background/30 p-5">
                {sectionHeader(
                    <BriefcaseBusiness className="h-5 w-5" />,
                    "General Information",
                    "Basic business details used by Lumora AI when speaking with customers."
                )}
            </div>

            <div className="space-y-5 p-5">
                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Business Name <span className="text-red-400">*</span>
                    </label>

                    <input
                        value={businessProfile.businessName}
                        onChange={(event) =>
                            setBusinessProfile({
                                ...businessProfile,
                                businessName: event.target.value,
                            })
                        }
                        placeholder="Lumora Demo Business"
                        className={inputClass}
                    />

                    {!businessProfile.businessName.trim() && (
                        <p className="mt-1 text-xs text-amber-400">
                            Business name is required.
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Industry
                        </label>

                        <input
                            value={businessProfile.industry}
                            onChange={(event) =>
                                setBusinessProfile({
                                    ...businessProfile,
                                    industry: event.target.value,
                                })
                            }
                            placeholder="Auto detailing, cleaning, roofing..."
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                            <MapPin className="h-4 w-4 text-primary" />
                            Business Address
                        </label>

                        <input
                            value={businessProfile.address}
                            onChange={(event) =>
                                setBusinessProfile({
                                    ...businessProfile,
                                    address: event.target.value,
                                })
                            }
                            placeholder="Houston, TX"
                            className={inputClass}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            City
                        </label>

                        <input
                            value={businessProfile.city}
                            onChange={(event) =>
                                setBusinessProfile({
                                    ...businessProfile,
                                    city: event.target.value,
                                })
                            }
                            placeholder="Houston"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            State
                        </label>

                        <input
                            value={businessProfile.state}
                            onChange={(event) =>
                                setBusinessProfile({
                                    ...businessProfile,
                                    state: event.target.value,
                                })
                            }
                            placeholder="Texas"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Country
                        </label>

                        <input
                            value={businessProfile.country}
                            onChange={(event) =>
                                setBusinessProfile({
                                    ...businessProfile,
                                    country: event.target.value,
                                })
                            }
                            placeholder="United States"
                            className={inputClass}
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Timezone
                    </label>

                    <select
                        value={businessProfile.timezone}
                        onChange={(event) =>
                            setBusinessProfile({
                                ...businessProfile,
                                timezone: event.target.value,
                            })
                        }
                        className={inputClass}
                    >
                        <option value="America/Chicago">America/Chicago</option>
                        <option value="America/New_York">America/New_York</option>
                        <option value="America/Los_Angeles">America/Los_Angeles</option>
                        <option value="America/Bogota">America/Bogota</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                            <Mail className="h-4 w-4 text-primary" />
                            Email
                        </label>

                        <input
                            type="email"
                            value={businessProfile.email}
                            onChange={(event) =>
                                setBusinessProfile({
                                    ...businessProfile,
                                    email: event.target.value,
                                })
                            }
                            placeholder="hello@business.com"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                            <Phone className="h-4 w-4 text-primary" />
                            Phone
                        </label>

                        <input
                            type="tel"
                            value={businessProfile.phone}
                            onChange={(event) =>
                                setBusinessProfile({
                                    ...businessProfile,
                                    phone: event.target.value,
                                })
                            }
                            placeholder="+1 346 000 0000"
                            className={inputClass}
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                        <Globe className="h-4 w-4 text-primary" />
                        Website
                    </label>

                    <input
                        value={businessProfile.website}
                        onChange={(event) =>
                            setBusinessProfile({
                                ...businessProfile,
                                website: event.target.value,
                            })
                        }
                        placeholder="https://yourbusiness.com"
                        className={inputClass}
                    />
                </div>

                <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
                    <p className="text-sm font-medium text-primary">
                        AI Context Preview
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Lumora will use this profile to introduce the business,
                        personalize answers, and understand service location.
                    </p>
                </div>
            </div>
        </Card>
    );
};