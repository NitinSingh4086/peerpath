import { getGemini, requireAuth, setCors } from "../_helpers.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireAuth(req, res);
  if (!user) return;

  const { course_code, topic, body } = req.body;
  try {
    const gemini = getGemini();
    const result = await gemini.generateContent(
      `You are an academic tutor assistant helping university students find learning resources. Be specific and practical.

A University of Alberta student needs help with:
Course: ${course_code}
Topic: ${topic}
Their question: "${body}"

Suggest 5 highly specific learning resources. For each:
RESOURCE: [exact name]
WHY: [1 sentence why it helps]
LEVEL: Beginner / Intermediate / Advanced`
    );
    res.json({ content: result.response.text() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
