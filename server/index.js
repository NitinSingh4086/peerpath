require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// ─── Clients ─────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const gemini = genai.getGenerativeModel({ model: "gemini-1.5-flash" });

// ─── Middleware: verify Supabase JWT ─────────────────────────
async function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = auth.split(" ")[1];
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: "Invalid token" });
  req.user = data.user;
  next();
}

// ═══════════════════════════════════════════════════════════
// POSTS
// ═══════════════════════════════════════════════════════════

// GET all posts (with author profile + volunteer count)
app.get("/api/posts", async (req, res) => {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      profiles (id, full_name, avatar_url, year_of_study, faculty),
      volunteers (id),
      sessions (id, summary, tutor_name, created_at)
    `)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// CREATE post
app.post("/api/posts", requireAuth, async (req, res) => {
  const { course_code, topic, body } = req.body;
  if (!course_code || !topic || !body) {
    return res.status(400).json({ error: "course_code, topic, body required" });
  }
  const { data, error } = await supabase
    .from("posts")
    .insert({ course_code, topic, body, user_id: req.user.id })
    .select(`*, profiles (id, full_name, avatar_url, year_of_study, faculty)`)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE post (owner only)
app.delete("/api/posts/:id", requireAuth, async (req, res) => {
  const { data: post } = await supabase.from("posts").select("user_id").eq("id", req.params.id).single();
  if (!post || post.user_id !== req.user.id) return res.status(403).json({ error: "Forbidden" });
  const { error } = await supabase.from("posts").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ═══════════════════════════════════════════════════════════
// VOLUNTEERS
// ═══════════════════════════════════════════════════════════

app.post("/api/posts/:id/volunteer", requireAuth, async (req, res) => {
  // Check if already volunteered
  const { data: existing } = await supabase
    .from("volunteers")
    .select("id")
    .eq("post_id", req.params.id)
    .eq("user_id", req.user.id)
    .single();

  if (existing) return res.status(409).json({ error: "Already volunteered" });

  const { data, error } = await supabase
    .from("volunteers")
    .insert({ post_id: req.params.id, user_id: req.user.id })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete("/api/posts/:id/volunteer", requireAuth, async (req, res) => {
  const { error } = await supabase
    .from("volunteers")
    .delete()
    .eq("post_id", req.params.id)
    .eq("user_id", req.user.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Get volunteers for a post
app.get("/api/posts/:id/volunteers", async (req, res) => {
  const { data, error } = await supabase
    .from("volunteers")
    .select("*, profiles (id, full_name, avatar_url, year_of_study)")
    .eq("post_id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ═══════════════════════════════════════════════════════════
// AI — RESOURCE SUGGESTIONS
// ═══════════════════════════════════════════════════════════

app.post("/api/ai/resources", requireAuth, async (req, res) => {
  const { course_code, topic, body } = req.body;
  try {
    const result = await gemini.generateContent(
      `You are an academic tutor assistant helping university students find learning resources. Always be specific, practical, and encouraging.

A University of Alberta student needs help with:
Course: ${course_code}
Topic: ${topic}
Their question: "${body}"

Suggest 5 highly specific learning resources. For each resource:
- Give the exact resource name (book chapter, website, video title)
- Explain in 1 sentence WHY it helps for this specific question
- Rate difficulty: Beginner / Intermediate / Advanced

Format each as:
RESOURCE: [name]
WHY: [reason]
LEVEL: [difficulty]

Be specific. No generic suggestions like "Khan Academy" without naming the exact video/topic.`
    );
    res.json({ content: result.response.text() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// AI — SESSION SUMMARY
// ═══════════════════════════════════════════════════════════

app.post("/api/ai/summary", requireAuth, async (req, res) => {
  const { post_id, notes, course_code, topic, original_body } = req.body;
  try {
    const result = await gemini.generateContent(
      `You write clear, helpful session summaries for a peer tutoring platform. Summaries are posted publicly to help future students.

A tutoring session just happened at University of Alberta.

Original question: "${original_body}"
Course: ${course_code} | Topic: ${topic}
Tutor's rough notes: "${notes}"

Write a 3-5 sentence public summary that:
1. States what specific concept was covered
2. Shares 1-2 concrete strategies or tips from the session
3. Mentions what the student should be able to do now
4. Reads naturally — not robotic

Keep it under 120 words. Write in third person ("The session covered...").`
    );

    const summary = result.response.text();

    // Get tutor profile name
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", req.user.id)
      .single();

    // Save session to DB
    const { data: session, error } = await supabase
      .from("sessions")
      .insert({
        post_id,
        tutor_id: req.user.id,
        tutor_name: profile?.full_name || "Anonymous",
        notes,
        summary
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// YOUTUBE SEARCH
// ═══════════════════════════════════════════════════════════

app.get("/api/youtube", requireAuth, async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "query required" });
  try {
    const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        part: "snippet",
        q: `${q} tutorial explained`,
        type: "video",
        maxResults: 5,
        relevanceLanguage: "en",
        safeSearch: "strict",
        key: process.env.YOUTUBE_API_KEY
      }
    });
    const videos = response.data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium.url,
      description: item.snippet.description
    }));
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});



// ═══════════════════════════════════════════════════════════
// PROFILES
// ═══════════════════════════════════════════════════════════

app.get("/api/profile", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", req.user.id)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.put("/api/profile", requireAuth, async (req, res) => {
  const { full_name, year_of_study, faculty, bio } = req.body;
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: req.user.id, full_name, year_of_study, faculty, bio, updated_at: new Date() })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Health check
app.get("/api/health", (_, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ PeerPath server running on http://localhost:${PORT}`));
