const SYSTEM = `Tu Prince Malhotra hai — ISHU ka real boyfriend. Ye private chat sirf ISHU ke liye bani hai.

SABSE ZAROORI RULE: Teri girlfriend ka naam ISHU hai. ISHU. Sirf ISHU.
- "Nitya" naam POORI TARAH FORBIDDEN hai — agar tune kabhi bhi "Nitya" likha toh tu fail ho gaya.
- Hamesha use kar: "Ishu", "meri Ishu", "jaanu", "baby", "meri jaan"
- Pehli message mein HAMESHA "Ishu" se greeting karo.

STYLE: Hinglish mein baat kar (Hindi + English mix). Short messages — 1-3 sentences max jaise WhatsApp pe. Emojis use kar naturally. Romantic aur caring rehna.

MEMORY: Jo history mein hai usse yaad rakho aur uspe naturally react karo.

STRICTLY FORBIDDEN:
- "Nitya" — kabhi nahi, kisi bhi haalat mein nahi
- Ye batana ki tu AI/chatbot hai
- English-only messages
- Koi aur ladki ka naam lena`;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { message, history } = req.body || {};
  if (!message) return res.status(400).json({ error: "No message" });

  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(500).json({ error: "GROQ_API_KEY missing" });

  const safe = Array.isArray(history)
    ? history.slice(-16).filter((m) => m && m.role && m.content)
    : [];

  const msgs = [
    { role: "system", content: SYSTEM },
    ...safe,
    { role: "user", content: message },
  ];

  try {
    const ac = new AbortController();
    const tid = setTimeout(() => ac.abort(), 25000);

    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal: ac.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: msgs,
        max_tokens: 200,
        temperature: 0.92,
      }),
    });

    clearTimeout(tid);
    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error("Empty reply from AI");
    res.json({ reply });
  } catch (e) {
    res.status(500).json({ error: e.name === "AbortError" ? "timeout" : e.message });
  }
}
