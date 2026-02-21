import { useParams, useNavigate } from "react-router-dom";

export default function VideoCall() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const roomName = `peerpath-ualberta-${postId}`;
  const jitsiUrl = `https://meet.jit.si/${roomName}`;

  return (
    <div style={{ background: "#0D1117", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
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
      <iframe
        src={jitsiUrl}
        allow="camera; microphone; fullscreen; speaker; display-capture"
        style={{ width: "100%", height: "calc(100vh - 57px)", border: "none" }}
        title="PeerPath Video Call"
      />
    </div>
  );
}
