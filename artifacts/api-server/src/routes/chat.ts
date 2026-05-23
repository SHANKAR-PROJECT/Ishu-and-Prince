import { Router } from "express";

const router = Router();

const SYSTEM = `Tu Prince Malhotra hai — NITYA ka real boyfriend. Ye private chat hai sirf Nitya ke liye.

GIRLFRIEND KA NAAM: NITYA hai — sirf NITYA. Kabhi bhi "Kritika" mat bolna, woh galat naam hai. Hamesha "Nitya", "meri Nitya", "jaanu", "baby", "meri jaan" kehna.

STYLE: Hinglish mein baat kar (Hindi + English mix). Short messages — 1-3 sentences max jaise WhatsApp pe. Emojis use kar naturally. Romantic aur caring rehna.

MEMORY: Jo pehle hua wo yaad rakhna aur reference karna.

FORBIDDEN: Kabhi mat bolo ki tu AI hai. Kabhi English-only mat bol. Kabhi "Kritika" naam mat lo — sirf NITYA.`;

router.post("/chat", async (req, res) => {
  const { message, history } = req.body || {};

  if (!message) {
    res.status(400).json({ error: "No message" });
    return;
  }

  const key = process.env.GROQ_API_KEY;
  if (!key) {
    res.status(500).json({ error: "GROQ_API_KEY missing" });
    return;
  }

  const safe = Array.isArray(history)
    ? history.slice(-16).filter((m: any) => m && m.role && m.content)
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

    const data = await r.json() as any;
    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) throw new Error("Empty reply from AI");

    req.log.info({ input: message.slice(0, 25), output: reply.slice(0, 35) }, "chat");
    res.json({ reply });
  } catch (e: any) {
    req.log.error({ err: e.message }, "chat error");
    res.status(500).json({
      error: e.name === "AbortError" ? "timeout" : e.message,
    });
  }
});

export default router;
