# PeerPath

A peer-support platform for University of Alberta students to ask course questions, volunteer to help, and continue learning together through conversations and tutoring sessions.

**[Open the live app](https://peerpath-five.vercel.app/)** · [Frontend](client/src) · [API](api) · [Database schema](supabase_schema.sql)

The live app opens at a sign-in screen. An account is required to explore the student interface; no shared demo credentials are published.

## What the project includes

- **Help requests:** post a course code, topic, and question; browse requests and volunteer to help.
- **Student profiles:** store a name, faculty, year of study, and bio.
- **Conversations:** create direct or group chats and send messages. The messages API checks conversation membership before reading or writing.
- **Learning resources:** server-side Gemini integration suggests resources, and a YouTube API endpoint searches for tutorial videos.
- **Session summaries:** generate a summary from tutoring notes and save it against the original request.
- **Video sessions:** a dedicated page embeds a Jitsi meeting room associated with a post.

These features are present in the source. Their availability in a deployment depends on its database, authentication settings, and external services.

## Architecture

```text
React + Vite browser client
    |-- Supabase Auth: sign-up, sign-in, session tokens
    |-- Supabase client: profile access
    |
    +-- /api/*: Vercel serverless functions
            |-- Supabase PostgreSQL: requests, volunteers, sessions, chats
            |-- Gemini: learning resources and session summaries
            +-- YouTube Data API: tutorial search

Video-call page --> embedded Jitsi meeting
```

The frontend attaches the Supabase access token to API requests. Protected handlers validate it through the shared [authentication helper](api/_helpers.js). Server handlers use a service-role Supabase client, so endpoint authorization is important in addition to database row-level policies.

## Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 18, React Router, Vite, JavaScript |
| Backend | JavaScript serverless functions on Vercel |
| Authentication and data | Supabase Auth and PostgreSQL |
| Integrations | Google Gemini, YouTube Data API, Jitsi |

## Explore the code

| Area | Entry point |
| --- | --- |
| Routes and pages | [client/src/App.jsx](client/src/App.jsx) |
| Authentication state | [client/src/hooks/useAuth.jsx](client/src/hooks/useAuth.jsx) |
| API requests and bearer tokens | [client/src/lib/api.js](client/src/lib/api.js) |
| Request feed | [api/posts.js](api/posts.js) |
| Conversations | [api/conversations.js](api/conversations.js) |
| Message membership checks | [api/messages/index.js](api/messages/index.js) |
| AI integrations | [api/ai](api/ai) |
| Core tables and policies | [supabase_schema.sql](supabase_schema.sql) |
| Chat tables and Realtime configuration | [supabase_chat_schema.sql](supabase_chat_schema.sql) |

## Setup

### 1. Install dependencies

Use Node.js and npm compatible with the Vite 5 client.

```bash
git clone https://github.com/NitinSingh4086/peerpath.git
cd peerpath
npm run install:all
npm install --prefix api
```

The root install script installs the client dependencies only; the API has its own package manifest.

### 2. Configure a development database

In a separate Supabase development project, run these files in order:

1. `supabase_schema.sql`
2. `supabase_chat_schema.sql`

The second file adds conversations, membership, messages, and Realtime publication entries. These are initialization scripts, not repeatable migrations: policies and publication entries may already exist if run again.

Configure Supabase Auth redirect URLs for your development and deployed app URLs. Sign-up behavior also depends on the project's email-confirmation settings.

### 3. Configure environment variables

Copy the root [.env.example](.env.example) to `.env` for backend development, and [client/.env.example](client/.env.example) to `client/.env` for Vite. Fill in your own values.

| Variable | Used by | Purpose |
| --- | --- | --- |
| `SUPABASE_URL` | API | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | API only | Server-side database access |
| `GEMINI_API_KEY` | API only | Resource and summary generation |
| `YOUTUBE_API_KEY` | API only | Tutorial video search |
| `VITE_SUPABASE_URL` | Browser | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Browser | Supabase public anonymous key |

Keep the service-role, Gemini, and YouTube keys on the server. Do not prefix them with `VITE_` or commit populated environment files. Vite variables are included in the browser bundle.

### 4. Run the frontend

```bash
npm run dev
```

Vite serves the client at `http://localhost:5173`. Its configuration proxies `/api` to `http://localhost:3000`.

**This command starts the frontend only.** The API directory contains Vercel handlers, not a standalone Express server. Full local operation also requires a compatible serverless development runtime serving those handlers on port 3000 with the backend variables loaded. Alternatively, use a Vercel deployment for the integrated application.

The API client currently uses the fixed `/api` prefix; `VITE_API_URL` is not read by the code.

### 5. Build or deploy

```bash
npm run build
```

This builds the frontend into `client/dist`; it does not launch the API.

For Vercel, import the repository with its root as the project directory. [vercel.json](vercel.json) defines the frontend build command, output directory, and rewrites. Set all six variables from the table in the appropriate Vercel environment before building. Add the deployment URL to Supabase Auth's allowed redirect URLs.

## Review walkthrough

Use your own development accounts and test database:

1. Sign in and create a course-help request.
2. Use a second account to volunteer for it.
3. Start a conversation and exchange messages.
4. Request learning resources or a session summary with the provider keys configured.
5. Open the video-call page to inspect the Jitsi integration.

## Project status

PeerPath is a student project. No automated test script is currently defined in the package manifests. A successful frontend build does not validate authentication, database policies, messaging, or third-party integrations; those require integration checks.

The Gemini model is configured in `api/_helpers.js`. Check that it is available to your provider account if AI requests fail.
