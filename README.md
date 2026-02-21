# PeerPath — University of Alberta
## Peer Tutoring Social Platform

A full-stack app where students post academic help requests and peers/seniors volunteer to assist — with AI resource suggestions, YouTube video search, and real-time video calls.

---

## 🗂 Project Structure

```
peerpath/
├── client/               ← React + Vite frontend
│   ├── src/
│   │   ├── components/   ← PostCard, Modals, Navbar
│   │   ├── pages/        ← Feed, Login, Register, Profile, VideoCall
│   │   ├── hooks/        ← useAuth (Supabase auth context)
│   │   ├── lib/          ← supabase.js, api.js
│   │   └── main.jsx
│   ├── .env              ← Fill in your keys
│   └── vite.config.js
├── server/               ← Node.js + Express API
│   ├── index.js          ← All routes
│   └── .env              ← Fill in your keys
├── supabase_schema.sql   ← Run this in Supabase SQL editor
└── package.json          ← Root: runs both with concurrently
```

---

## ⚙️ Setup — Step by Step

### Step 1 — Install Node.js
Download and install Node.js (v18+) from https://nodejs.org

### Step 2 — Install dependencies
Open a terminal in the `peerpath/` folder and run:
```bash
npm run install:all
```
This installs packages for root, client, and server.

---

### Step 3 — Supabase (Database + Auth) — FREE

1. Go to https://supabase.com and create a free account
2. Click **New Project**, name it `peerpath`, set a strong DB password
3. Wait for project to finish creating (~1 min)
4. Go to **SQL Editor** (left sidebar) → click **New Query**
5. Copy the entire contents of `supabase_schema.sql` and paste it → click **Run**
6. Go to **Project Settings** → **API**:
   - Copy **Project URL** → this is your `SUPABASE_URL`
   - Copy **anon public** key → this is your `VITE_SUPABASE_ANON_KEY`
   - Copy **service_role** key → this is your `SUPABASE_SERVICE_ROLE_KEY`

---

### Step 4 — Google Gemini API (free AI) — 100% Free

1. Go to **https://aistudio.google.com**
2. Sign in with your Google account
3. Click **Get API Key** (top left)
4. Click **Create API Key** → **Create API key in new project**
5. Copy the key → goes in `server/.env` as `GEMINI_API_KEY`

✅ Free tier: **1,500 requests/day**, no credit card needed.

---

### Step 5 — YouTube Data API — FREE (10,000 req/day)

1. Go to https://console.cloud.google.com
2. Create a new project called `peerpath`
3. Go to **APIs & Services** → **Enable APIs**
4. Search **YouTube Data API v3** → Enable it
5. Go to **Credentials** → **Create Credentials** → **API Key**
6. Copy the key → this is your `YOUTUBE_API_KEY`

---

### Step 6 — Daily.co Video Calls — FREE (up to 1,000 min/month)

1. Go to https://www.daily.co → sign up free
2. In the dashboard, go to **Developers** → **API Keys**
3. Copy your API key → this is your `DAILY_API_KEY`

---

### Step 7 — Fill in your .env files

**`server/.env`**:
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
GEMINI_API_KEY=AIzaSy...
YOUTUBE_API_KEY=AIza...
DAILY_API_KEY=your-daily-key
PORT=4000
CLIENT_URL=http://localhost:5173
```

**`client/.env`**:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_API_URL=http://localhost:4000
```

---

### Step 8 — Run the app

```bash
npm run dev
```

This starts:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:4000

Open http://localhost:5173 in your browser.

---

## 🚀 Features

| Feature | How it works |
|---|---|
| **Auth** | Supabase email/password. Profile stores name, year, faculty |
| **Post feed** | Real posts stored in Supabase PostgreSQL |
| **Volunteer** | Click to volunteer, see who else volunteered |
| **AI Resources** | GPT-4o-mini reads the post and suggests specific resources |
| **YouTube** | Searches YouTube API for topic videos, plays inline |
| **Video call** | Daily.co creates a room per post, opens in-app |
| **Session summary** | Tutor writes notes → GPT writes polished public summary |

---

## 🐛 Troubleshooting

**"Unauthorized" errors** → Check your Supabase keys in both .env files

**YouTube returning empty** → Make sure YouTube Data API v3 is enabled in Google Cloud Console

**Video call fails** → Verify DAILY_API_KEY is set correctly. Your Daily.co domain must match.

**Posts not loading** → Open Supabase → Table Editor and confirm the tables exist. Re-run the SQL schema if needed.

---

## 📦 Deploying to GitHub

```bash
git init
git add .
git commit -m "Initial commit — PeerPath"
git remote add origin https://github.com/yourusername/peerpath.git
git push -u origin main
```

Note: `.env` files are in `.gitignore` — never commit them. Set env vars in your hosting platform's settings panel.

---

Built with ❤️ for the University of Alberta community.
