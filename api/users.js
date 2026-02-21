import { getSupabase, requireAuth, setCors } from "./_helpers.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.json([]);

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, year_of_study, faculty")
    .ilike("full_name", `%${q}%`)
    .neq("id", user.id)
    .limit(10);

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
}
