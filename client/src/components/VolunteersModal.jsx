import { useState, useEffect } from "react";
import { api } from "../lib/api.js";

export default function VolunteersModal({ postId, onClose }) {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getVolunteers(postId).then(data => {
      setVolunteers(data);
      setLoading(false);
    });
  }, [postId]);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 420, padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20 }}>Volunteers ({volunteers.length})</h2>
          <button onClick={onClose} style={{ fontSize: 20, color: "#999", cursor: "pointer", background: "none", border: "none" }}>✕</button>
        </div>
        {loading ? (
          <p style={{ color: "#888", fontSize: 14 }}>Loading...</p>
        ) : volunteers.length === 0 ? (
          <p style={{ color: "#888", fontSize: 14 }}>No volunteers yet.</p>
        ) : (
          volunteers.map(v => {
            const name = v.profiles?.full_name || "Anonymous";
            const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
            return (
              <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #F0EDE6" }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#004D1C", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFDB00", fontWeight: 700, fontSize: 13 }}>{initials}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>{name}</div>
                  <div style={{ fontSize: 12, color: "#999" }}>{v.profiles?.year_of_study || ""}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
