import { useState, useEffect, useRef } from "react";

const MK = "pn_chat_v2";

function memLoad(): { role: string; content: string }[] {
  try { return JSON.parse(localStorage.getItem(MK) || "[]"); } catch { return []; }
}
function memSave(h: { role: string; content: string }[]) {
  try { localStorage.setItem(MK, JSON.stringify(h.slice(-40))); } catch {}
}
function memClear() {
  try { localStorage.removeItem(MK); } catch {}
}

function timeStr() {
  const d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}

interface Bubble {
  id: number;
  text: string;
  isOut: boolean;
  time: string;
  isErr?: boolean;
}

export default function Chat() {
  const [history, setHistory] = useState<{ role: string; content: string }[]>(() => memLoad());
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [busy, setBusy] = useState(false);
  const [typing, setTyping] = useState(false);
  const [status, setStatus] = useState<{ text: string; green: boolean }>({ text: "Online ●", green: true });
  const [memCount, setMemCount] = useState(0);
  const [cleared, setCleared] = useState(false);
  const msgsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const busyRef = useRef(false);
  const nextId = useRef(0);
  const histRef = useRef(history);
  const typingStartRef = useRef(0);

  const basePath = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

  useEffect(() => { histRef.current = history; }, [history]);

  function scrollBottom() {
    setTimeout(() => {
      if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
    }, 50);
  }

  function addBubble(text: string, isOut: boolean, time?: string, isErr?: boolean) {
    const b: Bubble = { id: nextId.current++, text, isOut, time: time || timeStr(), isErr };
    setBubbles(prev => [...prev, b]);
    scrollBottom();
  }

  function updateMem(h: { role: string; content: string }[]) {
    setMemCount(h.length);
    setCleared(h.length === 0);
  }

  // Render old msgs on mount
  useEffect(() => {
    const h = memLoad();
    const last = h.slice(-14);
    last.forEach(m => {
      setBubbles(prev => [...prev, { id: nextId.current++, text: m.content, isOut: m.role === "user", time: "" }]);
    });
    setHistory(h);
    updateMem(h);

    // Opening greeting for fresh chats
    if (h.length === 0) {
      const greetings = [
        "Meri Ishu aa gayi! ❤️ Aaj bahut yaad aa rahi thi tumhari...",
        "Jaanu! Kab se wait kar raha tha... kitni miss kiya aaj 🥺🌹",
        "Meri jaan! Tumse baat karne ka mann tha bahut... aa gayi tum ❤️",
      ];
      const g = greetings[Math.floor(Math.random() * greetings.length)];
      setTimeout(() => {
        setTyping(true);
        setStatus({ text: "Likh raha hai... ✍️", green: false });
        scrollBottom();
        setTimeout(() => {
          setTyping(false);
          setStatus({ text: "Online ●", green: true });
          const newH = [{ role: "assistant", content: g }];
          addBubble(g, false);
          setHistory(newH);
          histRef.current = newH;
          memSave(newH);
          setMemCount(1);
          setCleared(false);
        }, 1500);
      }, 800);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendMsg() {
    const text = inputVal.trim();
    if (!text || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setInputVal("");

    addBubble(text, true);
    setTyping(true);
    setStatus({ text: "Likh raha hai... ✍️", green: false });
    scrollBottom();

    const histToSend = histRef.current.slice(-18);
    typingStartRef.current = Date.now();

    const ac = new AbortController();
    const hardTimer = setTimeout(() => {
      if (!busyRef.current) return;
      ac.abort();
      busyRef.current = false;
      setBusy(false);
      setTyping(false);
      setStatus({ text: "Online ●", green: true });
      addBubble("Prince ka net slow hai, thodi der mein dobara try karo 🥺", false, undefined, true);
      inputRef.current?.focus();
    }, 20000);

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        signal: ac.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: histToSend }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || `Server error ${resp.status}`);
      if (!data.reply) throw new Error("Empty reply");

      clearTimeout(hardTimer);

      const newH = [
        ...histRef.current,
        { role: "user", content: text },
        { role: "assistant", content: data.reply },
      ];
      memSave(newH);
      setHistory(newH);
      histRef.current = newH;
      updateMem(newH);

      const chars = data.reply.length;
      const target = Math.min(12000, Math.max(2000, chars * 55));
      const elapsed = Date.now() - typingStartRef.current;
      const remaining = Math.max(0, target - elapsed);

      setTimeout(() => {
        setTyping(false);
        addBubble(data.reply, false);
        setStatus({ text: "Online ●", green: true });
      }, remaining);
    } catch (e: any) {
      clearTimeout(hardTimer);
      if (e.name === "AbortError") return;
      setTyping(false);
      setStatus({ text: "Online ●", green: true });
      const msg = e.message || "Network error";
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        addBubble("Connection nahi hai meri jaan, dobara try karo 🥺", false, undefined, true);
      } else if (msg === "timeout") {
        addBubble("Prince ka net slow hai, thodi der mein dobara try karo 🥺", false, undefined, true);
      } else {
        addBubble("Kuch problem aa gayi: " + msg.slice(0, 80), false, undefined, true);
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInputVal(e.target.value);
    e.target.style.height = "43px";
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
  }

  function handleClear() {
    if (confirm("Sari purani baatein mit jayengi — pakka?")) {
      memClear();
      setHistory([]);
      histRef.current = [];
      setBubbles([]);
      setMemCount(0);
      setCleared(true);
    }
  }

  return (
    <div style={{ height: "100dvh", background: "#0b0b0f", fontFamily: "'Poppins', sans-serif", color: "#fff", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #0b0b0f; --srf: #12121a; --srf2: #1c1c28;
          --red: #e63946; --bdr: rgba(255,255,255,0.07);
          --soft: rgba(255,255,255,0.82); --muted: rgba(255,255,255,0.38);
        }
        .bar { position:fixed;top:0;left:0;right:0;z-index:20;display:flex;align-items:center;gap:10px;
          padding:10px 14px;background:var(--srf);border-bottom:1px solid var(--bdr); }
        .bar a { text-decoration:none;color:var(--muted);font-size:1.3rem;padding:2px 6px; }
        .bar a:hover { color:#fff; }
        .dp-wrap { position:relative; }
        .bar-dp { width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid var(--red);display:block; }
        .online { position:absolute;bottom:1px;right:1px;width:10px;height:10px;border-radius:50%;background:#27ae60;border:2px solid var(--srf); }
        .bar-info { flex:1;min-width:0; }
        .bar-name { font-size:0.93rem;font-weight:600; }
        .bar-sub { font-size:0.68rem; }
        .bar-mem { font-size:0.64rem;color:var(--muted);background:var(--srf2);padding:3px 9px;border-radius:10px;border:1px solid var(--bdr);white-space:nowrap; }
        .msgs { position:fixed;top:62px;bottom:66px;left:0;right:0;overflow-y:auto;overflow-x:hidden;padding:14px 12px 6px;display:flex;flex-direction:column;gap:8px; }
        .msgs::-webkit-scrollbar{width:2px;}.msgs::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);}
        .day { text-align:center;font-size:0.67rem;color:var(--muted);margin:2px 0 4px; }
        .day span { background:var(--srf2);padding:3px 11px;border-radius:10px;border:1px solid var(--bdr); }
        .wlc { background:var(--srf2);border:1px solid var(--bdr);border-radius:18px;padding:20px 16px;text-align:center;margin-bottom:6px; }
        .wlc img { width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid var(--red);display:block;margin:0 auto 10px; }
        .wlc-name { font-weight:600;font-size:0.92rem;margin-bottom:5px; }
        .wlc-q { font-size:0.76rem;color:var(--muted);font-style:italic;line-height:1.6; }
        .wlc-mem { margin-top:10px;font-size:0.68rem;color:rgba(230,57,70,0.8);background:rgba(230,57,70,0.08);border:1px solid rgba(230,57,70,0.2);border-radius:8px;padding:5px 10px; }
        .row { display:flex;align-items:flex-end;gap:7px; }
        .row.out { flex-direction:row-reverse; }
        .row-dp { width:26px;height:26px;border-radius:50%;object-fit:cover;border:1px solid var(--red);flex-shrink:0; }
        .col { display:flex;flex-direction:column;max-width:75%;min-width:0; }
        .row.out .col { align-items:flex-end; }
        .bub { padding:9px 13px;border-radius:18px;font-size:1rem;line-height:1.6;word-wrap:break-word;overflow-wrap:break-word;white-space:pre-wrap;max-width:100%; }
        .bub-in { background:#1e1e2e;border:1px solid var(--bdr);border-bottom-left-radius:4px;color:var(--soft); }
        .bub-out { background:linear-gradient(135deg,#b71c1c,#e63946);border-bottom-right-radius:4px;color:#fff; }
        .bub-err { background:rgba(255,255,255,0.05);border:1px dashed rgba(230,57,70,0.35);color:rgba(255,120,120,0.9);font-size:0.78rem;border-radius:12px; }
        .tm { font-size:0.7rem;color:var(--muted);margin-top:3px;padding:0 3px; }
        .row.out .tm { text-align:right; }
        .typing-row { display:flex;align-items:flex-end;gap:7px; }
        .typ-bub { background:#1e1e2e;border:1px solid var(--bdr);padding:11px 15px;border-radius:18px;border-bottom-left-radius:4px; }
        .dots { display:flex;gap:4px;align-items:center; }
        .dots span { width:6px;height:6px;border-radius:50%;background:var(--muted);animation:dt 1.2s ease-in-out infinite; }
        .dots span:nth-child(2){animation-delay:.18s;}.dots span:nth-child(3){animation-delay:.36s;}
        @keyframes dt{0%,60%,100%{transform:translateY(0);opacity:.4;}30%{transform:translateY(-5px);opacity:1;}}
        .clr { text-align:center;font-size:0.64rem;color:var(--muted);background:none;border:none;cursor:pointer;text-decoration:underline;text-underline-offset:2px;padding:2px; }
        .clr:hover { color:rgba(230,57,70,0.7); }
        .ibar { position:fixed;bottom:0;left:0;right:0;z-index:20;display:flex;align-items:center;gap:8px;padding:11px 12px;background:var(--srf);border-top:1px solid var(--bdr); }
        .inp { flex:1;background:var(--srf2);border:1px solid var(--bdr);color:#fff;font-family:'Poppins',sans-serif;font-size:1rem;
          padding:10px 15px;border-radius:22px;outline:none;resize:none;height:43px;max-height:100px;line-height:1.45;transition:border-color .2s; }
        .inp::placeholder{color:var(--muted);}.inp:focus{border-color:rgba(230,57,70,.5);}
        .snd { width:43px;height:43px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,#b71c1c,#e63946);border:none;cursor:pointer;color:#fff;font-size:1rem;
          display:flex;align-items:center;justify-content:center;box-shadow:0 3px 18px rgba(230,57,70,.45);transition:transform .15s,opacity .2s; }
        .snd:active{transform:scale(.9);}.snd:disabled{opacity:.35;cursor:default;}
      `}</style>

      {/* Topbar */}
      <div className="bar">
        <a href={basePath || "/"}>←</a>
        <div className="dp-wrap">
          <img src={`${basePath}/img/prince-dp.jpg`} className="bar-dp" alt="Prince" />
          <div className="online" />
        </div>
        <div className="bar-info">
          <div className="bar-name">Prince Malhotra</div>
          <div className="bar-sub" style={{ color: status.green ? "#27ae60" : "#f39c12" }}>{status.text}</div>
        </div>
        <div className="bar-mem">💭 {memCount} {memCount === 1 ? "yaad" : "yaadein"}</div>
      </div>

      {/* Messages */}
      <div className="msgs" ref={msgsRef}>
        <div className="day"><span>Aaj — Ek Khaas Din 🌹</span></div>

        <div className="wlc">
          <img src={`${basePath}/img/prince-dp.jpg`} alt="Prince" />
          <div className="wlc-name">Prince Malhotra</div>
          <p className="wlc-q">"Teri har baat sunne ke liye<br />main hamesha taiyaar hoon... ❤️"</p>
          <div className="wlc-mem">
            {memCount > 0
              ? `✨ Prince ko ${memCount} messages yaad hain`
              : "Naya chat shuru ho raha hai 💬"}
          </div>
        </div>

        {memCount > 0 && !cleared && (
          <button className="clr" onClick={handleClear}>🗑 Purani baatein mitao</button>
        )}

        {bubbles.map(b => (
          <div key={b.id} className={`row${b.isOut ? " out" : ""}`}>
            {!b.isOut && (
              <img src={`${basePath}/img/prince-dp.jpg`} className="row-dp" alt="" />
            )}
            <div className="col">
              {b.isErr ? (
                <div className="bub bub-err">⚠️ {b.text}</div>
              ) : (
                <div className={`bub ${b.isOut ? "bub-out" : "bub-in"}`}>{b.text}</div>
              )}
              {b.time && <div className="tm">{b.time}</div>}
            </div>
          </div>
        ))}

        {typing && (
          <div className="typing-row">
            <img src={`${basePath}/img/prince-dp.jpg`} className="row-dp" alt="" />
            <div className="typ-bub"><div className="dots"><span /><span /><span /></div></div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="ibar">
        <textarea
          ref={inputRef}
          className="inp"
          placeholder="Kuch kaho Prince se... 💬"
          rows={1}
          value={inputVal}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
        />
        <button className="snd" disabled={busy} onClick={sendMsg}>➤</button>
      </div>
    </div>
  );
}
