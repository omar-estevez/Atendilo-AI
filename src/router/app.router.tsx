import { createBrowserRouter } from "react-router";
import {
    AcceptInvitePage,
    AccessRoute,
    ActivityPage,
    AnalyticsPage,
    ApiKeysPage,
    AppearancePage,
    BillingPage,
    BookingsPage,
    BusinessPage,
    ChannelModuleRoute,
    ChannelPage,
    ContactPage,
    ConversationPage,
    DashLayout,
    FlowsPage,
    ForgotPasswordPage,
    FormLayout,
    HomePage,
    IntegrationsPage,
    LanguagePage,
    LeadsPage,
    LoginPage,
    MainLayout,
    MainPage,
    NotificationPage,
    PrivacyPage,
    ProtectedRoute,
    RegisterPage,
    ResetPasswordPage,
    SecurityPage,
    SecurityPageDash,
    TeamPage,
    TemplatesPage,
    TermsPage,
    VoiceAiPage,
    WebhooksPage,
} from "./routes/lazy-pages";

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
            {
                path: "/reset-password",
                element: <ResetPasswordPage />,
            }
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
                        element: (
                            <AccessRoute
                                moduleKey="conversations"
                                permissionKey="conversations.view"
                            />
                        ),
                        children: [
                            {
                                path: "conversations",
                                element: <ConversationPage />,
                            },
                        ],
                    },

                    {
                        element: (
                            <AccessRoute
                                moduleKey="voice_ai"
                                permissionKey="voice_ai.view"
                            />
                        ),
                        children: [
                            {
                                path: "voice",
                                element: <VoiceAiPage />,
                            },
                        ],
                    },

                    {
                        element: (
                            <AccessRoute
                                moduleKey="bookings"
                                permissionKey="bookings.view"
                            />
                        ),
                        children: [
                            {
                                path: "bookings",
                                element: <BookingsPage />,
                            },
                        ],
                    },

                    {
                        element: (
                            <AccessRoute
                                moduleKey="leads"
                                permissionKey="leads.view"
                            />
                        ),
                        children: [
                            {
                                path: "leads",
                                element: <LeadsPage />,
                            },
                        ],
                    },

                    {
                        element: (
                            <AccessRoute
                                moduleKey="analytics"
                                permissionKey="analytics.view"
                            />
                        ),
                        children: [
                            {
                                path: "analytics",
                                element: <AnalyticsPage />,
                            },
                        ],
                    },

                    {
                        element: (
                            <AccessRoute
                                moduleKey="ai_activity"
                                permissionKey="ai_activity.view"
                            />
                        ),
                        children: [
                            {
                                path: "ai-activity",
                                element: <ActivityPage />,
                            },
                        ],
                    },

                    {
                        element: (
                            <AccessRoute
                                moduleKey="ai_flows"
                                permissionKey="ai_flows.view"
                            />
                        ),
                        children: [
                            {
                                path: "flows",
                                element: <FlowsPage />,
                            },
                        ],
                    },

                    {
                        element: (
                            <AccessRoute
                                moduleKey="templates"
                                permissionKey="templates.view"
                            />
                        ),
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
                        element: (
                            <AccessRoute
                                moduleKey="webhooks"
                                permissionKey="webhooks.view"
                            />
                        ),
                        children: [
                            {
                                path: "webhooks",
                                element: <WebhooksPage />,
                            },
                        ],
                    },

                    {
                        element: (
                            <AccessRoute
                                moduleKey="integrations"
                                permissionKey="integrations.view"
                            />
                        ),
                        children: [
                            {
                                path: "integrations",
                                element: <IntegrationsPage />,
                            },
                        ],
                    },

                    {
                        element: (
                            <AccessRoute
                                moduleKey="api_keys"
                                permissionKey="api_keys.view"
                            />
                        ),
                        children: [
                            {
                                path: "api",
                                element: <ApiKeysPage />,
                            },
                        ],
                    },

                    {
                        element: (
                            <AccessRoute
                                moduleKey="business"
                                permissionKey="business.view"
                            />
                        ),
                        children: [
                            {
                                path: "business",
                                element: <BusinessPage />,
                            },
                        ],
                    },

                    {
                        element: (
                            <AccessRoute
                                moduleKey="team"
                                permissionKey="team.view"
                            />
                        ),
                        children: [
                            {
                                path: "team",
                                element: <TeamPage />,
                            },
                        ],
                    },

                    {
                        element: (
                            <AccessRoute
                                moduleKey="billing"
                                permissionKey="billing.view"
                            />
                        ),
                        children: [
                            {
                                path: "billing",
                                element: <BillingPage />,
                            },
                        ],
                    },

                    {
                        element: (
                            <AccessRoute
                                moduleKey="security"
                                permissionKey="security.view"
                            />
                        ),
                        children: [
                            {
                                path: "security",
                                element: <SecurityPageDash />,
                            },
                        ],
                    },

                    {
                        element: (
                            <AccessRoute
                                moduleKey="notifications"
                                permissionKey="notifications.view"
                            />
                        ),
                        children: [
                            {
                                path: "notifications",
                                element: <NotificationPage />,
                            },
                        ],
                    },

                    {
                        element: (
                            <AccessRoute
                                moduleKey="business"
                                permissionKey="business.view"
                            />
                        ),
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