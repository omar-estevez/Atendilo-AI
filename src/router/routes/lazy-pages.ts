import { lazy } from 'react'


// *****************************************
// *************** PUBLIC ******************
// *****************************************
export const MainLayout = lazy(() =>
    import('@/principal/layouts/MainLayout')
)
export const HomePage = lazy(() =>
    import('@/principal/pages/home/HomePage')
)
export const ContactPage = lazy(() =>
    import('@/principal/pages/contact/ContactPage')
)
export const FormLayout = lazy(() =>
    import('@/principal/layouts/FormLayout')
)
export const LoginPage = lazy(() =>
    import('@/principal/pages/login/LoginPage')
)
export const RegisterPage = lazy(() =>
    import('@/principal/pages/register/RegisterPage')
)
export const ForgotPasswordPage = lazy(() =>
    import('@/principal/pages/forgot-password/ForgotPasswordPage')
)
export const PrivacyPage = lazy(() =>
    import('@/principal/pages/privacy/PrivacyPage')
)
export const TermsPage = lazy(() =>
    import('@/principal/pages/terms/TermsPage')
)
export const SecurityPage = lazy(() =>
    import('@/principal/pages/security/SecurityPage')
)
export const AcceptInvitePage = lazy(() =>
    import('@/principal/pages/accept-invitation/AcceptInvitePage')
)
export const ResetPasswordPage = lazy(() =>
    import('@/principal/pages/reset-password/ResetPasswordPage')
)

// *****************************************
// ************* DASHBOARD *****************
// *****************************************

export const ProtectedRoute = lazy(() =>
    import('./ProtectedRoute')
)
export const DashLayout = lazy(() =>
    import('@/dashboard/layouts/DashLayout')
)
export const MainPage = lazy(() =>
    import('@/dashboard/pages/main-pages/main/MainPage')
)
export const ConversationPage = lazy(() =>
    import('@/dashboard/pages/main-pages/conversation/ConversationPage')
)
export const VoiceAiPage = lazy(() =>
    import('@/dashboard/pages/main-pages/voice-ai/VoiceAiPage')
)
export const BookingsPage = lazy(() =>
    import('@/dashboard/pages/main-pages/bookings/BookingsPage')
)
export const LeadsPage = lazy(() =>
    import('@/dashboard/pages/main-pages/leads/LeadsPage')
)
export const AnalyticsPage = lazy(() =>
    import('@/dashboard/pages/main-pages/analytics/AnalyticsPage')
)
export const ActivityPage = lazy(() =>
    import('@/dashboard/pages/intelligence-pages/activity/ActivityPage')
)
export const FlowsPage = lazy(() =>
    import('@/dashboard/pages/intelligence-pages/flows/FlowsPage')
)
export const TemplatesPage = lazy(() =>
    import('@/dashboard/pages/intelligence-pages/templates/TemplatesPage')
)
export const WebhooksPage = lazy(() =>
    import('@/dashboard/pages/integration-pages/webhooks/WebhooksPage')
)
export const IntegrationsPage = lazy(() =>
    import('@/dashboard/pages/integration-pages/integrations/IntegrationsPage')
)
export const ApiKeysPage = lazy(() =>
    import('@/dashboard/pages/integration-pages/api-keys/ApiKeysPage')
)
export const BusinessPage = lazy(() =>
    import('@/dashboard/pages/config-pages/business/BusinessPage')
)
export const TeamPage = lazy(() =>
    import('@/dashboard/pages/config-pages/team/TeamPage')
)
export const BillingPage = lazy(() =>
    import('@/dashboard/pages/config-pages/billing/BillingPage')
)
export const SecurityPageDash = lazy(() =>
    import('@/dashboard/pages/config-pages/security/SecurityPage')
)
export const NotificationPage = lazy(() =>
    import('@/dashboard/pages/config-pages/notification/NotificationPage')
)
export const AppearancePage = lazy(() =>
    import('@/dashboard/pages/config-pages/appearance/AppearancePage')
)
export const LanguagePage = lazy(() =>
    import('@/dashboard/pages/config-pages/language/LanguagePage')
)
export const ChannelPage = lazy(() =>
    import('@/dashboard/pages/channel-pages/ChannelPage')
)
export const ChannelModuleRoute = lazy(() =>
    import('./ChannelModuleRoute')
)
export const AccessRoute = lazy(() =>
    import('./AccessRoute')
)