import { getSupabase, requireAuth, setCors } from "./_helpers.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const supabase = getSupabase();

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("posts")
      .select(`*, profiles (id, full_name, avatar_url, year_of_study, faculty), volunteers (id, user_id), sessions (id, summary, tutor_name, created_at)`)
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  if (req.method === "POST") {
    const user = await requireAuth(req, res);
    if (!user) return;
    const { course_code, topic, body } = req.body;
    if (!course_code || !topic || !body)
      return res.status(400).json({ error: "course_code, topic, body required" });
    const { data, error } = await supabase
      .from("posts")
      .insert({ course_code, topic, body, user_id: user.id })
      .select(`*, profiles (id, full_name, avatar_url, year_of_study, faculty)`)
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  res.status(405).json({ error: "Method not allowed" });
}
