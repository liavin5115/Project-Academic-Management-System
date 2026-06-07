# Academic Management System (AMS)

A personal college productivity tool built with FastAPI + React.

## Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for frontend dev)
- Python 3.11+ (for backend dev)

## Setup

1. Clone repo and cd into it
2. Copy `.env.example` to `.env` and fill in values
3. `docker compose up --build` (starts PostgreSQL, backend, frontend)
4. Run seed: `docker exec ams_backend python seed.py`

## Services
- Backend: http://localhost:8000
- Frontend: http://localhost:5173

## Notification Bot Setup
- Set `NOTIFICATION_CHANNEL=telegram` and add `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` to `.env`
- For Discord: set `NOTIFICATION_CHANNEL=discord` and add `DISCORD_WEBHOOK_URL`

## Manual Priority Recalculation
```bash
docker exec ams_backend python -c "from app.scheduler import recalculate_priority_scores; recalculate_priority_scores()"
```

## Development
- Backend: `cd backend && uvicorn app.main:app --reload`
- Frontend: `cd frontend && npm install && npm run dev`