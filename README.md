# 🚀 PulseFlow — Production SaaS Project Management Platform

PulseFlow is a modern, full-stack, enterprise-grade project management SaaS platform designed for high-velocity engineering and product teams. It combines Trello-style interactive Kanban boards, Asana-grade project milestone tracking, Jira-level role permissions, and executive analytics into a cohesive, responsive experience.

---

## 🌟 Key Features

- **Personalized Executive Dashboard**:
  - Live KPI statistics cards (Total Projects, Active Projects, Tasks Assigned, Completed Tasks, Overdue Tasks) with percentage changes.
  - Interactive **Recharts** charts: Task status donut chart, team productivity line chart, and project task volume bar charts.
  - Recent active projects grid with real-time progress bars and team avatar stacks.
- **Interactive Kanban Boards**:
  - Drag-and-drop task movement across `To Do`, `In Progress`, `Review`, and `Completed`.
  - Instant optimistic UI state updates with backend error rollback.
- **Complete Project Management**:
  - Dual Grid and List views with live search, status filtering, and priority filters.
  - 7 comprehensive project tabs: **Overview**, **Tasks Table**, **Interactive Board**, **Milestones Calendar**, **Team Members**, **Audit Activity**, and **Analytics**.
- **Task Management & Collaboration**:
  - Full task metadata: title, description, project association, assignee, status, priority, dates, estimated hours, actual hours, and tags.
  - Real-time task comments with human-readable relative timestamps ("3 hours ago").
- **Global Command Palette (`Ctrl + K`)**:
  - Instant spotlight search across all Projects, Tasks, and Team Members with keyboard navigation.
- **Role-Based Access Control (RBAC)**:
  - **Admin**: Full workspace authority, member role management, user deactivation.
  - **Project Manager**: Project lifecycle creation/editing, member assignments, task orchestration.
  - **Team Member**: Task execution, status updates, comment discussions, personal workload queue.
- **Modern Design & Dark Mode**:
  - Tailored color palette, glassmorphism backdrops, and theme switching (Light / Dark).
  - 100% responsive across Mobile (320px+), Tablet (768px+), and Desktop (1440px+).

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js 18 + Vite
- **Styling**: Tailwind CSS (with custom glassmorphism & dark mode)
- **Icons**: Lucide React
- **Visualizations**: Recharts
- **Drag and Drop**: `@hello-pangea/dnd`
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **Routing**: React Router v6
- **Notifications**: React Hot Toast
- **HTTP Client**: Axios with interceptors

### Backend
- **Runtime**: Node.js + Express.js (ES Modules)
- **Database**: PostgreSQL (Neon Cloud / Local PostgreSQL)
- **ORM**: Prisma Client v5
- **Authentication**: JWT & Bcrypt password hashing
- **Security**: Helmet, CORS, Rate Limiting, Input Validation with Zod

---

## 👥 Demo Login Credentials

For testing and demonstration, the login screen includes **one-click instant demo buttons**:

| Role | Email | Password |
| :--- | :--- | :--- |
| **System Admin** | `admin@pulseflow.io` | `Password123!` |
| **Project Manager** | `pm.marcus@pulseflow.io` | `Password123!` |
| **Project Manager** | `pm.elena@pulseflow.io` | `Password123!` |
| **Team Member** | `david.chen@pulseflow.io` | `Password123!` |
| **Team Member** | `amara.okafor@pulseflow.io` | `Password123!` |

---

## 📦 Project Architecture

```
ProductManagement/
├── package.json               # Root monorepo scripts (concurrently dev, seed, build)
├── .gitignore
├── README.md
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma      # PostgreSQL models with relational indexes
│   │   └── seed.js            # Realistic seed data (8 users, 5 projects, 27 tasks)
│   └── src/
│       ├── config/            # Prisma db singleton, JWT utilities
│       ├── controllers/       # Modular controllers (auth, project, task, team, etc.)
│       ├── middleware/        # JWT auth, RBAC authorization, Zod validation, error handler
│       ├── routes/            # Express routers
│       ├── services/          # Pure business logic layer
│       ├── utils/             # Standard API response helpers
│       ├── app.js             # Express application configuration
│       └── server.js          # Server entrypoint
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── components/
        │   ├── common/        # Button, Modal, Badge, Card, CommandPalette (Ctrl+K)
        │   ├── layout/        # Sidebar, TopNavbar, DashboardLayout
        │   ├── kanban/        # KanbanBoard, KanbanColumn, KanbanCard
        │   ├── projects/      # ProjectCard, ProjectModal
        │   └── tasks/         # TaskModal, TaskDetailModal
        ├── context/           # AuthContext (with Demo login), ThemeContext
        ├── pages/             # Dashboard, Projects, ProjectDetail, MyTasks, Calendar, Team, Analytics, Settings, Login, Register
        └── services/          # Axios API service modules
```

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js >= 18
- PostgreSQL (Local or Neon / Supabase connection URL)

### 2. Installation
Clone the repository and install all dependencies:
```bash
# Root directory
npm run install:all
```

### 3. Database Setup
Configure `backend/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://username:password@localhost:5432/pulseflow?sslmode=require"
JWT_SECRET="your-secure-jwt-secret"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:5173"
```

Sync database schema and populate realistic demo data:
```bash
cd backend
npx prisma db push
npm run seed
```

### 4. Running the Application
Run both backend and frontend concurrently from the root directory:
```bash
npm run dev
```

Or run separately:
- **Backend API**: `cd backend && npm run dev` (Runs on `http://localhost:5000`)
- **Frontend App**: `cd frontend && npm run dev` (Runs on `http://localhost:5173`)

---

## 📡 REST API Summary

### Authentication
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Get current profile
- `PUT /api/auth/profile` — Update name, avatar, or password
- `POST /api/auth/forgot-password` — Password reset request

### Projects
- `GET /api/projects` — List projects (with search, status, and priority filters)
- `POST /api/projects` — Create project (Manager/Admin)
- `GET /api/projects/:id` — Get project details with members, tasks, and activities
- `PUT /api/projects/:id` — Update project
- `DELETE /api/projects/:id` — Delete project
- `POST /api/projects/:id/members` — Add member to project
- `DELETE /api/projects/:id/members/:userId` — Remove member from project

### Tasks
- `GET /api/tasks` — List tasks with filters (`myTasks=true`, `status`, `priority`)
- `POST /api/tasks` — Create task
- `GET /api/tasks/:id` — Get task with comments and attachments
- `PUT /api/tasks/:id` — Update task details
- `PATCH /api/tasks/:id/status` — Update task status & Kanban column order
- `DELETE /api/tasks/:id` — Delete task
- `GET /api/tasks/:id/comments` — Get task comments
- `POST /api/tasks/:id/comments` — Post task comment
- `DELETE /api/comments/:id` — Delete comment

### Team & Analytics
- `GET /api/team` — List all members with workload calculations
- `PATCH /api/team/:id/role` — Update user role (Admin only)
- `GET /api/analytics/dashboard` — Platform KPI metrics & chart datasets
- `GET /api/analytics/projects/:id` — Project-specific velocity and burn-down metrics
- `GET /api/search?q=:query` — Global workspace spotlight search (Ctrl+K)
