export default async function handler(req, res) {
  // ✅ 너의 GitHub Pages 주소로 바꿔줘 (끝 / 포함)
  const ALLOWED_ORIGIN = "https://kangyunjeong210.github.io";

  const origin = req.headers.origin || "";
  if (origin.startsWith(ALLOWED_ORIGIN)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "prompt is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY on server" });
    }

    // Gemini API 호출 (v1beta, gemini-pro)
    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await r.json();

    // Gemini가 에러를 주는 경우
    if (!r.ok) {
      return res.status(500).json({
        error: "Gemini request failed",
        detail: data,
      });
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "생성 결과가 없습니다.";

    return res.status(200).json({ text });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "generation failed" });
  }
}