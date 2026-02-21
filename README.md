# PeerPath — University of Alberta
## Peer Tutoring Social Platform

---

## 🗂 Project Structure

```
peerpath/
├── api/                  ← Serverless backend (auto-runs on Vercel)
│   ├── _helpers.js       ← Shared Supabase + Gemini clients
│   ├── posts.js          ← GET + POST posts
│   ├── posts/
│   │   ├── [id].js       ← DELETE post
│   │   └── [id]/
│   │       └── volunteer.js ← GET/POST/DELETE volunteers
│   ├── ai/
│   │   ├── resources.js  ← AI resource suggestions
│   │   └── summary.js    ← AI session summary
│   ├── youtube.js        ← YouTube video search
│   ├── profile.js        ← GET + PUT profile
│   └── package.json
├── client/               ← React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── lib/
│   └── package.json
├── supabase_schema.sql   ← Run once in Supabase SQL editor
├── vercel.json           ← Vercel config
└── .env                  ← Fill in your keys (local dev only)
```

---

## ⚙️ Local Development Setup

### Step 1 — Install dependencies
```bash
npm run install:all
```

### Step 2 — Fill in .env file (root level)
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
GEMINI_API_KEY=AIzaSy...
YOUTUBE_API_KEY=AIzaSy...
```

### Step 3 — Also fill in client/.env
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=/api
```

### Step 4 — Run locally
```bash
npm run dev
```
Opens at http://localhost:5173

---

## 🚀 Deploy to Vercel

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/peerpath.git
git push -u origin main
```

### Step 2 — Connect to Vercel
1. Go to https://vercel.com → sign up with GitHub
2. Click **Add New Project**
3. Import your `peerpath` repository
4. Vercel auto-detects settings from `vercel.json` — don't change anything
5. Before clicking Deploy, click **Environment Variables** and add:

```
SUPABASE_URL           = your value
SUPABASE_SERVICE_ROLE_KEY = your value
VITE_SUPABASE_URL      = your value
VITE_SUPABASE_ANON_KEY = your value
GEMINI_API_KEY         = your value
YOUTUBE_API_KEY        = your value
```

6. Click **Deploy** — done in ~2 minutes!

---

## 🔑 API Keys Needed (all free)

| Service | Get it at | Free limit |
|---|---|---|
| Supabase | supabase.com | 500MB DB, 50k users |
| Google Gemini | aistudio.google.com | 1,500 req/day |
| YouTube API | console.cloud.google.com | 100 searches/day |

---

## 🗄️ Database Setup

1. Go to Supabase → SQL Editor → New Query
2. Paste contents of `supabase_schema.sql`
3. Click Run

---

Built with ❤️ for the University of Alberta community.
