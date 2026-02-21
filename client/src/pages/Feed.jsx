import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { api } from "../lib/api.js";
import PostCard from "../components/PostCard.jsx";

const DEPARTMENTS = ["All", "ECE", "CMPUT", "MATH", "PHYS", "CHEM", "BIOL", "ENGG", "ECON", "PSYC", "SOC"];

export default function Feed() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ course_code: "", topic: "", body: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const loadPosts = useCallback(async () => {
    try {
      const data = await api.getPosts();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const filtered = filter === "All" ? posts : posts.filter(p => p.course_code.toUpperCase().startsWith(filter));

  const handlePost = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const newPost = await api.createPost(form);
      setPosts(prev => [newPost, ...prev]);
      setForm({ course_code: "", topic: "", body: "" });
      setShowForm(false);
    } catch (err) {
      setFormError(err.message);
    }
    setSubmitting(false);
  };

  const handleDelete = (id) => setPosts(prev => prev.filter(p => p.id !== id));

  const handleUpdate = (id, updates) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  return (
    <div style={{ background: "#F7F6F2", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ background: "#004D1C", padding: "36px 24px 52px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "clamp(24px,4vw,38px)", marginBottom: 10, lineHeight: 1.2 }}>
            {profile?.full_name ? `Hey, ${profile.full_name.split(" ")[0]} 👋` : "Hey there 👋"}
          </h1>
          <p style={{ color: "#A8D5B5", fontSize: 15, marginBottom: 24, maxWidth: 480 }}>
            Post what you're stuck on — your peers and seniors are here to help. Every session summary helps the next student.
          </p>
          <button onClick={() => setShowForm(s => !s)} style={{
            background: "#FFDB00", color: "#004D1C", padding: "13px 26px",
            borderRadius: 12, fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer",
            fontFamily: "inherit", boxShadow: "0 4px 16px rgba(255,219,0,0.3)", transition: "transform 0.15s"
          }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            {showForm ? "✕ Cancel" : "+ Ask for Help"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 24px 40px" }}>
        {/* New post form */}
        {showForm && (
          <div style={{ background: "white", borderRadius: 16, padding: 28, marginTop: -20, marginBottom: 24, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", border: "1px solid #EDEAE3" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: 20 }}>What do you need help with?</h3>
            <form onSubmit={handlePost}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={lbl}>COURSE CODE</label>
                  <input required value={form.course_code} onChange={e => setForm(f => ({ ...f, course_code: e.target.value }))} placeholder="e.g. ECE 202" style={inp} />
                </div>
                <div>
                  <label style={lbl}>TOPIC / CONCEPT</label>
                  <input required value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} placeholder="e.g. Laplace Transforms" style={inp} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>DESCRIBE YOUR PROBLEM</label>
                <textarea required value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Be specific — what exactly are you stuck on? Mention your exam/deadline if relevant." rows={4} style={{ ...inp, resize: "vertical" }} />
              </div>
              {formError && <p style={{ color: "#E63946", fontSize: 13, marginBottom: 12 }}>⚠ {formError}</p>}
              <button type="submit" disabled={submitting} style={{ background: "#004D1C", color: "white", padding: "12px 28px", borderRadius: 10, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                {submitting ? "Posting..." : "Post Request"}
              </button>
            </form>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "flex", gap: 0, background: "white", borderRadius: 14, overflow: "hidden", border: "1px solid #EDEAE3", marginTop: showForm ? 0 : 24, marginBottom: 24 }}>
          {[["📬", `${posts.length}`, "Open Requests"], ["🤝", `${posts.reduce((a, p) => a + (p.volunteers?.length || 0), 0)}`, "Volunteers"], ["📋", `${posts.reduce((a, p) => a + (p.sessions?.length || 0), 0)}`, "Sessions Logged"]].map(([icon, num, label]) => (
            <div key={label} style={{ flex: 1, padding: "16px 20px", textAlign: "center", borderRight: "1px solid #EDEAE3" }}>
              <div style={{ fontSize: 20, marginBottom: 2 }}>{icon}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#004D1C" }}>{num}</div>
              <div style={{ fontSize: 11, color: "#999" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Department filter */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {DEPARTMENTS.map(d => (
            <button key={d} onClick={() => setFilter(d)} style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
              background: filter === d ? "#004D1C" : "white",
              color: filter === d ? "white" : "#555",
              border: filter === d ? "none" : "1.5px solid #E0DDD6",
              transition: "all 0.15s"
            }}>{d}</button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
            <div style={{ fontSize: 30, marginBottom: 10 }}>⏳</div>
            <p>Loading posts...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#E63946" }}>⚠ {error} — <button onClick={loadPosts} style={{ color: "#004D1C", fontWeight: 600, cursor: "pointer", background: "none", border: "none", fontFamily: "inherit" }}>Retry</button></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <p style={{ fontWeight: 500 }}>{filter === "All" ? "No posts yet — be the first to ask!" : `No posts for ${filter} yet.`}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map(post => (
              <PostCard key={post.id} post={post} onDelete={handleDelete} onUpdate={handleUpdate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const lbl = { display: "block", fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: "0.5px", marginBottom: 6 };
const inp = { width: "100%", padding: "11px 14px", border: "1.5px solid #E0DDD6", borderRadius: 10, fontSize: 14, outline: "none", fontFamily: "inherit", background: "#FAFAF8" };
