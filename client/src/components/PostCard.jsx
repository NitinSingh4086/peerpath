import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import { api } from "../lib/api.js";
import AIResourcesModal from "./AIResourcesModal.jsx";
import SessionSummaryModal from "./SessionSummaryModal.jsx";
import VolunteersModal from "./VolunteersModal.jsx";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function Avatar({ name, size = 40 }) {
  const initials = name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?";
  const colors = ["#004D1C", "#006633", "#1B4332", "#2D6A4F", "#40916C"];
  const color = colors[name?.charCodeAt(0) % colors.length] || "#004D1C";
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "#FFDB00", fontWeight: 700, fontSize: size * 0.34, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

export default function PostCard({ post, onDelete, onUpdate }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showResources, setShowResources] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showVolunteers, setShowVolunteers] = useState(false);
  const [volunteering, setVolunteering] = useState(false);
  const [hasVolunteered, setHasVolunteered] = useState(post.volunteers?.some(v => v.user_id === user?.id));
  const [volunteerCount, setVolunteerCount] = useState(post.volunteers?.length || 0);
  const [deleting, setDeleting] = useState(false);

  const isOwner = user?.id === post.user_id;
  const name = post.profiles?.full_name || "Anonymous";
  const year = post.profiles?.year_of_study || "";
  const faculty = post.profiles?.faculty || "";

  const handleVolunteer = async () => {
    setVolunteering(true);
    try {
      if (hasVolunteered) {
        await api.unvolunteer(post.id);
        setHasVolunteered(false);
        setVolunteerCount(c => c - 1);
      } else {
        await api.volunteer(post.id);
        setHasVolunteered(true);
        setVolunteerCount(c => c + 1);
        // Auto-create a direct chat between volunteer and post author
        try {
          const { id: convId } = await api.createConversation({
            post_id: post.id,
            member_ids: [post.user_id],
            is_group: false
          });
          navigate(`/chat?conv=${convId}`);
        } catch {}
      }
    } catch (err) {
      alert(err.message);
    }
    setVolunteering(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    setDeleting(true);
    try {
      await api.deletePost(post.id);
      onDelete(post.id);
    } catch (err) {
      alert(err.message);
      setDeleting(false);
    }
  };

  const handleCallJoin = async () => {
    navigate(`/call/${post.id}`);
  };

  return (
    <>
      <div style={{
        background: "white", borderRadius: 16, padding: 24,
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #EDEAE3",
        transition: "box-shadow 0.2s"
      }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.09)"}
        onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar name={name} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>{name}</div>
              <div style={{ fontSize: 12, color: "#999" }}>{[year, faculty].filter(Boolean).join(" · ")} · {timeAgo(post.created_at)}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ background: "#E8F5EE", color: "#004D1C", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
              {post.course_code}
            </span>
            {isOwner && (
              <button onClick={handleDelete} disabled={deleting} style={{ color: "#ccc", fontSize: 16, cursor: "pointer", background: "none", border: "none", lineHeight: 1 }} title="Delete post">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>{post.topic}</h3>
        <p style={{ color: "#555", fontSize: 14, lineHeight: 1.7, marginBottom: 14 }}>{post.body}</p>

        {/* Sessions */}
        {post.sessions?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            {post.sessions.map((s, i) => (
              <div key={i} style={{ borderLeft: "3px solid #FFDB00", padding: "10px 14px", background: "#FFFDF0", borderRadius: "0 8px 8px 0", marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>
                  📋 Session by <strong>{s.tutor_name}</strong> · {new Date(s.created_at).toLocaleDateString()}
                </div>
                <p style={{ fontSize: 13, color: "#444", lineHeight: 1.6 }}>{s.summary}</p>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {/* Volunteer */}
          <button onClick={handleVolunteer} disabled={volunteering} style={{
            background: hasVolunteered ? "#E8F5EE" : "#004D1C",
            color: hasVolunteered ? "#004D1C" : "white",
            border: hasVolunteered ? "1.5px solid #004D1C" : "none",
            padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s"
          }}>
            {hasVolunteered ? "✓ Volunteered" : "🤝 Volunteer to Help"}
            {volunteerCount > 0 && (
              <span style={{ background: hasVolunteered ? "#004D1C" : "rgba(255,255,255,0.2)", color: hasVolunteered ? "white" : "white", borderRadius: 10, padding: "1px 7px", fontSize: 11 }}>
                {volunteerCount}
              </span>
            )}
          </button>

          {/* See volunteers */}
          {volunteerCount > 0 && (
            <button onClick={() => setShowVolunteers(true)} style={ghostBtn}>
              👥 See helpers
            </button>
          )}

          {/* AI Resources */}
          <button onClick={() => setShowResources(true)} style={ghostBtn}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "linear-gradient(135deg,#006633,#00A86B)", color: "white", padding: "2px 7px", borderRadius: 10, fontSize: 10, fontWeight: 700 }}>AI</span>
            Resources
          </button>

          {/* Video call */}
          <button onClick={handleCallJoin} style={ghostBtn}>
            🎥 Join Video Call
          </button>

          {/* Session summary — only for volunteers */}
          {hasVolunteered && (
            <button onClick={() => setShowSummary(true)} style={{ ...ghostBtn, borderColor: "#FFDB00", color: "#7A6000" }}>
              ✦ Add Session Summary
            </button>
          )}
        </div>
      </div>

      {showResources && (
        <AIResourcesModal post={post} onClose={() => setShowResources(false)} />
      )}
      {showSummary && (
        <SessionSummaryModal post={post} onClose={() => setShowSummary(false)} onSaved={(session) => {
          onUpdate(post.id, { sessions: [...(post.sessions || []), session] });
          setShowSummary(false);
        }} />
      )}
      {showVolunteers && (
        <VolunteersModal postId={post.id} onClose={() => setShowVolunteers(false)} />
      )}
    </>
  );
}

const ghostBtn = { background: "#F7F6F2", color: "#444", padding: "9px 14px", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", border: "1.5px solid #E0DDD6", display: "flex", alignItems: "center", gap: 6, transition: "background 0.15s" };
