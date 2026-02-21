import { getSupabase, requireAuth, setCors } from "../_helpers.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const user = await requireAuth(req, res);
  if (!user) return;

  const supabase = getSupabase();
  const { conv_id } = req.query;

  if (!conv_id) return res.status(400).json({ error: "conv_id required" });

  // Verify user is a member
  const { data: member } = await supabase
    .from("conversation_members")
    .select("id")
    .eq("conversation_id", conv_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!member) return res.status(403).json({ error: "Not a member of this conversation" });

  // GET - fetch messages
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("messages")
      .select("*, profiles (id, full_name)")
      .eq("conversation_id", conv_id)
      .order("created_at", { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  }

  // POST - send a message
  if (req.method === "POST") {
    const { body } = req.body;
    if (!body?.trim()) return res.status(400).json({ error: "Message body required" });

    const { data, error } = await supabase
      .from("messages")
      .insert({ conversation_id: conv_id, sender_id: user.id, body: body.trim() })
      .select("*, profiles (id, full_name)")
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  res.status(405).json({ error: "Method not allowed" });
}
