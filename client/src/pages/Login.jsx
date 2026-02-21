import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F7F6F2", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, background: "#004D1C", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <span style={{ fontSize: 26, fontWeight: 700, color: "#FFDB00", fontFamily: "'Playfair Display', serif" }}>P</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#1a1a1a" }}>Welcome back</h1>
          <p style={{ color: "#888", fontSize: 14, marginTop: 6 }}>Sign in to PeerPath — University of Alberta</p>
        </div>

        <div style={{ background: "white", borderRadius: 20, padding: 32, boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>EMAIL</label>
              <input
                type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@ualberta.ca"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>PASSWORD</label>
              <input
                type="password" required value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>
            {error && <p style={{ color: "#E63946", fontSize: 13, marginBottom: 16, background: "#FEF0F0", padding: "10px 14px", borderRadius: 8 }}>{error}</p>}
            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#666" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#004D1C", fontWeight: 600, textDecoration: "none" }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: "0.5px", marginBottom: 6 };
const inputStyle = { width: "100%", padding: "12px 14px", border: "1.5px solid #E0DDD6", borderRadius: 10, fontSize: 14, outline: "none", fontFamily: "inherit", transition: "border 0.15s", background: "#FAFAF8" };
const btnStyle = { width: "100%", background: "#004D1C", color: "white", padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit" };
