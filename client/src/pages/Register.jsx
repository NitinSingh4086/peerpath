import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

const FACULTIES = ["Science", "Engineering", "Arts", "Business", "Education", "Law", "Medicine", "Nursing", "Pharmacy", "Kinesiology", "Agriculture", "Other"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year+", "Graduate", "PhD"];

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", full_name: "", year_of_study: "", faculty: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true);
    try {
      await signUp(form.email, form.password, {
        full_name: form.full_name,
        year_of_study: form.year_of_study,
        faculty: form.faculty
      });
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F7F6F2", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 460 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, background: "#004D1C", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <span style={{ fontSize: 26, fontWeight: 700, color: "#FFDB00", fontFamily: "'Playfair Display', serif" }}>P</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#1a1a1a" }}>Join PeerPath</h1>
          <p style={{ color: "#888", fontSize: 14, marginTop: 6 }}>University of Alberta peer tutoring community</p>
        </div>

        <div style={{ background: "white", borderRadius: 20, padding: 32, boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>FULL NAME</label>
              <input type="text" required value={form.full_name} onChange={set("full_name")} placeholder="Jane Smith" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>EMAIL</label>
              <input type="email" required value={form.email} onChange={set("email")} placeholder="you@ualberta.ca" style={inputStyle} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>YEAR</label>
                <select required value={form.year_of_study} onChange={set("year_of_study")} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="">Select year</option>
                  {YEARS.map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>FACULTY</label>
                <select required value={form.faculty} onChange={set("faculty")} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="">Select faculty</option>
                  {FACULTIES.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>PASSWORD</label>
              <input type="password" required value={form.password} onChange={set("password")} placeholder="Min. 6 characters" style={inputStyle} />
            </div>
            {error && <p style={{ color: "#E63946", fontSize: 13, marginBottom: 16, background: "#FEF0F0", padding: "10px 14px", borderRadius: 8 }}>{error}</p>}
            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#666" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#004D1C", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: "0.5px", marginBottom: 6 };
const inputStyle = { width: "100%", padding: "12px 14px", border: "1.5px solid #E0DDD6", borderRadius: 10, fontSize: 14, outline: "none", fontFamily: "inherit", background: "#FAFAF8" };
const btnStyle = { width: "100%", background: "#004D1C", color: "white", padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit" };
