import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import { api } from "../lib/api.js";
import { supabase } from "../lib/supabase.js";

function Avatar({ name, size = 36 }) {
  const initials = name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?";
  const colors = ["#004D1C", "#006633", "#1B4332", "#2D6A4F", "#40916C"];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "#FFDB00", fontWeight: 700, fontSize: size * 0.33, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return new Date(dateStr).toLocaleDateString();
}

// ─── Group Creation Modal ─────────────────────────────────────
function CreateGroupModal({ onClose, onCreated, currentUserId }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (search.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.searchUsers(search);
        setResults(data);
      } catch { }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const toggleSelect = (user) => {
    setSelected(prev =>
      prev.find(u => u.id === user.id)
        ? prev.filter(u => u.id !== user.id)
        : [...prev, user]
    );
  };

  const handleCreate = async () => {
    if (!title.trim() || selected.length === 0) return;
    setCreating(true);
    try {
      const { id } = await api.createConversation({
        member_ids: selected.map(u => u.id),
        title: title.trim(),
        is_group: true
      });
      onCreated(id);
    } catch (err) {
      alert(err.message);
    }
    setCreating(false);
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 480, padding: 28, maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20 }}>Create Group Chat</h2>
          <button onClick={onClose} style={{ fontSize: 20, color: "#999", background: "none", border: "none", cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>GROUP NAME</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. ECE 202 Study Group" style={inp} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>ADD MEMBERS</label>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name..." style={inp} />
        </div>

        {loading && <p style={{ fontSize: 13, color: "#888", marginBottom: 10 }}>Searching...</p>}

        {results.length > 0 && (
          <div style={{ border: "1px solid #E0DDD6", borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
            {results.map(u => {
              const isSelected = selected.find(s => s.id === u.id);
              return (
                <div key={u.id} onClick={() => toggleSelect(u)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", cursor: "pointer", background: isSelected ? "#E8F5EE" : "white", borderBottom: "1px solid #F0EDE6" }}>
                  <Avatar name={u.full_name} size={32} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{u.full_name}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>{u.year_of_study} · {u.faculty}</div>
                  </div>
                  {isSelected && <span style={{ color: "#004D1C", fontWeight: 700 }}>✓</span>}
                </div>
              );
            })}
          </div>
        )}

        {selected.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {selected.map(u => (
              <span key={u.id} onClick={() => toggleSelect(u)} style={{ background: "#004D1C", color: "white", padding: "4px 10px", borderRadius: 20, fontSize: 12, cursor: "pointer" }}>
                {u.full_name} ✕
              </span>
            ))}
          </div>
        )}

        <button onClick={handleCreate} disabled={creating || !title.trim() || selected.length === 0} style={{
          background: title.trim() && selected.length > 0 ? "#004D1C" : "#ccc",
          color: "white", padding: "12px", borderRadius: 12, fontSize: 14, fontWeight: 600,
          border: "none", cursor: "pointer", fontFamily: "inherit", marginTop: "auto"
        }}>
          {creating ? "Creating..." : `Create Group with ${selected.length + 1} members`}
        </button>
      </div>
    </div>
  );
}

// ─── Main Chat Page ───────────────────────────────────────────
export default function Chat() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const messagesEndRef = useRef(null);
  const channelRef = useRef(null);

  const loadConversations = useCallback(async () => {
    try {
      const data = await api.getConversations();
      setConversations(data);

      // Auto-open conversation if redirected from a post
      const convId = searchParams.get("conv");
      if (convId) {
        const found = data.find(c => c.id === convId);
        if (found) setActiveConv(found);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [searchParams]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Load messages when conversation changes
  useEffect(() => {
    if (!activeConv) return;
    setMessages([]);

    api.getMessages(activeConv.id).then(setMessages);

    // Subscribe to realtime messages
    if (channelRef.current) supabase.removeChannel(channelRef.current);

    channelRef.current = supabase
      .channel(`messages:${activeConv.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${activeConv.id}`
      }, async (payload) => {
        // Fetch full message with profile
        const { data } = await supabase
          .from("messages")
          .select("*, profiles (id, full_name)")
          .eq("id", payload.new.id)
          .single();
        if (data) setMessages(prev => [...prev, data]);
      })
      .subscribe();

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [activeConv]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeConv || sending) return;
    setSending(true);
    try {
      await api.sendMessage(activeConv.id, newMsg.trim());
      setNewMsg("");
    } catch (err) {
      alert(err.message);
    }
    setSending(false);
  };

  const getConvName = (conv) => {
    if (conv.is_group) return conv.title || "Group Chat";
    const other = conv.conversation_members?.find(m => m.user_id !== user?.id);
    return other?.profiles?.full_name || "Chat";
  };

  const getLastMessage = (conv) => {
    const msgs = conv.messages || [];
    if (msgs.length === 0) return "No messages yet";
    const last = msgs[msgs.length - 1];
    return last.body?.slice(0, 40) + (last.body?.length > 40 ? "..." : "");
  };

  const getLastTime = (conv) => {
    const msgs = conv.messages || [];
    if (msgs.length === 0) return timeAgo(conv.created_at);
    return timeAgo(msgs[msgs.length - 1].created_at);
  };

  return (
    <div style={{ height: "calc(100vh - 60px)", display: "flex", background: "#F7F6F2" }}>

      {/* ── Sidebar ── */}
      <div style={{ width: 320, background: "white", borderRight: "1px solid #EDEAE3", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "20px 20px 14px", borderBottom: "1px solid #EDEAE3" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#1a1a1a" }}>Messages</h2>
            <button onClick={() => setShowCreateGroup(true)} style={{ background: "#004D1C", color: "white", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              + Group
            </button>
          </div>
        </div>

        <div style={{ overflowY: "auto", flex: 1 }}>
          {loading ? (
            <p style={{ padding: 20, color: "#888", fontSize: 14 }}>Loading chats...</p>
          ) : conversations.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>💬</div>
              <p style={{ color: "#888", fontSize: 13, lineHeight: 1.6 }}>No chats yet. Volunteer on a post to start a conversation!</p>
            </div>
          ) : (
            conversations.map(conv => {
              const isActive = activeConv?.id === conv.id;
              const name = getConvName(conv);
              return (
                <div key={conv.id} onClick={() => setActiveConv(conv)} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "14px 20px",
                  cursor: "pointer", background: isActive ? "#E8F5EE" : "white",
                  borderBottom: "1px solid #F7F6F2", borderLeft: isActive ? "3px solid #004D1C" : "3px solid transparent",
                  transition: "background 0.15s"
                }}>
                  <Avatar name={name} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>{name}</span>
                      <span style={{ fontSize: 11, color: "#999" }}>{getLastTime(conv)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {conv.is_group && <span style={{ color: "#004D1C", fontWeight: 500 }}>Group · </span>}
                      {getLastMessage(conv)}
                    </div>
                    {conv.post_id && (
                      <div style={{ fontSize: 11, color: "#004D1C", marginTop: 2 }}>re: help request</div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Chat Area ── */}
      {!activeConv ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 48 }}>💬</div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#555" }}>Select a conversation</p>
          <p style={{ fontSize: 14, color: "#888" }}>Or volunteer on a post to start chatting</p>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Chat header */}
          <div style={{ padding: "16px 24px", background: "white", borderBottom: "1px solid #EDEAE3", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar name={getConvName(activeConv)} size={38} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, color: "#1a1a1a" }}>{getConvName(activeConv)}</div>
                <div style={{ fontSize: 12, color: "#888" }}>
                  {activeConv.is_group
                    ? `${activeConv.conversation_members?.length || 0} members`
                    : "Direct message"
                  }
                </div>
              </div>
            </div>
            {activeConv.post_id && (
              <button onClick={() => navigate("/")} style={{ fontSize: 12, color: "#004D1C", fontWeight: 600, background: "#E8F5EE", border: "none", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}>
                View Post →
              </button>
            )}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: "center", marginTop: 40, color: "#888" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>👋</div>
                <p style={{ fontSize: 14 }}>Start the conversation!</p>
              </div>
            ) : (
              messages.map(msg => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", alignItems: "flex-end", gap: 8 }}>
                    {!isMe && <Avatar name={msg.profiles?.full_name} size={28} />}
                    <div style={{ maxWidth: "68%" }}>
                      {!isMe && (
                        <div style={{ fontSize: 11, color: "#888", marginBottom: 3, marginLeft: 4 }}>{msg.profiles?.full_name}</div>
                      )}
                      <div style={{
                        background: isMe ? "#004D1C" : "white",
                        color: isMe ? "white" : "#1a1a1a",
                        padding: "10px 14px", borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                        fontSize: 14, lineHeight: 1.5,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                        border: isMe ? "none" : "1px solid #EDEAE3"
                      }}>
                        {msg.body}
                      </div>
                      <div style={{ fontSize: 11, color: "#bbb", marginTop: 3, textAlign: isMe ? "right" : "left", paddingLeft: 4, paddingRight: 4 }}>
                        {timeAgo(msg.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <form onSubmit={handleSend} style={{ padding: "16px 24px", background: "white", borderTop: "1px solid #EDEAE3", display: "flex", gap: 10 }}>
            <input
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
              placeholder="Type a message..."
              style={{ flex: 1, padding: "11px 16px", border: "1.5px solid #E0DDD6", borderRadius: 24, fontSize: 14, outline: "none", fontFamily: "inherit", background: "#FAFAF8" }}
            />
            <button type="submit" disabled={!newMsg.trim() || sending} style={{
              background: newMsg.trim() ? "#004D1C" : "#ccc", color: "white",
              padding: "11px 20px", borderRadius: 24, fontSize: 14, fontWeight: 600,
              border: "none", cursor: newMsg.trim() ? "pointer" : "not-allowed", fontFamily: "inherit",
              transition: "background 0.15s"
            }}>
              {sending ? "..." : "Send"}
            </button>
          </form>
        </div>
      )}

      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          currentUserId={user?.id}
          onCreated={(id) => {
            setShowCreateGroup(false);
            loadConversations().then(() => {
              // Auto open the new group
            });
          }}
        />
      )}
    </div>
  );
}

const lbl = { display: "block", fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: "0.5px", marginBottom: 6 };
const inp = { width: "100%", padding: "11px 14px", border: "1.5px solid #E0DDD6", borderRadius: 10, fontSize: 14, outline: "none", fontFamily: "inherit", background: "#FAFAF8" };
