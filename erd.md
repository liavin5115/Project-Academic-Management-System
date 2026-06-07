# Agent Prompt: Academic Management System (AMS)

## Role & Mission

You are a **senior full-stack developer and system architect**. Your mission is to build a complete **Academic Management System** — a personal college productivity tool — from scratch, end-to-end, based on the specifications below. You will make all architectural decisions, write all code, set up the database, and ensure everything works before handing it off.

---

## Project Overview

Build a web-based academic management app for a college student to track courses, lecturers, weekly schedules (with override support), tasks with priority scoring, a Kanban board, course materials, and an automated daily notification bot (Telegram or Discord). The system has three phases of features that must all be delivered.

**Tech Stack (use exactly this):**
- **Backend:** Python 3.11+ with FastAPI
- **Database:** PostgreSQL with SQLAlchemy ORM + Alembic migrations
- **Frontend:** React 18 + Vite + TailwindCSS
- **Scheduler/Bot:** APScheduler + python-telegram-bot (or discord.py)
- **Auth:** Simple JWT-based auth (single user, no registration flow needed)
- **Deployment config:** Docker + docker-compose

---

## Database Schema

Implement exactly these 8 tables (see ERD below). Use `snake_case` for all column names.

```
COURSE          (id, code, name, credits, description)
LECTURER        (id, name, email, contact, notes)
COURSE_LECTURER (id, course_id FK, lecturer_id FK, role)
SCHEDULE        (id, course_id FK, day_of_week, start_time, end_time, room, semester)
SCHEDULE_OVERRIDE (id, schedule_id FK, override_date, status ENUM, new_start_time, new_end_time, note)
TASK            (id, course_id FK, title, description, deadline, difficulty INT 1-5, priority_score FLOAT, status, kanban_status ENUM)
MATERIAL        (id, course_id FK, title, session_number, drive_link, type)
NOTIFICATION_LOG (id, task_id FK, sent_at, channel, message, success BOOL)
```

**Enums:**
- `schedule_override.status`: `cancelled`, `moved`, `replacement`
- `task.kanban_status`: `todo`, `in_progress`, `review`, `done`

---

## Feature Specifications

### Phase 1 — Core Academic Management

**1. Dashboard**
- Show today's class schedule by querying `SCHEDULE` filtered to the current `day_of_week`, then checking `SCHEDULE_OVERRIDE` for that date. If an override exists, apply it (show "Cancelled", the new time, or mark as replacement class).
- Show a badge/counter of tasks where `deadline` is within the next 48 hours and `kanban_status != 'done'`.

**2. Course & Lecturer Management**
- Full CRUD for `COURSE`: create, list, edit, delete.
- Full CRUD for `LECTURER`: create, list, edit, delete. The `notes` field is a free-text area for "lecturer character notes" (e.g. "strict on attendance, prefers formal questions").
- Assign lecturers to courses via `COURSE_LECTURER` (many-to-many). Support multiple lecturers per course.

**3. Schedule Tracker**
- Weekly calendar view (Mon–Sun) showing all scheduled classes.
- Each class card shows: course name, time, room, lecturer name.
- Override modal: for any class on any specific date, the user can set an override with status `cancelled`, `moved` (enter new time), or `replacement` (enter new date + time). Overrides are stored in `SCHEDULE_OVERRIDE`.
- The dashboard and calendar must always reflect overrides — never show the raw schedule without checking overrides first.

---

### Phase 2 — Smart Task & Deadline Manager

**1. Priority Score Calculator**
Implement this formula in a Python utility function `calculate_priority_score(deadline: datetime, difficulty: int) -> float`:

```python
from datetime import datetime

def calculate_priority_score(deadline: datetime, difficulty: int) -> float:
    hours_remaining = max((deadline - datetime.now()).total_seconds() / 3600, 0.1)
    urgency = 1 / hours_remaining
    score = (urgency * 1000) * (difficulty / 5)
    return round(score, 4)
```

- Call this function on every `POST /tasks` and `PUT /tasks/{id}` to set `priority_score`.
- The task list endpoint `GET /tasks` must default to ordering by `priority_score DESC`.
- Recalculate scores via a background job every 30 minutes so scores stay fresh as deadlines approach.

**2. Kanban Board**
- Frontend: 4 columns — "To Do", "In Progress", "Review", "Done".
- Drag-and-drop to move tasks between columns (use `@dnd-kit/core`).
- Each task card shows: title, course name, deadline (formatted as "X hours left" if < 48h, else full date), difficulty stars (1–5), and a colored priority badge (red = high, yellow = medium, green = low based on score thresholds).
- Clicking a card opens a detail/edit modal.

---

### Phase 3 — Automation & Insights

**1. Daily Notification Bot**
- Use APScheduler to run a job every day at **07:00 local time**.
- The job must:
  1. Query today's schedule (with overrides applied).
  2. Query tasks with `deadline` within the next 24 hours and `kanban_status != 'done'`.
  3. Compose a message in this format:
     ```
     Good morning! 🌅 Here's your daily academic briefing:

     📚 Today's Classes (N classes):
     - [Time] [Course Name] @ [Room] — [Status if overridden]

     ⚠️ Urgent Tasks (deadline within 24h):
     - [Task Title] ([Course]) — due [Deadline]

     You've got this! 💪
     ```
  4. Send via Telegram bot (configurable via `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` env vars) or Discord webhook (`DISCORD_WEBHOOK_URL`).
  5. Log every send attempt in `NOTIFICATION_LOG`.
- Make the channel (Telegram/Discord) switchable via `NOTIFICATION_CHANNEL` env var.

**2. Material & File Bucket**
- CRUD for `MATERIAL` linked to a course.
- Each material has: title, session number, Google Drive link, type (lecture, assignment, syllabus, reference).
- Search endpoint `GET /materials?q=<query>` that searches across `title` and `session_number` using `ILIKE`.
- Frontend: per-course material list with a search bar. Clicking a link opens the Drive URL in a new tab.

---

## API Endpoints

Implement all of the following RESTful endpoints:

```
# Auth
POST   /auth/login

# Courses
GET    /courses
POST   /courses
GET    /courses/{id}
PUT    /courses/{id}
DELETE /courses/{id}

# Lecturers
GET    /lecturers
POST   /lecturers
PUT    /lecturers/{id}
DELETE /lecturers/{id}

# Course-Lecturer assignment
POST   /courses/{id}/lecturers
DELETE /courses/{id}/lecturers/{lecturer_id}

# Schedules
GET    /schedules?day=Monday
POST   /schedules
PUT    /schedules/{id}
DELETE /schedules/{id}

# Schedule Overrides
GET    /schedules/{id}/overrides
POST   /schedules/{id}/overrides
PUT    /overrides/{id}
DELETE /overrides/{id}

# Tasks
GET    /tasks?kanban_status=todo&sort=priority
POST   /tasks
GET    /tasks/{id}
PUT    /tasks/{id}
DELETE /tasks/{id}
PATCH  /tasks/{id}/kanban   (body: { kanban_status })

# Materials
GET    /materials?course_id=1&q=search
POST   /materials
PUT    /materials/{id}
DELETE /materials/{id}

# Dashboard
GET    /dashboard   (returns: today_schedule, urgent_tasks_count, urgent_tasks)

# Notification
POST   /notifications/send-now  (manual trigger for testing)
GET    /notification-logs
```

All endpoints return JSON. Use standard HTTP status codes. Protect all endpoints with JWT middleware except `POST /auth/login`.

---

## Frontend Pages & Components

Build these pages in React:

1. **`/dashboard`** — Today's schedule list + urgent tasks counter widget.
2. **`/courses`** — Course list with lecturer chips. Click → course detail.
3. **`/courses/:id`** — Course detail: lecturer list, schedule, tasks, materials tabs.
4. **`/schedule`** — Weekly calendar grid. Override button on each class card.
5. **`/tasks`** — Kanban board (4 columns, drag & drop). Filter by course.
6. **`/materials`** — Material list with global search bar. Grouped by course.
7. **`/settings`** — Bot configuration (enter Telegram token / Discord webhook, test send button).

**UI requirements:**
- Use TailwindCSS utility classes only (no custom CSS files).
- Dark mode support via Tailwind's `dark:` variant + a toggle in the navbar.
- Responsive: works on mobile (single column) and desktop (sidebar layout).
- Toast notifications on all create/update/delete actions (use `react-hot-toast`).
- Loading skeletons on all data-fetching components.

---

## Project Structure

Generate exactly this folder structure:

```
/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/          (SQLAlchemy models, one file per table)
│   │   ├── schemas/         (Pydantic schemas, one file per domain)
│   │   ├── routers/         (FastAPI routers, one file per domain)
│   │   ├── services/        (business logic: priority calc, bot sender)
│   │   └── scheduler.py     (APScheduler setup)
│   ├── alembic/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/           (useApi, useToast, useDragDrop)
│   │   ├── store/           (Zustand for global state)
│   │   └── lib/api.ts       (Axios instance with JWT interceptor)
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## Environment Variables

Create a `.env.example` with these keys:

```
# Database
DATABASE_URL=postgresql://user:password@db:5432/ams_db

# Auth
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Notifications
NOTIFICATION_CHANNEL=telegram        # or "discord"
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
DISCORD_WEBHOOK_URL=

# App
APP_USER_PASSWORD=yourpassword       # single-user app
TIMEZONE=Asia/Jakarta
```

---

## Implementation Order

Follow this sequence to avoid blockers:

1. Set up `docker-compose.yml` with PostgreSQL + backend + frontend services.
2. Create all SQLAlchemy models and run initial Alembic migration.
3. Implement all FastAPI routers (no auth first, add JWT last).
4. Implement `calculate_priority_score` utility and wire it to task creation/update.
5. Set up APScheduler with the daily 07:00 notification job.
6. Scaffold the React app with routing and Axios client.
7. Build each frontend page in order: Dashboard → Schedule → Tasks (Kanban) → Courses → Materials → Settings.
8. Add JWT auth (backend middleware + frontend login page + token storage).
9. Add dark mode toggle.
10. Write a `README.md` with setup instructions.

---

## Quality Requirements

- All Python code must pass `ruff` linting with no errors.
- All database queries must use parameterized queries (no raw string interpolation).
- The priority score recalculation job must be idempotent — running it twice in a row must produce the same result.
- The notification bot must not crash the app if Telegram/Discord is unreachable — catch all exceptions and log to `NOTIFICATION_LOG` with `success=false`.
- Frontend components must not have prop-drilling deeper than 2 levels — use Zustand for shared state.

---

## Deliverables

When complete, provide:
1. All source code files in the folder structure above.
2. A `docker-compose.yml` that starts the full stack with a single `docker compose up`.
3. A `README.md` with: prerequisites, setup steps, how to configure the notification bot, and how to run the priority recalculation manually.
4. A seed script `backend/seed.py` that populates sample data (3 courses, 2 lecturers, 5 tasks, a weekly schedule) so the app is immediately usable after first run.

Start with step 1 of the implementation order. Ask no clarifying questions — make reasonable decisions and proceed.