// src/config/rolePermissions.ts

export type UserRole = "owner" | "admin" | "agent" | "viewer";

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
    owner: [
        "dashboard.view",

        "conversations.view",
        "conversations.reply",
        "conversations.assign",

        "voice_ai.view",
        "voice_ai.manage",

        "bookings.view",
        "bookings.create",
        "bookings.edit",
        "bookings.delete",

        "leads.view",
        "leads.create",
        "leads.edit",
        "leads.delete",

        "analytics.view",

        "ai_activity.view",

        "ai_flows.view",
        "ai_flows.create",
        "ai_flows.edit",
        "ai_flows.delete",

        "templates.view",
        "templates.create",
        "templates.edit",
        "templates.delete",

        "channels.view",
        "channels.manage",

        "webhooks.view",
        "webhooks.manage",

        "integrations.view",
        "integrations.manage",

        "api_keys.view",
        "api_keys.create",
        "api_keys.delete",

        "business.view",
        "business.edit",

        "team.view",
        "team.invite",
        "team.change_role",
        "team.remove",

        "billing.view",
        "billing.manage",

        "security.view",
        "security.edit",

        "notifications.view",
        "notifications.edit",
    ],

    admin: [
        "dashboard.view",

        "conversations.view",
        "conversations.reply",
        "conversations.assign",

        "voice_ai.view",
        "voice_ai.manage",

        "bookings.view",
        "bookings.create",
        "bookings.edit",
        "bookings.delete",

        "leads.view",
        "leads.create",
        "leads.edit",
        "leads.delete",

        "analytics.view",

        "ai_activity.view",

        "ai_flows.view",
        "ai_flows.create",
        "ai_flows.edit",

        "templates.view",
        "templates.create",
        "templates.edit",

        "channels.view",
        "channels.manage",

        "webhooks.view",
        "webhooks.manage",

        "integrations.view",
        "integrations.manage",

        "business.view",
        "business.edit",

        "team.view",
        "team.invite",

        "security.view",
        "security.edit",

        "notifications.view",
        "notifications.edit",
    ],

    agent: [
        "dashboard.view",

        "conversations.view",
        "conversations.reply",
        "conversations.assign",

        "voice_ai.view",

        "bookings.view",
        "bookings.create",
        "bookings.edit",

        "leads.view",
        "leads.create",
        "leads.edit",

        "analytics.view",

        "ai_activity.view",

        "templates.view",

        "security.view",
        "security.edit",

        "notifications.view",
    ],

    viewer: [
        "dashboard.view",

        "conversations.view",

        "voice_ai.view",

        "bookings.view",

        "leads.view",

        "analytics.view",

        "ai_activity.view",

        "templates.view",

        "security.view",
        "security.edit",

        "notifications.view",
    ],
};