import { lazy } from 'react'


// *****************************************
// *************** PUBLIC ******************
// *****************************************
export const ContactPage = lazy(() =>
    import('@/principal/pages/contact/ContactPage')
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

// *****************************************
// ************* DASHBOARD *****************
// *****************************************

export const ConversationPage = lazy(() =>
    import('@/admin/pages/main-pages/conversation/ConversationPage')
)
export const VoiceAiPage = lazy(() =>
    import('@/admin/pages/main-pages/voice-ai/VoiceAiPage')
)
export const BookingsPage = lazy(() =>
    import('@/admin/pages/main-pages/bookings/BookingsPage')
)
export const LeadsPage = lazy(() =>
    import('@/admin/pages/main-pages/leads/LeadsPage')
)
export const AnalyticsPage = lazy(() =>
    import('@/admin/pages/main-pages/analytics/AnalyticsPage')
)
export const ActivityPage = lazy(() =>
    import('@/admin/pages/intelligence-pages/activity/ActivityPage')
)
export const FlowsPage = lazy(() =>
    import('@/admin/pages/intelligence-pages/flows/FlowsPage')
)
export const TemplatesPage = lazy(() =>
    import('@/admin/pages/intelligence-pages/templates/TemplatesPage')
)
export const WebhooksPage = lazy(() =>
    import('@/admin/pages/integration-pages/webhooks/WebhooksPage')
)
export const IntegrationsPage = lazy(() =>
    import('@/admin/pages/integration-pages/integrations/IntegrationsPage')
)
export const ApiKeysPage = lazy(() =>
    import('@/admin/pages/integration-pages/api-keys/ApiKeysPage')
)
export const BusinessPage = lazy(() =>
    import('@/admin/pages/config-pages/business/BusinessPage')
)
export const TeamPage = lazy(() =>
    import('@/admin/pages/config-pages/team/TeamPage')
)
export const BillingPage = lazy(() =>
    import('@/admin/pages/config-pages/billing/BillingPage')
)
export const SecurityPageDash = lazy(() =>
    import('@/admin/pages/config-pages/security/SecurityPage')
)
export const NotificationPage = lazy(() =>
    import('@/admin/pages/config-pages/notification/NotificationPage')
)
export const AppearancePage = lazy(() =>
    import('@/admin/pages/config-pages/appearance/AppearancePage')
)
export const LanguagePage = lazy(() =>
    import('@/admin/pages/config-pages/language/LanguagePage')
)
export const ChannelPage = lazy(() =>
    import('@/admin/pages/channel-pages/ChannelPage')
)
