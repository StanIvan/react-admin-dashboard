# Northstar Studio — Workspace Demo

A responsive front-end demo for exploring project, team, and workspace analytics. Built with React, TypeScript, and Vite.

This is an independently written demo implementation using fictional sample data. It is not affiliated with or connected to any particular dashboard template or service.

## Features

- Workspace overview and analytics with revenue, traffic, device, and project summaries
- Selectable reporting periods and downloadable revenue CSV exports
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
> Dashboard analytics use deterministic sample data; exporting produces a CSV of those sample revenue figures. Profile and preference changes are saved in this browser only.
> Names, addresses, and transactions shown in the app are sample content. Email addresses use the reserved `example.com` domain and are not contact details.
> Open the **Auth** section from the workspace navigation to preview sign-in (including its two-column layout), sign-up, password recovery, and one-time-code screens.

Third-party software notices are available in [`public/THIRD_PARTY_NOTICES.md`](./public/THIRD_PARTY_NOTICES.md) in the source repository and at `/THIRD_PARTY_NOTICES.md` in the built demo.

## Getting started

Requirements: Node.js 20.19+ or 22.12+, and npm.

```bash
npm install
npm run dev
```

## Available scripts

```bash
npm run dev      # Start the local development server
npm run build    # Type-check and create a production build
npm run lint     # Run Oxlint
npm run preview  # Preview the production build
```
