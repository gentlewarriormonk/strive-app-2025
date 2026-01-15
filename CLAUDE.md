# Strive App

## Overview
Habit tracking app for schools. Teachers create classes, students join and track habits together.

## Tech Stack
- Next.js 16 (App Router)
- TypeScript
- Prisma + PostgreSQL (Supabase)
- NextAuth with Google OAuth
- TailwindCSS + shadcn/ui

## Key Files
- prisma/schema.prisma - Database models
- src/lib/auth.ts - NextAuth config
- src/lib/prisma.ts - Database client
- src/app/student/today/page.tsx - Student dashboard
- src/app/teacher/dashboard/page.tsx - Teacher dashboard

## Database
- Connected via Supabase-Vercel integration
- Uses POSTGRES_PRISMA_URL and POSTGRES_URL_NON_POOLING env vars

## Conventions
- Push directly to main branch (solo developer)
- Use existing shadcn/ui components when possible
- API routes go in src/app/api/

## Current Status
- ✅ Auth working (Google OAuth)
- ✅ Deployed on Vercel
- 🔄 Building: Real habit CRUD (replacing mock data)
