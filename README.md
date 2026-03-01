# TaskFlow

A full-stack Task Management System built with Express 5 + Next.js 16. Users can register, login, and perform full CRUD operations on personal tasks with filtering, sorting, and pagination.

**Live Demo:** [taskflow-s-ahmad.vercel.app](https://taskflow-s-ahmad.vercel.app)
> First request may take ~50s as the free Render backend instance spins up after inactivity.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Express 5 + TypeScript + Prisma 7 + PostgreSQL |
| Frontend | Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + shadcn/ui v3 |
| Auth | JWT (httpOnly cookies) + bcrypt + refresh token rotation |
| Data Fetching | TanStack React Query v5 + Server Components |
| Forms | react-hook-form + Zod |
| UI | Dark/Light mode, glassmorphism, responsive (desktop sidebar + mobile bottom nav) |

## Features

- User authentication (register, login, logout, "Keep me logged in")
- Full task CRUD (create, read, update, delete)
- Task status toggle (TODO / In Progress / Completed)
- Priority levels (Low, Medium, High)
- Start & end date tracking with overdue detection
- Search tasks by title
- Filter by status
- Pagination & sorting
- Inline profile name editing
- Responsive design — desktop sidebar + mobile bottom nav
- Dark and light mode with glassmorphism UI

## Project Structure

```
TaskFlow/
├── backend/          # Express 5 REST API
│   ├── prisma/       # Database schema
│   └── src/
│       ├── controllers/
│       ├── services/
│       ├── routes/
│       ├── middleware/
│       ├── schemas/
│       ├── lib/
│       └── config/
└── frontend/         # Next.js 16 App
    └── src/
        ├── app/          # Pages & layouts (App Router)
        ├── components/   # React components
        ├── actions/      # Server Actions
        ├── lib/          # Utilities & API clients
        ├── hooks/
        └── types/
```

## Prerequisites

- **Node.js** 18+
- **PostgreSQL** 13+ running locally
- **npm**

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Saba-Ahmad-sp/TaskFlow.git
cd TaskFlow
```

### 2. Set up the database

Create a PostgreSQL database:

```bash
createdb taskflow
```

### 3. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/taskflow
ACCESS_TOKEN_SECRET=your-access-secret-min-32-characters-long
REFRESH_TOKEN_SECRET=your-refresh-secret-min-32-characters-long
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN_DAYS=7
FRONTEND_URL=http://localhost:3000
```

Push the database schema and start the server:

```bash
npm run db:push
npm run dev
```

The API will run at `http://localhost:3001`.

### 4. Frontend setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend/` directory:

```env
API_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Start the development server:

```bash
npm run dev
```

The app will run at `http://localhost:3000`.

### 5. Use the app

1. Open `http://localhost:3000` in your browser
2. Register a new account
3. Start creating and managing tasks

## API Endpoints

### Auth (no authentication required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login |
| POST | /auth/refresh | Refresh access token |
| POST | /auth/logout | Logout |
| GET | /auth/me | Get current user (auth required) |
| PATCH | /auth/me | Update profile (auth required) |

### Tasks (authentication required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /tasks | List tasks (pagination, filter, search, sort) |
| POST | /tasks | Create task |
| GET | /tasks/:id | Get single task |
| PATCH | /tasks/:id | Update task |
| DELETE | /tasks/:id | Delete task |
| PATCH | /tasks/:id/toggle | Toggle task status |

## Available Scripts

### Backend (`/backend`)
| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:studio` | Open Prisma Studio GUI |

### Frontend (`/frontend`)
| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Deployment

- **Database:** Neon (PostgreSQL)
- **Backend:** Render (Web Service)
- **Frontend:** Vercel
