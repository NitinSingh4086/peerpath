import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { api } from "../lib/api.js";

const FACULTIES = ["Science", "Engineering", "Arts", "Business", "Education", "Law", "Medicine", "Nursing", "Pharmacy", "Kinesiology", "Agriculture", "Other"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year+", "Graduate", "PhD"];

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({ full_name: "", year_of_study: "", faculty: "", bio: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        year_of_study: profile.year_of_study || "",
        faculty: profile.faculty || "",
        bio: profile.bio || ""
      });
    }
  }, [profile]);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await api.updateProfile(form);
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  const initials = form.full_name ? form.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?";

  return (
    <div style={{ background: "#F7F6F2", minHeight: "100vh", padding: "32px 24px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        {/* Avatar section */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#004D1C", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFDB00", fontWeight: 700, fontSize: 26 }}>
            {initials}
          </div>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#1a1a1a" }}>{form.full_name || "Your Profile"}</h1>
            <p style={{ color: "#888", fontSize: 14 }}>{user?.email}</p>
          </div>
        </div>

        <div style={{ background: "white", borderRadius: 20, padding: 32, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24, color: "#1a1a1a" }}>Edit Profile</h2>
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: 18 }}>
              <label style={lbl}>FULL NAME</label>
              <input value={form.full_name} onChange={set("full_name")} placeholder="Jane Smith" style={inp} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
              <div>
                <label style={lbl}>YEAR</label>
                <select value={form.year_of_study} onChange={set("year_of_study")} style={{ ...inp, cursor: "pointer" }}>
                  <option value="">Select year</option>
                  {YEARS.map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>FACULTY</label>
                <select value={form.faculty} onChange={set("faculty")} style={{ ...inp, cursor: "pointer" }}>
                  <option value="">Select faculty</option>
                  {FACULTIES.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={lbl}>BIO <span style={{ fontWeight: 400, color: "#bbb" }}>(optional)</span></label>
              <textarea value={form.bio} onChange={set("bio")} placeholder="What courses are you strong in? What are you studying? This helps people know if you can help them." rows={4}
                style={{ ...inp, resize: "vertical" }} />
            </div>
            {error && <p style={{ color: "#E63946", fontSize: 13, marginBottom: 14, background: "#FEF0F0", padding: "10px 14px", borderRadius: 8 }}>⚠ {error}</p>}
            {saved && <p style={{ color: "#2A9D8F", fontSize: 13, marginBottom: 14, background: "#F0FBF9", padding: "10px 14px", borderRadius: 8 }}>✓ Profile saved!</p>}
            <button type="submit" disabled={saving} style={{ background: "#004D1C", color: "white", padding: "13px 28px", borderRadius: 12, fontSize: 15, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const lbl = { display: "block", fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: "0.5px", marginBottom: 6 };
const inp = { width: "100%", padding: "12px 14px", border: "1.5px solid #E0DDD6", borderRadius: 10, fontSize: 14, outline: "none", fontFamily: "inherit", background: "#FAFAF8" };
