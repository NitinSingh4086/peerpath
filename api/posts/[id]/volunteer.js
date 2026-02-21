const { getSupabase, requireAuth, setCors } = require("../../_helpers");

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const supabase = getSupabase();
  const { id } = req.query;

  // GET - list volunteers for a post
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("volunteers")
      .select("*, profiles (id, full_name, avatar_url, year_of_study)")
      .eq("post_id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  // POST - volunteer
  if (req.method === "POST") {
    const { data: existing } = await supabase
      .from("volunteers")
      .select("id")
      .eq("post_id", id)
      .eq("user_id", user.id)
      .single();

    if (existing) return res.status(409).json({ error: "Already volunteered" });

    const { data, error } = await supabase
      .from("volunteers")
      .insert({ post_id: id, user_id: user.id })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  // DELETE - unvolunteer
  if (req.method === "DELETE") {
    const { error } = await supabase
      .from("volunteers")
      .delete()
      .eq("post_id", id)
      .eq("user_id", user.id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }

  res.status(405).json({ error: "Method not allowed" });
}
