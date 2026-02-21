import { useState } from "react";
import { api } from "../lib/api.js";

export default function SessionSummaryModal({ post, onClose, onSaved }) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!notes.trim()) return;
    setLoading(true);
    setError("");
    try {
      const session = await api.generateSummary({
        post_id: post.id,
        notes,
        course_code: post.course_code,
        topic: post.topic,
        original_body: post.body
      });
      setSummary(session.summary);
      onSaved(session);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 560, padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg,#006633,#00A86B)", color: "white", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, marginBottom: 8 }}>✦ AI SUMMARY</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20 }}>Log Your Session</h2>
          </div>
          <button onClick={onClose} style={{ fontSize: 20, color: "#999", cursor: "pointer", background: "none", border: "none" }}>✕</button>
        </div>

        <p style={{ fontSize: 13, color: "#666", marginBottom: 16, lineHeight: 1.6 }}>
          You helped with <strong>{post.topic}</strong> ({post.course_code}). Write quick notes about what you covered — AI will turn them into a polished public summary.
        </p>

        {!summary ? (
          <>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. We worked through 3 practice problems. The main insight was working backwards from the goal. Covered repeated roots case. Student was confident by the end."
              rows={5}
              style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #E0DDD6", borderRadius: 12, fontSize: 14, resize: "vertical", outline: "none", fontFamily: "inherit", marginBottom: 16, background: "#FAFAF8" }}
            />
            {error && <p style={{ color: "#E63946", fontSize: 13, marginBottom: 12, background: "#FEF0F0", padding: "10px 14px", borderRadius: 8 }}>⚠ {error}</p>}
            {loading ? (
              <div style={{ display: "flex", gap: 6, alignItems: "center", color: "#004D1C", padding: "14px 0" }}>
                {[0, 0.2, 0.4].map(d => (
                  <span key={d} style={{ width: 8, height: 8, borderRadius: "50%", background: "#004D1C", display: "inline-block", animation: "pulse 1.2s infinite", animationDelay: `${d}s` }} />
                ))}
                <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.2}}`}</style>
                <span style={{ marginLeft: 8, color: "#666", fontSize: 14 }}>Generating summary...</span>
              </div>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={!notes.trim()}
                style={{ width: "100%", background: notes.trim() ? "#004D1C" : "#ccc", color: "white", padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 600, border: "none", cursor: notes.trim() ? "pointer" : "not-allowed", fontFamily: "inherit" }}
              >
                Generate & Post Summary
              </button>
            )}
          </>
        ) : (
          <div>
            <div style={{ background: "#FFFDF0", border: "2px solid #FFDB00", borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 10 }}>✦ AI-GENERATED SUMMARY — POSTED PUBLICLY</div>
              <p style={{ fontSize: 14, color: "#333", lineHeight: 1.7 }}>{summary}</p>
            </div>
            <button onClick={onClose} style={{ width: "100%", background: "#004D1C", color: "white", padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              Done ✓
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
