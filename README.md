# Atendilo AI

Atendilo AI is a modern AI automation SaaS interface designed for service-based businesses that want to manage customer conversations, leads, bookings, AI flows, voice AI, integrations, and business settings from one centralized dashboard.

The project includes a public marketing landing page, authentication screens, legal pages, and a multi-section admin dashboard built with React, TypeScript, Vite, Tailwind CSS, shadcn-style UI components, Framer Motion, and React Router.

---

## Overview

Atendilo AI is built as a frontend SaaS platform for an AI agency model. The main idea is that each business/client can access its own dashboard and, depending on the selected plan, enable different automation modules such as:

- AI-powered conversations
- Voice AI
- Booking management
- Lead tracking
- Analytics
- AI activity monitoring
- Automation flows
- Message templates
- Channel configuration
- Webhooks
- Integrations
- API keys
- Business settings
- Team management
- Billing
- Security settings
- Notifications
- Appearance and language preferences

This version focuses on the frontend experience, UI structure, routing, and mock data representation for the future backend, database, and AI integrations.

---

## Tech Stack

- **React**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **shadcn-style components**
- **Radix UI**
- **Framer Motion**
- **Lucide React**
- **React Router**
- **ESLint**

---

## Main Features

### Public Website

The public side of Atendilo includes a marketing-oriented landing page with sections for:

- Hero section
- Features
- Chat demo
- How it works
- Industries
- Pricing
- Social proof
- Final call to action

It also includes public pages such as:

- Contact
- Login
- Register
- Forgot Password
- Privacy Policy
- Terms of Service
- Security

---

### Admin Dashboard

The dashboard is designed as the control center for each business/client.

Current dashboard modules include:

- Main dashboard overview
- Conversations
- Voice AI
- Bookings
- Leads
- Analytics
- AI Activity
- Flows
- Templates
- Channels
- Webhooks
- Integrations
- API Keys
- Business settings
- Team
- Billing
- Security
- Notifications
- Appearance
- Language

---

### AI Activity Center

The main dashboard includes an AI activity section that displays recent AI actions such as:

- AI responses
- Booking activity
- Lead generation
- Voice AI activity
- Follow-ups
- Escalations
- Quotes

This helps visualize how the AI assistant is operating across enabled channels.

---

### Intelligent Conversations

The dashboard includes a conversation preview system with AI insights such as:

- Customer intent
- Urgency level
- Sentiment
- Lead score
- AI-generated summary

This is intended to help business owners quickly understand the status and value of each customer conversation.

---

### Bookings and Leads

Atendilo includes UI sections for tracking upcoming bookings, lead information, customer activity, and business opportunities generated through AI-powered interactions.

---

### AI Flows

The platform includes an automation flow section designed to represent AI workflows, usage, conversion rates, and automation performance.

---

### Multi-Channel Structure

Atendilo is structured to support different communication channels such as:

- WhatsApp
- SMS
- Web Chat
- Email
- Voice AI

Each channel can be configured and connected depending on the business needs and plan.

---

## Project Structure

```bash
src/
├── admin/
│   ├── components/
│   ├── data/
│   │   └── mock/
│   ├── layouts/
│   ├── pages/
│   │   ├── channel-pages/
│   │   ├── config-pages/
│   │   ├── integration-pages/
│   │   ├── intelligence-pages/
│   │   └── main-pages/
│   └── types/
│
├── components/
│   └── ui/
│
├── lib/
│
├── principal/
│   ├── components/
│   ├── layouts/
│   └── pages/
│       ├── contact/
│       ├── forgot-password/
│       ├── home/
│       ├── login/
│       ├── privacy/
│       ├── register/
│       ├── security/
│       └── terms/
│
├── router/
│   ├── routes/
│   └── app.router.tsx
│
├── shared/
├── utils/
├── AgencyApp.tsx
├── index.css
└── main.tsx