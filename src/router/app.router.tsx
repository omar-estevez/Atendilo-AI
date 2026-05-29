import { createBrowserRouter } from "react-router";
import { MainLayout } from "@/principal/layouts/MainLayout";
import { FormLayout } from "@/principal/layouts/FormLayout";
import { DashLayout } from "@/admin/layouts/DashLayout";
import { HomePage } from "@/principal/pages/home/HomePage";
import { MainPage } from "@/admin/pages/main-pages/main/MainPage";

import {
    AcceptInvitePage,
    ActivityPage,
    AnalyticsPage,
    ApiKeysPage,
    AppearancePage,
    BillingPage,
    BookingsPage,
    BusinessPage,
    ChannelPage,
    ContactPage,
    ConversationPage,
    FlowsPage,
    ForgotPasswordPage,
    IntegrationsPage,
    LanguagePage,
    LeadsPage,
    LoginPage,
    NotificationPage,
    PrivacyPage,
    RegisterPage,
    SecurityPage,
    SecurityPageDash,
    TeamPage,
    TemplatesPage,
    TermsPage,
    VoiceAiPage,
    WebhooksPage,
} from "./routes/lazy-pages";

import { ProtectedRoute } from "./routes/ProtectedRoute";
import { ModuleRoute } from "./routes/ModuleRoute";
import { ChannelModuleRoute } from "./routes/ChannelModuleRoute";

export const appRouter = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: "contact",
                element: <ContactPage />,
            },
        ],
    },
    {
        path: "/",
        element: <FormLayout />,
        children: [
            {
                path: "login",
                element: <LoginPage />,
            },
            {
                path: "register",
                element: <RegisterPage />,
            },
            {
                path: "forgot-password",
                element: <ForgotPasswordPage />,
            },
            {
                path: "privacy",
                element: <PrivacyPage />,
            },
            {
                path: "terms",
                element: <TermsPage />,
            },
            {
                path: "security",
                element: <SecurityPage />,
            },
            {
                path: "accept-invite",
                element: <AcceptInvitePage />,
            },
        ],
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: "/dashboard",
                element: <DashLayout />,
                children: [
                    {
                        index: true,
                        element: <MainPage />,
                    },

                    {
                        element: <ModuleRoute moduleKey="conversations" />,
                        children: [
                            {
                                path: "conversations",
                                element: <ConversationPage />,
                            },
                        ],
                    },

                    {
                        element: <ModuleRoute moduleKey="voice_ai" />,
                        children: [
                            {
                                path: "voice",
                                element: <VoiceAiPage />,
                            },
                        ],
                    },

                    {
                        element: <ModuleRoute moduleKey="bookings" />,
                        children: [
                            {
                                path: "bookings",
                                element: <BookingsPage />,
                            },
                        ],
                    },

                    {
                        element: <ModuleRoute moduleKey="leads" />,
                        children: [
                            {
                                path: "leads",
                                element: <LeadsPage />,
                            },
                        ],
                    },

                    {
                        element: <ModuleRoute moduleKey="analytics" />,
                        children: [
                            {
                                path: "analytics",
                                element: <AnalyticsPage />,
                            },
                        ],
                    },

                    {
                        element: <ModuleRoute moduleKey="ai_activity" />,
                        children: [
                            {
                                path: "ai-activity",
                                element: <ActivityPage />,
                            },
                        ],
                    },

                    {
                        element: <ModuleRoute moduleKey="ai_flows" />,
                        children: [
                            {
                                path: "flows",
                                element: <FlowsPage />,
                            },
                        ],
                    },

                    {
                        element: <ModuleRoute moduleKey="templates" />,
                        children: [
                            {
                                path: "templates",
                                element: <TemplatesPage />,
                            },
                        ],
                    },

                    {
                        element: <ChannelModuleRoute />,
                        children: [
                            {
                                path: "channels/:channel",
                                element: <ChannelPage />,
                            },
                        ],
                    },

                    {
                        element: <ModuleRoute moduleKey="webhooks" />,
                        children: [
                            {
                                path: "webhooks",
                                element: <WebhooksPage />,
                            },
                        ],
                    },

                    {
                        element: <ModuleRoute moduleKey="integrations" />,
                        children: [
                            {
                                path: "integrations",
                                element: <IntegrationsPage />,
                            },
                        ],
                    },

                    {
                        element: <ModuleRoute moduleKey="api_keys" />,
                        children: [
                            {
                                path: "api",
                                element: <ApiKeysPage />,
                            },
                        ],
                    },

                    {
                        element: <ModuleRoute moduleKey="business" />,
                        children: [
                            {
                                path: "business",
                                element: <BusinessPage />,
                            },
                        ],
                    },

                    {
                        element: <ModuleRoute moduleKey="team" />,
                        children: [
                            {
                                path: "team",
                                element: <TeamPage />,
                            },
                        ],
                    },

                    {
                        element: <ModuleRoute moduleKey="billing" />,
                        children: [
                            {
                                path: "billing",
                                element: <BillingPage />,
                            },
                        ],
                    },

                    {
                        element: <ModuleRoute moduleKey="security" />,
                        children: [
                            {
                                path: "security",
                                element: <SecurityPageDash />,
                            },
                        ],
                    },

                    {
                        element: <ModuleRoute moduleKey="notifications" />,
                        children: [
                            {
                                path: "notifications",
                                element: <NotificationPage />,
                            },
                        ],
                    },

                    {
                        element: <ModuleRoute moduleKey="business" />,
                        children: [
                            {
                                path: "appearance",
                                element: <AppearancePage />,
                            },
                            {
                                path: "language",
                                element: <LanguagePage />,
                            },
                        ],
                    },
                ],
            },
        ],
    },
]);