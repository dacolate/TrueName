# TrueName

A full-stack Next.js application with authentication, user administration, MongoDB persistence, game history, account balances, and generated OpenAPI documentation.

## Overview

TrueName is built as a modern Next.js application using server actions and API routes. It includes email/password authentication, role-aware administration, persistent user/game data, and an API documentation surface.

## Main Features

- Email and password authentication
- User administration with Better Auth
- MongoDB-backed persistence
- User profile fields including phone and balance
- Game-result history and balance updates
- Administrative user editing
- API routes and OpenAPI documentation
- Responsive UI with Radix primitives and Tailwind CSS

## Tech Stack

- **Framework:** Next.js 15
- **Frontend:** React 19, TypeScript
- **Database:** MongoDB
- **Authentication:** Better Auth
- **API documentation:** OpenAPI / Swagger UI
- **Validation:** Zod
- **UI:** Tailwind CSS, Radix UI, Lucide React

## Getting Started

```bash
git clone https://github.com/dacolate/TrueName.git
cd TrueName
npm install
```

Create the environment variables required for the MongoDB connection and authentication configuration, then run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Useful Commands

```bash
npm run dev
npm run build
npm run db:setup
```

## Notes

This repository is an application project and should not be treated as production-ready without reviewing environment, security, and deployment configuration for the target environment.
