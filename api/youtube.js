const axios = require("axios");
const { requireAuth, setCors } = require("./_helpers");

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireAuth(req, res);
  if (!user) return;

  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "query required" });

  try {
    const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        part: "snippet",
        q: `${q} tutorial explained`,
        type: "video",
        maxResults: 5,
        relevanceLanguage: "en",
        safeSearch: "strict",
        key: process.env.YOUTUBE_API_KEY
      }
    });
    const videos = response.data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium.url,
      description: item.snippet.description
    }));
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
}
