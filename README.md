# Northstar Studio — Workspace Demo

A responsive front-end demo for exploring project, team, and workspace analytics. Built with React, TypeScript, and Vite.

## Features

- Workspace overview and analytics with revenue, traffic, device, and project summaries
- Selectable reporting periods and downloadable activity/revenue CSV exports
- Searchable project and team directories
- User and task management with filtering and CSV task import
- App integration catalogue with locally saved demo connection states
- Team inbox with locally saved demo conversations and messaging
- Sign-in, registration, password recovery, and one-time-code preview screens
- Create projects directly from the dashboard
- Reports with selectable date ranges
- Profile, account, appearance, notification, and sidebar display settings
- Responsive navigation and a compact mobile layout

> Integrations and messages are local demos. They do not connect to external services or deliver messages.
> Authentication screens are frontend previews only. No accounts, credentials, verification codes, or recovery emails are sent to or checked by a server.
> Dashboard analytics and reports use deterministic sample data; exports contain those sample figures. Projects, tasks, users, integration choices, conversations, and preferences are saved in this browser only.
> Names, addresses, and transactions shown in the app are sample content. Email addresses use the reserved `example.com` domain and are not contact details.
> Team invitations are local demo records. The demo does not generate shareable invitation links or send email.
> Open the **Auth** section from the workspace navigation to preview sign-in (including its two-column layout), sign-up, password recovery, and one-time-code screens.

Third-party software notices are available in [`public/THIRD_PARTY_NOTICES.md`](./public/THIRD_PARTY_NOTICES.md) in the source repository and at `/THIRD_PARTY_NOTICES.md` in the built demo.

## Getting started

Requirements: Node.js 20.19+ or 22.12+, and npm.

```bash
npm install
npm run dev
```

To run the tests, install the Playwright Chromium browser once and run the test scripts:

```bash
npx playwright install chromium
npm test
```

## Available scripts

```bash
npm run dev      # Start the local development server
npm run build    # Type-check and create a production build
npm run lint     # Run Oxlint
npm run preview  # Preview the production build
npm run test:unit # Run unit tests
npm run test:e2e  # Run browser end-to-end tests
```
