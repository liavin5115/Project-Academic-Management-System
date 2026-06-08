# Deployment Guide — AMS (Free Stack)

## Prerequisites
- GitHub account
- Neon account (neon.tech)
- Render account (render.com)
- Vercel account (vercel.com)
- UptimeRobot account (uptimerobot.com)

---

## Step 1 — Push to GitHub

1. Create a new GitHub repository (name it `academic-management-system`)
2. Push your project:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/academic-management-system.git
   git push -u origin main
   ```

---

## Step 2 — Set Up Neon Database

1. Go to neon.tech → Create account → New Project
2. Name it `ams-db`, region: closest to you
3. Copy the **Connection String** (looks like `postgresql://user:pass@ep-xxx.neon.tech/neondb`)
4. Append `?sslmode=require` if not already there
5. Save this string — you'll need it in Step 3

---

## Step 3 — Deploy Backend on Render

1. Go to render.com → New → Web Service
2. Connect your GitHub repo
3. Settings:
   - **Name:** `ams-backend`
   - **Root directory:** `backend`
   - **Runtime:** Python 3
   - **Build command:** `pip install -r requirements.txt && alembic upgrade head`
   - **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance type:** Free
4. Add Environment Variables (click "Add Environment Variable" for each):
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | your Neon connection string |
   | `SECRET_KEY` | any long random string |
   | `APP_USER_PASSWORD` | your login password |
   | `NOTIFICATION_CHANNEL` | `telegram` or `discord` |
   | `TELEGRAM_BOT_TOKEN` | your bot token |
   | `TELEGRAM_CHAT_ID` | your chat ID |
   | `TIMEZONE` | `Asia/Jakarta` |
   | `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` |
5. Click **Deploy** — wait 3–5 minutes
6. Copy your Render URL (e.g. `https://ams-backend.onrender.com`)
7. Test it: open `https://ams-backend.onrender.com/health` → should return `{"status":"ok"}`

### Step 3b — Add the Daily Notification Cron Job
1. Render → New → Cron Job
2. Connect same GitHub repo
3. Settings:
   - **Name:** `ams-daily-bot`
   - **Root directory:** `backend`
   - **Build command:** `pip install -r requirements.txt`
   - **Schedule:** `0 7 * * *`
   - **Command:** `python -c "from app.services.notification import send_daily_briefing; import asyncio; asyncio.run(send_daily_briefing())"`
4. Add same environment variables as the web service
5. Click **Save**

---

## Step 4 — Deploy Frontend on Vercel

1. Go to vercel.com → New Project → Import your GitHub repo
2. Settings:
   - **Framework:** Vite
   - **Root directory:** `frontend`
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
3. Add Environment Variable:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://ams-backend.onrender.com/api` |
4. Click **Deploy** — wait 2 minutes
5. Copy your Vercel URL (e.g. `https://ams.vercel.app`)

### Step 4b — Update CORS on Render
1. Go to Render → ams-backend → Environment
2. Add: `FRONTEND_URL` = your Vercel URL
3. Render auto-redeploys

---

## Step 5 — Keep Render Awake with UptimeRobot

1. Go to uptimerobot.com → Create account → Add New Monitor
2. Settings:
   - **Monitor type:** HTTP(s)
   - **Friendly name:** AMS Backend
   - **URL:** `https://ams-backend.onrender.com/health`
   - **Monitoring interval:** Every 5 minutes
3. Click **Create Monitor**

Your backend will now never sleep.

---

## Step 6 — Verify Everything Works

Open your Vercel URL in the browser:
- [ ] Login page loads
- [ ] Dashboard shows (may be empty — that's fine)
- [ ] Create a course → appears in the list
- [ ] Create a task → appears on the Kanban board
- [ ] Check `/health` endpoint returns ok

---

## Updating the App Later

Every time you push to GitHub:
- Vercel auto-deploys the frontend in ~1 minute
- Render auto-deploys the backend in ~3 minutes

No manual steps needed.
