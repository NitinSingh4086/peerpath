import { useState, useEffect } from "react";
import { api } from "../lib/api.js";

function Modal({ children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 680, maxHeight: "88vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}

export default function AIResourcesModal({ post, onClose }) {
  const [tab, setTab] = useState("ai");
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [videos, setVideos] = useState([]);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState("");
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    loadAI();
    loadVideos();
  }, []);

  async function loadAI() {
    setAiLoading(true);
    setAiError("");
    try {
      const data = await api.getAIResources({
        course_code: post.course_code,
        topic: post.topic,
        body: post.body
      });
      setAiText(data.content);
    } catch (err) {
      setAiError(err.message);
    }
    setAiLoading(false);
  }

  async function loadVideos() {
    setVideoLoading(true);
    setVideoError("");
    try {
      const q = `${post.course_code} ${post.topic}`;
      const data = await api.searchYouTube(q);
      setVideos(data);
    } catch (err) {
      setVideoError(err.message);
    }
    setVideoLoading(false);
  }

  return (
    <Modal onClose={onClose}>
      {/* Header */}
      <div style={{ padding: "24px 28px 0", borderBottom: "1px solid #EEECE6" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg,#006633,#00A86B)", color: "white", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>✦ AI POWERED</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#1a1a1a" }}>Resources for {post.topic}</h2>
          </div>
          <button onClick={onClose} style={{ fontSize: 20, color: "#999", cursor: "pointer", background: "none", border: "none" }}>✕</button>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {["ai", "youtube"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "8px 18px", borderRadius: "10px 10px 0 0", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
              background: tab === t ? "white" : "transparent",
              border: tab === t ? "1.5px solid #EEECE6" : "none",
              borderBottom: tab === t ? "2px solid white" : "none",
              color: tab === t ? "#004D1C" : "#888",
              marginBottom: tab === t ? -1 : 0
            }}>
              {t === "ai" ? "🤖 AI Suggestions" : "▶ YouTube Videos"}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "24px 28px", overflowY: "auto", flex: 1 }}>
        {tab === "ai" && (
          aiLoading ? (
            <div style={{ display: "flex", gap: 6, alignItems: "center", color: "#004D1C" }}>
              {[0, 0.2, 0.4].map(d => (
                <span key={d} style={{ width: 8, height: 8, borderRadius: "50%", background: "#004D1C", display: "inline-block", animation: "pulse 1.2s infinite", animationDelay: `${d}s` }} />
              ))}
              <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.2}}`}</style>
              <span style={{ marginLeft: 8, color: "#666", fontSize: 14 }}>Finding the best resources for you...</span>
            </div>
          ) : aiError ? (
            <div style={{ color: "#E63946", fontSize: 14, background: "#FEF0F0", padding: 16, borderRadius: 10 }}>
              ⚠ {aiError}
              <button onClick={loadAI} style={{ display: "block", marginTop: 10, color: "#004D1C", fontWeight: 600, cursor: "pointer", background: "none", border: "none", fontFamily: "inherit" }}>Retry</button>
            </div>
          ) : (
            <div>
              {aiText.split(/\n\n+/).map((block, i) => {
                if (!block.trim()) return null;
                const lines = block.split("\n").filter(Boolean);
                const resourceLine = lines.find(l => l.startsWith("RESOURCE:"));
                const whyLine = lines.find(l => l.startsWith("WHY:"));
                const levelLine = lines.find(l => l.startsWith("LEVEL:"));

                if (resourceLine) {
                  const levelColor = { Beginner: "#2A9D8F", Intermediate: "#F4A261", Advanced: "#E63946" };
                  const level = levelLine?.replace("LEVEL:", "").trim();
                  return (
                    <div key={i} style={{ background: "#F7F6F2", borderRadius: 12, padding: "14px 18px", marginBottom: 12, borderLeft: "3px solid #004D1C" }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a", marginBottom: 6 }}>
                        📚 {resourceLine.replace("RESOURCE:", "").trim()}
                      </div>
                      {whyLine && <p style={{ fontSize: 13, color: "#555", lineHeight: 1.5, marginBottom: 6 }}>{whyLine.replace("WHY:", "").trim()}</p>}
                      {level && <span style={{ background: levelColor[level] || "#ccc", color: "white", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 10 }}>{level}</span>}
                    </div>
                  );
                }
                return <p key={i} style={{ fontSize: 13, color: "#666", marginBottom: 8, lineHeight: 1.6 }}>{block}</p>;
              })}
            </div>
          )
        )}

        {tab === "youtube" && (
          videoLoading ? (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {[0, 0.2, 0.4].map(d => (
                <span key={d} style={{ width: 8, height: 8, borderRadius: "50%", background: "#E63946", display: "inline-block", animation: "pulse 1.2s infinite", animationDelay: `${d}s` }} />
              ))}
              <span style={{ marginLeft: 8, color: "#666", fontSize: 14 }}>Searching YouTube...</span>
            </div>
          ) : videoError ? (
            <div style={{ color: "#E63946", fontSize: 14, background: "#FEF0F0", padding: 16, borderRadius: 10 }}>⚠ {videoError}</div>
          ) : (
            <div>
              {activeVideo && (
                <div style={{ marginBottom: 20, borderRadius: 12, overflow: "hidden", aspectRatio: "16/9" }}>
                  <iframe
                    width="100%" height="100%"
                    src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
                    title="YouTube video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ display: "block" }}
                  />
                </div>
              )}
              {videos.map(v => (
                <div key={v.videoId} onClick={() => setActiveVideo(v.videoId)} style={{
                  display: "flex", gap: 14, padding: "12px", borderRadius: 12, cursor: "pointer", marginBottom: 10,
                  background: activeVideo === v.videoId ? "#E8F5EE" : "#F7F6F2",
                  border: activeVideo === v.videoId ? "1.5px solid #004D1C" : "1.5px solid transparent",
                  transition: "all 0.15s"
                }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <img src={v.thumbnail} alt={v.title} style={{ width: 120, height: 68, objectFit: "cover", borderRadius: 8 }} />
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 28, height: 28, background: "rgba(0,0,0,0.65)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "white", fontSize: 11, marginLeft: 2 }}>▶</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#1a1a1a", marginBottom: 4, lineHeight: 1.4 }}>{v.title}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>{v.channel}</div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </Modal>
  );
}
