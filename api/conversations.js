import { getSupabase, requireAuth, setCors } from "./_helpers.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const user = await requireAuth(req, res);
  if (!user) return;

  const supabase = getSupabase();

  // GET - list all conversations for current user
  if (req.method === "GET") {
    const { data: memberOf } = await supabase
      .from("conversation_members")
      .select("conversation_id")
      .eq("user_id", user.id);

    if (!memberOf || memberOf.length === 0) return res.json([]);

    const ids = memberOf.map(m => m.conversation_id);

    const { data, error } = await supabase
      .from("conversations")
      .select(`
        *,
        conversation_members (
          user_id,
          profiles (id, full_name, year_of_study)
        ),
        messages (id, body, created_at, sender_id,
          profiles (full_name)
        )
      `)
      .in("id", ids)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    // Sort by latest message
    const sorted = (data || []).sort((a, b) => {
      const aLast = a.messages?.[a.messages.length - 1]?.created_at || a.created_at;
      const bLast = b.messages?.[b.messages.length - 1]?.created_at || b.created_at;
      return new Date(bLast) - new Date(aLast);
    });

    return res.json(sorted);
  }

  // POST - create a new conversation (direct from volunteer or group)
  if (req.method === "POST") {
    const { post_id, member_ids, title, is_group } = req.body;
    // member_ids = array of user IDs to add (including self)

    const allMembers = [...new Set([user.id, ...(member_ids || [])])];

    // For direct chats (volunteer → poster): check if convo already exists
    if (!is_group && post_id && allMembers.length === 2) {
      const otherId = allMembers.find(id => id !== user.id);

      // Find existing conversation for this post between these two users
      const { data: existing } = await supabase
        .from("conversations")
        .select("id, conversation_members(user_id)")
        .eq("post_id", post_id)
        .eq("is_group", false);

      if (existing) {
        for (const conv of existing) {
          const memberIds = conv.conversation_members.map(m => m.user_id);
          if (memberIds.includes(user.id) && memberIds.includes(otherId)) {
            return res.json({ id: conv.id, existing: true });
          }
        }
      }
    }

    // Create new conversation
    const { data: conv, error: convErr } = await supabase
      .from("conversations")
      .insert({
        post_id: post_id || null,
        title: title || null,
        is_group: is_group || false,
        created_by: user.id
      })
      .select()
      .single();

    if (convErr) return res.status(500).json({ error: convErr.message });

    // Add all members
    const memberRows = allMembers.map(uid => ({
      conversation_id: conv.id,
      user_id: uid
    }));

    const { error: memErr } = await supabase
      .from("conversation_members")
      .insert(memberRows);

    if (memErr) return res.status(500).json({ error: memErr.message });

    return res.json({ id: conv.id, existing: false });
  }

  res.status(405).json({ error: "Method not allowed" });
}
