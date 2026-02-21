const { getSupabase, getGemini, requireAuth, setCors } = require("../_helpers");

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
    const supabase = getSupabase();

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const { data: session, error } = await supabase
      .from("sessions")
      .insert({
        post_id,
        tutor_id: user.id,
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
}
