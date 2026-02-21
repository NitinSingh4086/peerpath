import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "?";

  const navLink = (path, label) => (
    <Link to={path} style={{
      color: location.pathname === path ? "#FFDB00" : "#A8D5B5",
      textDecoration: "none", fontSize: 14, fontWeight: location.pathname === path ? 600 : 500,
      transition: "color 0.15s"
    }}>{label}</Link>
  );

  return (
    <nav style={{ background: "#004D1C", padding: "0 24px", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          <div style={{ width: 34, height: 34, background: "#FFDB00", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: "#004D1C" }}>P</span>
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 600, fontSize: 15, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>PeerPath</div>
            <div style={{ color: "#A8D5B5", fontSize: 10 }}>University of Alberta</div>
          </div>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {navLink("/", "Feed")}
          {navLink("/chat", "Messages")}
          {navLink("/profile", "Profile")}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link to="/profile" style={{ width: 34, height: 34, borderRadius: "50%", background: "#FFDB00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#004D1C", textDecoration: "none" }}>{initials}</Link>
            <button onClick={handleSignOut} style={{ color: "#A8D5B5", fontSize: 13, cursor: "pointer", background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "5px 12px", fontFamily: "inherit" }}>Sign out</button>
          </div>
        </div>
      </div>
    </nav>
  );
}
