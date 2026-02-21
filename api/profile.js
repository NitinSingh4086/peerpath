import { getSupabase, requireAuth, setCors } from "./_helpers.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const user = await requireAuth(req, res);
  if (!user) return;

  const supabase = getSupabase();

  if (req.method === "GET") {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  if (req.method === "PUT") {
    const { full_name, year_of_study, faculty, bio } = req.body;
    const { data, error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, full_name, year_of_study, faculty, bio, updated_at: new Date() })
      .select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  res.status(405).json({ error: "Method not allowed" });
}
