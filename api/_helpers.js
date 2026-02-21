const { createClient } = require("@supabase/supabase-js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function getGemini() {
  const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genai.getGenerativeModel({ model: "gemini-1.5-flash" });
}

async function requireAuth(req, res) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  const token = auth.split(" ")[1];
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: "Invalid token" });
    return null;
  }
  return data.user;
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

module.exports = { getSupabase, getGemini, requireAuth, setCors };
