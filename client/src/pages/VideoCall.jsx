import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";

export default function VideoCall() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const [callUrl, setCallUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function setup() {
      try {
        const { room_url, token } = await api.createCall(postId);
        // Append token to URL for Daily.co iframe embed
        const url = `${room_url}?t=${token}`;
        setCallUrl(url);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    setup();
  }, [postId]);

  return (
    <div style={{ background: "#0D1117", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ background: "#161B22", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #30363D" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3FB950" }} />
          <span style={{ color: "white", fontSize: 14, fontWeight: 500 }}>PeerPath Video Call</span>
          <span style={{ color: "#888", fontSize: 12 }}>Room: {postId?.slice(0, 8)}...</span>
        </div>
        <button onClick={() => navigate("/")} style={{
          background: "#DA3633", color: "white", padding: "7px 16px", borderRadius: 8,
          fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit"
        }}>
          ✕ Leave Call
        </button>
      </div>

      {/* Call area */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "white" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📹</div>
            <p style={{ fontSize: 16, color: "#aaa" }}>Setting up your call...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", color: "white", maxWidth: 400 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <p style={{ fontSize: 15, color: "#E63946", marginBottom: 8 }}>Could not start call</p>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>{error}</p>
            <p style={{ fontSize: 12, color: "#666" }}>Make sure your DAILY_API_KEY is set in server/.env and you have a Daily.co account at daily.co</p>
            <button onClick={() => navigate("/")} style={{ marginTop: 16, background: "#004D1C", color: "white", padding: "10px 24px", borderRadius: 10, fontSize: 14, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              Back to Feed
            </button>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={callUrl}
            allow="camera; microphone; fullscreen; speaker; display-capture"
            style={{ width: "100%", height: "calc(100vh - 57px)", border: "none" }}
            title="PeerPath Video Call"
          />
        )}
      </div>
    </div>
  );
}
