const { getGemini, requireAuth, setCors } = require("../_helpers");

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
      `You are an academic tutor assistant helping university students find learning resources. Always be specific, practical, and encouraging.

A University of Alberta student needs help with:
Course: ${course_code}
Topic: ${topic}
Their question: "${body}"

Suggest 5 highly specific learning resources. For each resource:
- Give the exact resource name (book chapter, website, video title)
- Explain in 1 sentence WHY it helps for this specific question
- Rate difficulty: Beginner / Intermediate / Advanced

Format each as:
RESOURCE: [name]
WHY: [reason]
LEVEL: [difficulty]

Be specific. No generic suggestions like "Khan Academy" without naming the exact video/topic.`
    );
    res.json({ content: result.response.text() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
