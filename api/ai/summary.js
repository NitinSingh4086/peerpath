import { getSupabase, getGemini, requireAuth, setCors } from "../_helpers.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireAuth(req, res);
  if (!user) return;

  const { post_id, notes, course_code, topic, original_body } = req.body;
  try {
    const gemini = getGemini();
    const result = await gemini.generateContent(
      `You write clear, helpful session summaries for a peer tutoring platform.

A tutoring session just happened at University of Alberta.
Original question: "${original_body}"
Course: ${course_code} | Topic: ${topic}
Tutor notes: "${notes}"

Write a 3-5 sentence public summary. Start with "The session covered...". Be specific and actionable, under 120 words.`
    );
    const summary = result.response.text();
    const supabase = getSupabase();

    const { data: profile } = await supabase
      .from("profiles").select("full_name").eq("id", user.id).single();

    const { data: session, error } = await supabase
      .from("sessions")
      .insert({ post_id, tutor_id: user.id, tutor_name: profile?.full_name || "Anonymous", notes, summary })
      .select().single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
