import { getSupabase, requireAuth, setCors } from "../_helpers.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const user = await requireAuth(req, res);
  if (!user) return;

  const supabase = getSupabase();
  const { id } = req.query;

  if (req.method === "DELETE") {
    const { data: post } = await supabase.from("posts").select("user_id").eq("id", id).single();
    if (!post || post.user_id !== user.id)
      return res.status(403).json({ error: "Forbidden" });
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }

  res.status(405).json({ error: "Method not allowed" });
}
