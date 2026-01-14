# Strive App Product Requirements Documents

---

## **1\. Architecture & access model (updated)**

### **1.1. High-level stack**

* **Frontend:** Next.js (App Router) \+ TypeScript

* **UI:** Tailwind \+ a component library (shadcn/ui)

* **Auth:** NextAuth / Auth.js with Google provider

* **Backend:** Next.js server actions / API routes

* **DB:** PostgreSQL (Supabase or Neon)

* **ORM:** Prisma

* **Hosting:** Vercel (web & API) \+ Supabase/Neon (DB)

### **1.2. Access model: “teacher-first, admin-optional”**

Looking at existing platforms:

* **Quizlet:** Any teacher can sign up independently, create classes, and invite students. School-wide orgs and group admins are layered on top (Quizlet for Schools) but are not required for basic use.

* **Google Classroom:** There is a Workspace/domain admin who sets teacher permissions, but teachers generally create and manage their own classes once allowed. Admins control domain-level settings and cross-domain access.

* **Komodo:** Primarily family-facing, not a school multi-tenant model, so less relevant for your role hierarchy.

**Best-practice pattern for Strive:**

* **Platform Admin (you)**

  * Manages global settings, support, feature flags.

* **School / Organisation entity (optional at first use)**

  * Exists for analytics, privacy policy, subscription, etc.

* **School Admin (non-bottleneck)**

  * Can be created later, or automatically when the first teacher “claims” a school.

  * Manages school-wide settings and sees aggregated analytics.

* **Teachers**

  * Any teacher can sign up with Google and:

    * Create an “independent” school (e.g. “REAL School Budapest”) and become School Admin by default, OR

    * Join an existing school using a school code or email-domain match.

  * Teachers can **always** create classes and invite students; they are not blocked by missing School Admin.

* **Students**

  * Join classes by code / QR issued by a teacher.

* **Cross-teacher visibility**

  * By default, teachers in the same school can see:

    * Aggregated school analytics.

    * Other classes’ aggregate stats.

  * Detailed per-student data is visible only to that student’s own teachers, unless a school-level privacy setting allows cross-class teacher view.

This matches the “any teacher can start, org admin for governance” pattern from Quizlet and Google Classroom, without making admins a bottleneck.

---

## **2\. Product Requirements Document** 

### **2.1. Product overview**

* **Name:** Strive

* **Audience:** Middle-school students, teachers, and schools.

* **Core purpose:**

  * Help students (and teachers) build sustainable well-being habits.

  * Make habit-building social and accountable within classes.

  * Provide teachers and schools with useful, privacy-conscious behavior data.

### **2.2. Roles & personas**

* **Platform Admin (you)**

  * Onboards schools, handles support, manages global configurations and feature flags.

* **School Admin (optional but recommended)**

  * Approves/links teachers to the school.

  * Configures school-wide privacy and visibility policies.

  * Views school-level analytics (aggregated, non-identifying where appropriate).

* **Teacher**

  * Signs up with Google, can create or join a school.

  * Creates classes and invites students.

  * Sets own well-being habits (optionally shared with students).

  * Creates class and school-level challenges.

  * Views full habit data for their students.

* **Student**

  * Joins classes via code or QR.

  * Creates and manages personal habits.

  * Participates in class challenges.

  * Sees own stats, classmates’ shared stats, and **teachers’ stats if teacher opts in**.

### **2.3. Authentication & onboarding**

* **Auth**

  * “Continue with Google” for all roles.

* **Teacher onboarding**

  * Any teacher can sign up and:

    1. Create a new school (becomes School Admin \+ Teacher).

    2. Join an existing school via:

       * School invite link/code, or

       * Email domain match (e.g. @realschool.eu).

* **Student onboarding**

  * Student logs in with Google.

  * Enters class code or scans QR from teacher.

  * Joins class; gets assigned to the teacher’s school implicitly.

### **2.4. Habit model (with categories and visibility)**

Each **habit** has:

* **Core fields**

  * Name (free text)

  * Description (optional)

  * Owner: Student or Teacher

  * School & class (for analytics)

* **Categories** (enum, for analytics & community)

  * Sleep

  * Movement

  * Focus & Study

  * Mindfulness & Emotion

  * Social & Connection

  * Nutrition & Hydration

  * Digital Hygiene

  * “Other” \+ optional tags

* **Schedule**

  * Start date

  * End date (optional)

  * Frequency:

    * Daily

    * X times per week (configurable)

    * Specific days of week (Mon/Wed/Fri, etc.)

  * Optionally: preferred time-of-day (future notifications)

* **Visibility controls**

  * Visibility to **teacher**:

    * Always visible. Students cannot hide from teachers.

  * Visibility to **peers** (per habit):

    * “Public to my class”

    * “Visible as anonymised stats only” (counts toward class/category analytics but not shown on leaderboards by name)

    * “Private to peers” (visible only to student \+ teachers \+ aggregated class stats)

  * Visibility for **teacher habits**:

    * “Share with all my classes”

    * “Share with selected classes”

    * “Private to me”

This gives you the ability to see class-level category trends (e.g. sleep habits) while letting vulnerable students keep some habits private from peers.

### **2.5. Tracking and analytics**

* **HabitCompletion** records:

  * habit\_id, user\_id, date, created\_at.

* For each habit, compute:

  * Total days since start

  * Completed days

  * Completion rate

  * Current streak

  * Longest streak

* **Category analytics**

  * Per class, per category:

    * % of students who have at least one active habit in the category.

    * Average completion rate in that category this week / month.

  * Per school:

    * Same, but aggregated.

* **Teacher analytics**

  * For teachers who share habits:

    * Their streaks and completion rates visible to students in classes they share with.

  * This lets you model “I’m walking the walk” as part of the social contract.

### **2.6. Gamification**

Goal: motivating, legible, not manipulative.

* **XP**

  * Each completion gives base XP (e.g. 10).

  * Streak XP multipliers:

    * e.g. 3+ days: 1.2x, 7+ days: 1.5x, 30+ days: 2x.

* **Levels**

  * Level determined by cumulative XP (simple curve).

  * Shared label set for students and teachers:

    * Level 1–5: “Starter, Explorer, Builder, Guide, Mentor” (placeholder names).

* **Badges**

  * 7-day streak badge.

  * 30-day streak badge.

  * Category specialist (e.g. 50 completions in “Sleep”).

* **Leaderboards**

  * Class-level leaderboards:

    * Top XP (this week, this month)

    * Longest active streaks

  * **Privacy-aware:**

    * Only show users who marked the relevant habit(s) as “public to class.”

    * Aggregated stats include all (even private), but private ones appear as unlabelled contributions only.

### **2.7. Social features & reactions**

* **Student-to-student visibility**

  * Class dashboard shows:

    * Public habits per student (name \+ category \+ streak).

    * XP and level.

  * For habits set to “anonymised only,” only aggregated category stats are shown.

* **Teacher visibility**

  * Teacher sees:

    * Full detailed data for all students in their classes (regardless of peer privacy).

    * For other classes in the same school:

      * Aggregated stats by category (default).

      * Optional per-student details if school policy allows.

* **Students seeing teachers**

  * Teacher can opt in per habit:

    * “Visible to my classes” → students see teacher’s streak and XP for that habit in their class dashboard.

* **Reactions (planned v2)**

  * Design-level decision: we’ll plan for a `Reaction` entity:

    * `reaction_id`, `user_id`, `habit_completion_id`, `type` (e.g. “high-five”, “support”).

  * v1: Do **not** surface UI yet; just keep data model ready for a future release.

  * v2: Students and teachers can send lightweight reactions to completions; no commenting at first to keep moderation simple.

### **2.8. Challenges**

* **Teacher-created challenges**

  * Fields:

    * Name, description

    * Target category (optional)

    * Start/end dates

    * Target metric:

      * “Complete X times per week”

      * “Maintain a streak of N days”

    * Reward:

      * Bonus XP

      * Badge

  * Participation:

    * One-tap join for students.

    * Progress auto-derived from habit logs (no manual ticking beyond normal habit completion).

* **Student-created challenges (v2)**

  * Unlocked at certain level.

  * Students propose challenge; teacher approves.

  * Only within their class.

* **Visibility**

  * Class challenge progress visible to the whole class.

  * Teachers can highlight certain challenges in class discussions.

### **2.9. School & platform-level admin**

* **School Admin**

  * Configurable policies:

    * Whether students can mark habits as “private to peers” or “anonymised only,” or whether at least one “core habit” must be public.

    * Whether teachers from other classes in the same school can view detailed per-student data or only aggregates.

    * Whether school wants cross-class leaderboards.

  * Analytics:

    * Active users per class / grade.

    * Category completion trends (e.g. sleep habits improving over time).

    * Participation rates in challenges.

* **Platform Admin (you)**

  * Manage:

    * School subscription / plan (later).

    * Global flags (e.g. enabling reactions, student-created challenges).

    * Abuse / safety controls.

  * View:

    * Fully anonymised global metrics (no names).

### **2.10. Non-functional requirements**

* **Performance:** dashboards load in \< 2s on typical school Wi-Fi.

* **Reliability:** daily backups of DB; migrations handled via Prisma.

* **Security & privacy:**

  * No unauthenticated access to any user-level data.

  * Clear privacy policies; school-level controls reflect Google for Education–style expectations.

* **Scalability:** designed as multi-tenant; DB schema keyed by `school_id`.

---

## **3\. Implementation plan (phases, updated)**

### **Phase 0 – Product & UX design**

Output: PRD (this), key flows, and Stitch-generated UI.

* Refine decisions:

  * Default privacy policy for a single class (e.g. your current cohort).

  * Initial habit categories & example templates.

* Build flows:

  * Teacher onboarding & class creation.

  * Student joining & first habit creation.

  * Teacher stats display to students.

### **Phase 1 – UI scaffold via Stitch \+ AI Studio**

* Use **Stitch** to design:

  * Student dashboard

  * Class dashboard

  * Teacher dashboard

  * Habit create/edit dialog

  * Challenge create/join views

  * Teacher profile / habit-sharing controls

* Export to **AI Studio** and have **Gemini 3 Pro** convert the design into:

  * Next.js (App Router) project

  * TypeScript \+ Tailwind

  * Mock data, no real backend yet

Push to GitHub.

### **Phase 2 – Auth & data model**

In **Cursor** (with Opus 4.5 / Sonnet and Codex as needed):

* Add **NextAuth** with Google provider.

* Install **Prisma** and connect to Supabase/Neon.

* Implement schema for:

  * `User`, `School`, `SchoolMembership` (role: teacher, admin)

  * `Class`, `ClassMembership`

  * `Habit`, `HabitCompletion`

  * `Challenge`, `ChallengeParticipation`

  * (Optional) `Reaction` for v2

* Add server actions / API routes for:

  * Teacher: create/join school, create classes.

  * Student: join class.

  * Create/edit habits with categories & visibility.

  * Log habit completion.

### **Phase 3 – Streaks, XP, leaderboards**

* Implement pure functions for:

  * Current & longest streak from `HabitCompletion`.

  * XP calculation with streak multipliers.

  * Level calculation from XP.

  * Category stats per class & per school.

* Wire dashboards:

  * Student dashboard: per-habit streaks & XP, level.

  * Class dashboard: leaderboard (respecting peer-visibility rules).

  * Teacher dashboard: table of students with core metrics.

### **Phase 4 – Challenges & teacher sharing**

* Implement:

  * Creating / editing challenges.

  * Auto-progress computation from underlying habits.

* Surface:

  * Active challenges on student dashboard with progress bars.

  * Challenge summary in teacher dashboard.

* Add UI for teacher habit sharing:

  * “Share with classes” toggle per habit.

  * Students see teacher stats where enabled.

### **Phase 5 – Hardening & deployment**

* Error handling for all server actions.

* Input validation (e.g. zod).

* Basic tests for streak & XP logic.

* `.env.example` and documentation.

* Deploy to Vercel, connect DB, run Prisma migrations.

* Point `striveapp.io` to Vercel.

---

## **4\. Workflow: Stitch → AI Studio → GitHub → Cursor (+ Codex)**

### **4.1. Tools roles**

* **Stitch:** high-fidelity UI layout and components.

* **AI Studio (Gemini 3 Pro):** convert Stitch UI into a structured Next.js app.

* **Cursor:** main coding environment with repo-aware AI (Claude, Gemini).

* **Codex IDE extension:** extra coding agent that can read/modify code in-editor; nice for small refactors or questions, sits alongside Cursor’s own AI features.

Practically:

1. Use **Stitch** to get the UX right.

2. Export to **AI Studio**, ask Gemini 3 Pro to:

   * Wrap UI into a clean Next.js \+ TS \+ Tailwind project with mock data.

3. Download project, `git init`, push to GitHub.

4. Open repo in **Cursor**:

   * Use Claude 4.5 as “architect” for schema/auth/back-end.

   * Use Codex for quick in-file edits, small bug fixes, or “what does this part do?” style questions.

5. Iterate entirely inside Cursor from here.

---

## **5\. Updated prompts you can use**

### **5.1 Prompt for Stitch (UI with privacy & teacher sharing)**

Design a responsive web UI for a school well-being and habit tracker called “Strive.”

Roles: students, teachers, school admins.

Required screens:

1. **Student dashboard**

   * Today’s habits with big, satisfying completion controls.

   * Category labels (Sleep, Movement, Focus & Study, Mindfulness & Emotion, Social & Connection, Nutrition & Hydration, Digital Hygiene).

   * Streaks and XP/level.

   * Active challenges.

2. **Class dashboard**

   * Class leaderboard showing only habits students have marked as “public to class.”

   * Aggregate category stats for the class (e.g. average completion in Sleep this week).

   * Teacher’s public habits and streaks, if shared.

3. **Teacher dashboard**

   * List of classes.

   * For a selected class, a table of students with key stats: habits completed this week, streaks, XP, participation in challenges.

4. **Habit create/edit dialog**

   * Fields for name, description, category, schedule (daily / X times per week / specific days), start date, visibility options (“public to class,” “anonymised only,” “private to peers”).

5. **Teacher profile / habits sharing screen**

   * Teacher can create their own habits and mark which classes can see them.

6. **Challenge creation**

   * Teacher sets a challenge name, description, target category, start/end dates, and reward XP/badge.

The visual style should feel calm and modern, suitable for 11–14 year olds and their teachers, with clear hierarchy and minimal clutter. Use consistent components (cards, buttons, nav, headers) across screens and output HTML/CSS that can be exported to Google AI Studio.

### **5.2 Prompt for AI Studio (Gemini 3 Pro)**

After importing Stitch HTML:

You are converting this Stitch-generated HTML into a Next.js 15 \+ TypeScript \+ Tailwind app called “Strive.”

Requirements:

* Use the App Router with `app/` directory.

* Create pages and components for:

  * `/student/dashboard`

  * `/teacher/dashboard`

  * `/class/[classId]`

  * Habit create/edit dialog component

  * Challenge create/edit views

  * Teacher profile/habit-sharing screen

* Keep styling entirely in Tailwind.

* Use mock data to simulate: students, teachers, habits, categories, streaks, XP, and challenges.

* Use props and TypeScript interfaces that will map cleanly to a Prisma schema later.

Output the full project structure (including package.json, tsconfig, Tailwind config) so I can download it and push to GitHub.

### **5.3 Prompt for Cursor \+ Claude (schema, privacy, gamification)**

Once the repo is open in Cursor:

You are my senior full-stack engineer working on a Next.js \+ TypeScript \+ Tailwind app called Strive, a school well-being habit tracker.

The repo already has UI components and mock data. Please:

1. Scan the existing project and summarise the current structure.

2. Propose a Prisma schema that supports:

   * Multi-tenant schools (`School`, `SchoolMembership` with roles teacher/admin).

   * `Class` and `ClassMembership` (student/teacher membership).

   * `Habit` with categories and visibility:

     * Visibility options: `PUBLIC_TO_CLASS`, `ANONYMISED_ONLY`, `PRIVATE_TO_PEERS`.

     * Teacher habits with per-class sharing flags.

   * `HabitCompletion` for daily logs.

   * `Challenge` and `ChallengeParticipation`.

   * (Optional for v2) `Reaction` on `HabitCompletion`.

3. After I approve the schema, implement it:

   * Add Prisma and migrations.

   * Add database client.

   * Implement NextAuth with Google sign-in and link users to schools/classes.

   * Implement server actions/API routes for:

     * Teachers creating/joining schools and classes.

     * Students joining classes.

     * Creating/editing habits with categories and visibility.

     * Logging habit completions.

4. Implement pure functions for streak calculation, XP, levels, and category analytics, and wire them into the existing dashboard components.

Keep functions small, use strict TypeScript, and explain key decisions briefly as you go.

---

If you want, next step we can specify the actual Prisma schema (tables, fields, enums) so you can paste it straight into Cursor and say “implement this.”

