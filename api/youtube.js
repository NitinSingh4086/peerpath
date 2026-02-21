import { requireAuth, setCors } from "./_helpers.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireAuth(req, res);
  if (!user) return;

  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "query required" });

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", `${q} tutorial explained`);
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "5");
    url.searchParams.set("relevanceLanguage", "en");
    url.searchParams.set("safeSearch", "strict");
    url.searchParams.set("key", process.env.YOUTUBE_API_KEY);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok) return res.status(500).json({ error: data.error?.message || "YouTube API error" });

    const videos = data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium.url,
      description: item.snippet.description
    }));
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
