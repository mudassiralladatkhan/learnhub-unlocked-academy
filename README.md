<div align="center">

# 📚 LearnHub Unlocked Academy

### Modern EdTech Platform for Interactive Online Learning

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![TanStack](https://img.shields.io/badge/TanStack_Query-5-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)](https://tanstack.com/query)

<br/>

**Full-stack learning management system with course creation, progress tracking, student analytics, and interactive content delivery.**

[Features](#-features) · [Architecture](#-architecture) · [Setup](#-quick-start)

---

</div>

## 🎯 What is LearnHub?

LearnHub Unlocked Academy is a production-grade EdTech platform that provides:

- 📖 **Course management** — create, organize, and deliver structured learning content
- 📊 **Progress tracking** — real-time completion tracking with visual indicators
- 🎓 **Student dashboard** — enrolled courses, achievements, and learning streaks
- 📈 **Analytics** — instructor-side performance metrics via Recharts
- 🎨 **Interactive content** — rich media support with responsive design
- 🔐 **Auth & roles** — student, instructor, and admin access levels

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📚 **Course Catalog** | Browse, search, and filter courses by category and difficulty |
| 🎬 **Content Delivery** | Structured lessons with text, video, and interactive elements |
| 📊 **Progress Tracking** | Per-lesson completion with overall course progress bars |
| 🏆 **Achievements** | Gamified learning with streak tracking and milestones |
| 👨‍🏫 **Instructor Tools** | Course creation, student analytics, engagement metrics |
| 📈 **Analytics Dashboard** | Enrollment trends, completion rates, popular courses (Recharts) |
| 🔐 **Authentication** | Email/password + social login via Supabase Auth |
| 📱 **Responsive** | Mobile-first design with Tailwind + Headless UI |
| ⚡ **Lightweight Mode** | Optional reduced-dependency mode for low-bandwidth environments |

---

## 🛠 Tech Stack

```
Frontend:       React 18 + TypeScript 5.5 + Vite
UI:             Tailwind CSS + Radix UI + Headless UI + shadcn/ui
State:          TanStack Query v5 (server) + React Context (auth)
Backend:        Supabase (Auth, PostgreSQL, Storage, Realtime)
Charts:         Recharts for analytics
Forms:          React Hook Form + Zod
Routing:        React Router DOM v6
Dev Tools:      ESLint + Lovable tagger
```

---

## 🏗️ Architecture

```
src/
├── pages/                   # Route-level components
├── components/
│   ├── ui/                  # Design system (shadcn/ui + Radix)
│   └── ...                  # Feature components
├── contexts/                # Auth & app state
├── hooks/                   # Custom hooks (data fetching, etc.)
├── integrations/            # Supabase client & queries
├── types/                   # TypeScript interfaces
└── lib/                     # Utilities

scripts/
├── build-deploy.js          # Production build pipeline
├── db-setup.js              # Database initialization
├── run-lightweight.js       # Lightweight mode launcher
├── setup-dev.js             # Development environment setup
└── test-and-lint.js         # Quality checks

supabase/
├── config.toml              # Local dev config
└── supabase-schema.sql      # Full database schema
```

---

## 🚀 Quick Start

```bash
git clone https://github.com/mudassiralladatkhan/learnhub-unlocked-academy.git
cd learnhub-unlocked-academy

# Install dependencies
npm install

# Configure Supabase
# Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env

# Initialize database
node scripts/db-setup.js

# Run development server
npm run dev
```

### Lightweight Mode (low-bandwidth)

```bash
npm run dev:light
# or
./run-lightweight.bat
```

---

## 📊 Database Schema

The Supabase PostgreSQL schema includes:

| Table | Purpose |
|-------|---------|
| `users` | User profiles with roles (student/instructor/admin) |
| `courses` | Course metadata, descriptions, thumbnails |
| `lessons` | Individual lesson content within courses |
| `enrollments` | Student-course relationships |
| `progress` | Per-lesson completion tracking |
| `achievements` | Gamification rewards and milestones |

Full schema available in `supabase-schema.sql`.

---

## 🎯 Key Screens

| Screen | Purpose |
|--------|---------|
| **Home** | Course catalog with search and category filters |
| **Course Detail** | Syllabus, instructor info, enrollment CTA |
| **Lesson View** | Content delivery with navigation and progress |
| **Dashboard** | Personal progress, enrolled courses, streaks |
| **Analytics** | Instructor view of student performance |
| **Admin** | User management, course approval, platform stats |

---

<div align="center">

**Built with 📚 by [Mudassir Alladatkhan](https://github.com/mudassiralladatkhan)**

*Learn. Track. Achieve.*

</div>
