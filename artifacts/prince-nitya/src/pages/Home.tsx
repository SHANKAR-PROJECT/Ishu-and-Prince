import { useEffect, useRef, useState } from "react";

const SCENES = [
  { id: "sc1",  dur: 3200,  setup: null },
  { id: "sc2",  dur: 5000,  setup: null },
  { id: "sc3",  dur: 3800,  setup: null },
  { id: "sc4",  dur: 6500,  setup: "typewriter" },
  { id: "sc5",  dur: 7000,  setup: "shayriLines" },
  { id: "sc6",  dur: 3200,  setup: null },
  { id: "sc7",  dur: 3800,  setup: null },
  { id: "sc7b", dur: 3800,  setup: null },
  { id: "sc7c", dur: 3800,  setup: null },
  { id: "sc8",  dur: 3800,  setup: null },
  { id: "sc8b", dur: 3800,  setup: null },
  { id: "sc8c", dur: 3800,  setup: null },
  { id: "sc8d", dur: 3800,  setup: null },
  { id: "sc9",  dur: 6000,  setup: "floatHearts" },
  { id: "sc10", dur: 0,     setup: null },
];

const TYPE_MSG = "Ishu... Jab se mili ho tum, laga jaise andheri raat mein chand nikal aaya. Tumhara hasna, tumhara gussa, tumhari har ada — sab mujhe pagal kar deta hai. Tum ho toh sab kuch hai... Tum nahi toh kuch bhi nahi.";

export default function Home() {
  const [overlayHidden, setOverlayHidden] = useState(false);
  const [activeScene, setActiveScene] = useState<string | null>(null);
  const [letterText, setLetterText] = useState("");
  const [cursorHidden, setCursorHidden] = useState(false);
  const [s5Shown, setS5Shown] = useState<string[]>([]);
  const [floatHearts, setFloatHearts] = useState<any[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const s5TimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentIdxRef = useRef(-1);

  // Canvas hearts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = 0, H = 0;
    const particles: any[] = [];

    function resize() {
      W = canvas!.width = window.innerWidth;
      H = canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function Particle(this: any) {
      this.x = Math.random() * W;
      this.y = H + 20;
      this.vy = -(Math.random() * 0.7 + 0.3);
      this.vx = (Math.random() - 0.5) * 0.4;
      this.size = Math.random() * 9 + 5;
      this.alpha = Math.random() * 0.25 + 0.05;
      this.col = Math.random() > 0.5 ? "#e63946" : "#f4d03f";
    }

    function drawHeart(x: number, y: number, size: number, col: string, alpha: number) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = col;
      ctx.beginPath();
      const s = size / 8;
      ctx.moveTo(x, y + s);
      ctx.bezierCurveTo(x, y - s, x - size / 2, y - size / 2, x - size / 2, y);
      ctx.bezierCurveTo(x - size / 2, y + size * 0.4, x, y + size * 0.7, x, y + size * 0.7);
      ctx.bezierCurveTo(x, y + size * 0.7, x + size / 2, y + size * 0.4, x + size / 2, y);
      ctx.bezierCurveTo(x + size / 2, y - size / 2, x, y - s, x, y + s);
      ctx.fill();
      ctx.restore();
    }

    for (let i = 0; i < 18; i++) {
      const p = new (Particle as any)();
      p.y = Math.random() * H;
      particles.push(p);
    }

    let raf: number;
    function tick() {
      ctx.clearRect(0, 0, W, H);
      if (particles.length < 25) particles.push(new (Particle as any)());
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        drawHeart(p.x, p.y, p.size, p.col, p.alpha);
        if (p.y < -30) particles.splice(i, 1);
      }
      raf = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  function setupTypewriter() {
    setLetterText("");
    setCursorHidden(false);
    if (typeTimerRef.current) clearInterval(typeTimerRef.current);
    let i = 0;
    typeTimerRef.current = setInterval(() => {
      if (i < TYPE_MSG.length) {
        setLetterText(TYPE_MSG.slice(0, ++i));
      } else {
        clearInterval(typeTimerRef.current!);
        typeTimerRef.current = null;
        setCursorHidden(true);
      }
    }, 38);
  }

  function setupShayriLines() {
    setS5Shown([]);
    if (s5TimerRef.current) clearTimeout(s5TimerRef.current);
    const ids = ["s5l1", "s5l2", "s5l3", "s5l4"];
    ids.forEach((id, i) => {
      s5TimerRef.current = setTimeout(() => {
        setS5Shown(prev => [...prev, id]);
      }, 400 + i * 1400);
    });
  }

  function setupFloatHearts() {
    const emojis = ["❤️", "💙", "🌹", "💕", "🩵", "✨", "💝", "🫧", "💖", "🌸"];
    const hearts = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      emoji: emojis[i % emojis.length],
      left: Math.random() * 100,
      duration: Math.random() * 4 + 4,
      delay: Math.random() * 3,
      fontSize: Math.random() * 16 + 14,
    }));
    setFloatHearts(hearts);
  }

  function showScene(idx: number) {
    currentIdxRef.current = idx;
    const s = SCENES[idx];
    setActiveScene(s.id);

    if (s.setup === "typewriter") setupTypewriter();
    else if (s.setup === "shayriLines") setupShayriLines();
    else if (s.setup === "floatHearts") setupFloatHearts();

    if (s.dur > 0) {
      timerRef.current = setTimeout(() => {
        if (idx < SCENES.length - 1) showScene(idx + 1);
      }, s.dur);
    }
  }

  function startShow() {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (typeTimerRef.current) clearInterval(typeTimerRef.current);
    if (s5TimerRef.current) clearTimeout(s5TimerRef.current);
    setActiveScene(null);
    setLetterText("");
    setCursorHidden(false);
    setS5Shown([]);
    setFloatHearts([]);
    currentIdxRef.current = -1;
    showScene(0);
  }

  function handleStart() {
    try { audioRef.current?.play(); } catch (e) {}
    setOverlayHidden(true);
    setTimeout(startShow, 500);
  }

  function handleReplay() {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (typeTimerRef.current) clearInterval(typeTimerRef.current);
    if (s5TimerRef.current) clearTimeout(s5TimerRef.current);
    startShow();
  }

  const basePath = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden", background: "#07090f", color: "#fff", fontFamily: "'Poppins', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Great+Vibes&family=Poppins:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #04111e; --red: #e63946; --red-deep: #9b1d20;
          --red-glow: rgba(230,57,70,0.45); --gold: #f4d03f;
          --sky: #87ceeb; --sky-deep: #4a9eca; --sky-glow: rgba(135,206,235,0.55);
          --white: #ffffff; --soft: rgba(255,255,255,0.80);
          --muted: rgba(255,255,255,0.40); --card-bg: rgba(255,255,255,0.04);
          --card-br: rgba(255,255,255,0.10);
          --ff-script: 'Great Vibes', cursive;
          --ff-serif: 'Cormorant Garamond', Georgia, serif;
          --ff-sans: 'Poppins', sans-serif;
        }
        html, body { width:100%; height:100%; background:var(--bg); overflow:hidden; }

        .overlay { position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;
          background:radial-gradient(ellipse at 50% 40%,#0d2a4a 0%,#071828 50%,#020d16 100%);
          transition:opacity 0.8s ease,visibility 0.8s ease; }
        .overlay.hidden { opacity:0;visibility:hidden;pointer-events:none; }
        .ov-box { text-align:center;padding:24px 20px; }
        .ov-ring { width:90px;height:90px;border-radius:50%;border:2px solid rgba(135,206,235,0.6);
          display:flex;align-items:center;justify-content:center;margin:0 auto 24px;
          animation:ringPulse 2s ease-in-out infinite;
          box-shadow:0 0 30px var(--sky-glow),inset 0 0 20px rgba(135,206,235,0.15); }
        @keyframes ringPulse { 0%,100%{transform:scale(1);box-shadow:0 0 30px var(--sky-glow);}50%{transform:scale(1.06);box-shadow:0 0 55px var(--sky-glow);} }
        .ov-heart-big { font-size:2.4rem;animation:hb 1.4s ease-in-out infinite; }
        @keyframes hb { 0%,100%{transform:scale(1);}30%{transform:scale(1.3);}60%{transform:scale(1);}80%{transform:scale(1.15);} }
        .ov-name { font-family:var(--ff-script);font-size:clamp(2.8rem,11vw,5.5rem);color:var(--white);
          line-height:1;letter-spacing:1px;text-shadow:0 0 40px var(--red-glow),0 0 80px rgba(230,57,70,0.2);margin-bottom:12px; }
        .ov-name em { color:var(--red);font-style:normal; }
        .ov-name .ishu-sky { color:var(--sky);text-shadow:0 0 40px var(--sky-glow),0 0 80px rgba(135,206,235,0.2);font-style:normal; }
        .ov-tagline { font-family:var(--ff-serif);font-size:clamp(1rem,3vw,1.3rem);color:var(--muted);font-style:italic;margin-bottom:36px;letter-spacing:1px; }
        .start-btn { display:inline-flex;align-items:center;gap:10px;background:linear-gradient(135deg,#9b1d20,#e63946);
          color:#fff;border:none;cursor:pointer;padding:16px 38px;font-family:var(--ff-sans);font-size:1.05rem;font-weight:500;
          border-radius:50px;letter-spacing:0.5px;box-shadow:0 4px 30px rgba(230,57,70,0.5),0 0 0 0 rgba(230,57,70,0.4);
          animation:btnGlow 2.5s ease-in-out infinite;transition:transform 0.2s; }
        .start-btn:active{transform:scale(0.96);}
        @keyframes btnGlow { 0%,100%{box-shadow:0 4px 30px rgba(230,57,70,0.5),0 0 0 0 rgba(230,57,70,0.4);}50%{box-shadow:0 4px 40px rgba(230,57,70,0.7),0 0 0 10px rgba(230,57,70,0);} }
        .ov-note { margin-top:18px;font-size:0.78rem;color:var(--muted);letter-spacing:0.5px; }

        #stage { position:fixed;inset:0;z-index:1; }
        .scene { position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:32px 20px;
          opacity:0;pointer-events:none;transition:opacity 0.7s ease; }
        .scene.active { opacity:1;pointer-events:auto; }
        .sc-inner { width:100%;max-width:680px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:14px; }

        #sc1  { background:radial-gradient(ellipse at 50% 40%,#0d2a4a 0%,#071828 50%,#020e1a 100%); }
        #sc2  { background:radial-gradient(ellipse at 50% 40%,#062038 0%,#0a1828 45%,#030c18 100%); }
        #sc3  { background:radial-gradient(ellipse at 50% 55%,#0a2035 0%,#071525 40%,#020c18 100%); }
        #sc4  { background:radial-gradient(ellipse at 50% 50%,#05152a 0%,#0a1a30 45%,#030e1e 100%); }
        #sc5  { background:radial-gradient(ellipse at 50% 45%,#3d0a10 0%,#0a1828 50%,#030c16 100%); }
        #sc6  { background:radial-gradient(ellipse at 50% 50%,#3d0a0f 0%,#071828 50%,#020d18 100%); }
        #sc7  { background:radial-gradient(ellipse at 50% 40%,#062035 0%,#0a1c30 45%,#030e1c 100%); }
        #sc7b { background:radial-gradient(ellipse at 50% 40%,#062035 0%,#0a1c30 45%,#030e1c 100%); }
        #sc7c { background:radial-gradient(ellipse at 50% 40%,#062035 0%,#0a1c30 45%,#030e1c 100%); }
        #sc8  { background:radial-gradient(ellipse at 50% 40%,#07203a 0%,#0a1c2e 45%,#030e1a 100%); }
        #sc8b { background:radial-gradient(ellipse at 50% 40%,#07203a 0%,#0a1c2e 45%,#030e1a 100%); }
        #sc8c { background:radial-gradient(ellipse at 50% 40%,#07203a 0%,#0a1c2e 45%,#030e1a 100%); }
        #sc8d { background:radial-gradient(ellipse at 50% 40%,#07203a 0%,#0a1c2e 45%,#030e1a 100%); }
        #sc9  { background:radial-gradient(ellipse at 50% 45%,#4a0510 0%,#071828 50%,#020d18 100%); }
        #sc10 { background:radial-gradient(ellipse at 50% 50%,#0a2038 0%,#071828 45%,#030d18 100%); }

        .reveal-up { opacity:0;transform:translateY(30px); }
        .reveal-scale { opacity:0;transform:scale(0.85); }
        .reveal-photo { opacity:0;transform:scale(0.8) rotateY(15deg); }
        .reveal-pop { opacity:0;transform:scale(0.3); }
        .scene.active .reveal-up { animation:fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards; }
        .scene.active .reveal-scale { animation:fadeScale 0.7s cubic-bezier(0.22,1,0.36,1) forwards; }
        .scene.active .reveal-photo { animation:fadePhoto 0.9s cubic-bezier(0.22,1,0.36,1) forwards; }
        .scene.active .reveal-pop { animation:popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        @keyframes fadeUp { to{opacity:1;transform:translateY(0);} }
        @keyframes fadeScale { to{opacity:1;transform:scale(1);} }
        @keyframes fadePhoto { to{opacity:1;transform:scale(1) rotateY(0deg);} }
        @keyframes popIn { to{opacity:1;transform:scale(1);} }
        .d1{animation-delay:0.15s;}.d2{animation-delay:0.45s;}.d3{animation-delay:0.75s;}.d4{animation-delay:1.05s;}.d5{animation-delay:1.35s;}

        .pre-title { font-family:var(--ff-serif);font-size:clamp(1rem,3.5vw,1.5rem);color:var(--muted);font-style:italic;letter-spacing:2px; }
        .big-title { font-family:var(--ff-script);font-size:clamp(3.5rem,16vw,8rem);line-height:0.9;color:var(--white); }
        .name-glow { color:var(--sky);text-shadow:0 0 40px var(--sky-glow),0 0 80px rgba(135,206,235,0.3);display:block; }
        .small-sub { font-family:var(--ff-serif);font-size:clamp(0.9rem,2.5vw,1.2rem);color:var(--muted);font-style:italic; }

        .shayri-card { background:linear-gradient(160deg,rgba(10,25,50,0.65) 0%,rgba(20,5,30,0.8) 100%);
          border:1px solid rgba(135,206,235,0.30);border-radius:24px;padding:44px 36px;backdrop-filter:blur(14px);
          box-shadow:0 20px 60px rgba(0,0,0,0.5),0 0 40px rgba(135,206,235,0.12),0 0 0 1px rgba(135,206,235,0.06) inset;
          display:flex;flex-direction:column;align-items:center;gap:4px;width:100%;max-width:560px; }
        .shayri-ornament { font-size:1.2rem;color:var(--sky);margin:8px 0;opacity:0.7; }
        .shayri-ornament.flip { transform:rotate(180deg); }
        .shayri-line { font-family:var(--ff-serif);font-size:clamp(1.1rem,3.5vw,1.55rem);line-height:1.9;font-style:italic;font-weight:600;
          background-clip:text;-webkit-background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 0 8px rgba(255,120,120,0.3)); }
        .sl1{background-image:linear-gradient(90deg,#87ceeb,#b8e8ff,#5bc8f5);}
        .sl2{background-image:linear-gradient(90deg,#ff9a9e,#fecfef,#ff6b9d);}
        .sl3{background-image:linear-gradient(90deg,#87ceeb,#e0c3fc,#5bc8f5);}
        .sl4{background-image:linear-gradient(90deg,#5bc8f5,#87ceeb,#b8e8ff);}
        .shayri-by { font-family:var(--ff-script);font-size:clamp(1.4rem,4vw,2rem);color:var(--sky);margin-top:12px; }

        .feeling { font-family:var(--ff-serif);font-size:clamp(1.1rem,3.5vw,1.7rem);font-style:italic;line-height:1.8;font-weight:600;
          background-clip:text;-webkit-background-clip:text;-webkit-text-fill-color:transparent; }
        .feeling.reveal-up.d1{background-image:linear-gradient(90deg,#87ceeb,#b8e8ff,#5bc8f5);}
        .feeling.reveal-up.d2{background-image:linear-gradient(90deg,#ff9a9e,#fecfef,#ff6b9d);}
        .feeling.reveal-up.d3{background-image:linear-gradient(90deg,#87ceeb,#e0c3fc,#5bc8f5);}
        .divider-rose { font-size:1.4rem;letter-spacing:12px;margin-top:8px;opacity:0.8; }

        .letter-wrap { background:var(--card-bg);border:1px solid var(--card-br);border-radius:20px;padding:28px 28px 20px;
          width:100%;max-width:560px;box-shadow:0 20px 60px rgba(0,0,0,0.4);text-align:left; }
        .letter-header { display:flex;align-items:center;gap:6px;padding-bottom:14px;border-bottom:1px solid var(--card-br);margin-bottom:18px; }
        .lh-dot { width:10px;height:10px;border-radius:50%; }
        .lh-dot:nth-child(1){background:#e63946;}.lh-dot:nth-child(2){background:#f4a261;}.lh-dot:nth-child(3){background:#2a9d8f;}
        .lh-name { margin-left:auto;font-size:0.78rem;color:var(--muted); }
        .letter-text { font-family:var(--ff-serif);font-size:clamp(0.95rem,2.5vw,1.15rem);color:var(--soft);line-height:1.9;min-height:80px; }
        .letter-cursor { display:inline-block;color:var(--red);font-weight:bold;animation:blink 0.8s step-start infinite; }
        .letter-cursor.hidden{display:none;}
        @keyframes blink{50%{opacity:0;}}
        .letter-send { display:block;text-align:right;font-size:0.75rem;color:var(--red);opacity:0.7;margin-top:12px; }

        .sc5-inner { gap:0; }
        .s5line { font-family:var(--ff-serif);font-size:clamp(1.1rem,3.8vw,1.8rem);font-style:italic;font-weight:600;line-height:2;
          opacity:0;transform:translateY(24px);transition:opacity 0.6s ease,transform 0.6s ease;
          background-clip:text;-webkit-background-clip:text;-webkit-text-fill-color:transparent; }
        .s5line.show{opacity:1;transform:translateY(0);}
        #s5l1{background-image:linear-gradient(90deg,#ff6b9d,#ff8e53,#ff6b9d);}
        #s5l2{background-image:linear-gradient(90deg,#ffd200,#f7971e,#ffd200);}
        #s5l3{background-image:linear-gradient(90deg,#e040fb,#ff6b9d,#ff8a65);}
        #s5l4{background-image:linear-gradient(90deg,#40c4ff,#7c4dff,#e040fb);}

        .big-words-pre { font-family:var(--ff-script);font-size:clamp(2rem,7vw,3.5rem);color:var(--muted);margin-bottom:8px; }
        .big-words { display:flex;flex-wrap:wrap;gap:12px;justify-content:center; }
        .bw { font-family:var(--ff-serif);font-size:clamp(2.2rem,9vw,5.5rem);font-weight:700;
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;display:inline-block;
          animation:bwShimmer 3s ease-in-out infinite alternate; }
        .bw:nth-child(1){background:linear-gradient(135deg,#ff9a9e,#ff6b9d,#e63946);filter:drop-shadow(0 0 20px rgba(255,107,157,0.6));}
        .bw:nth-child(2){background:linear-gradient(135deg,#ffd200,#f7971e,#ff6b9d);filter:drop-shadow(0 0 20px rgba(247,151,30,0.6));}
        .bw:nth-child(3){background:linear-gradient(135deg,#a18cd1,#fbc2eb,#ff9a9e);filter:drop-shadow(0 0 20px rgba(161,140,209,0.6));}
        .bw:nth-child(4){background:linear-gradient(135deg,#e63946,#ff8e53,#ffd200);filter:drop-shadow(0 0 20px rgba(230,57,70,0.7));}
        @keyframes bwShimmer{from{opacity:0.85;}to{opacity:1;}}

        .photo-frame { width:100%;max-width:min(640px,92vw);border-radius:20px;overflow:hidden;
          border:2px solid rgba(135,206,235,0.55);
          box-shadow:0 0 0 1px rgba(255,255,255,0.05) inset,0 0 60px rgba(135,206,235,0.20),0 0 30px rgba(230,57,70,0.15),0 24px 60px rgba(0,0,0,0.7); }
        .photo-img { width:100%;height:auto;max-height:66vh;object-fit:contain;display:block;background:#0a0a0a; }
        .photo-caption { font-family:var(--ff-script);font-size:clamp(1.3rem,4vw,2rem);color:var(--sky);text-shadow:0 0 20px var(--sky-glow);margin-top:6px; }

        .floating-hearts { position:absolute;inset:0;pointer-events:none;overflow:hidden; }
        .fh { position:absolute;bottom:-10%;opacity:0;animation:floatHeart linear infinite; }
        @keyframes floatHeart{0%{opacity:0;transform:translateY(0) scale(0.8);}10%{opacity:0.8;}90%{opacity:0.4;}100%{opacity:0;transform:translateY(-110vh) scale(1.2);}}
        .proposal-pre { font-family:var(--ff-script);font-size:clamp(2rem,7vw,3.5rem);color:var(--muted); }
        .proposal-text { font-family:var(--ff-serif);font-size:clamp(1.8rem,7vw,4rem);font-weight:700;color:var(--white);line-height:1.2; }
        .proposal-text span { color:var(--sky);text-shadow:0 0 30px var(--sky-glow); }
        .proposal-ring { font-size:3.5rem;animation:spinRing 3s ease-in-out infinite; }
        @keyframes spinRing{0%,100%{transform:rotate(-15deg) scale(1);}50%{transform:rotate(15deg) scale(1.15);}}
        .proposal-sub { font-family:var(--ff-serif);font-size:clamp(1rem,3.5vw,1.5rem);color:var(--muted);font-style:italic; }

        .final-shayri { font-family:var(--ff-serif);font-size:clamp(1.1rem,3.5vw,1.7rem);font-style:italic;line-height:2;text-align:center;font-weight:600; }
        .final-shayri p:nth-child(1){background:linear-gradient(90deg,#87ceeb,#b8e8ff,#5bc8f5);background-clip:text;-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .final-shayri p:nth-child(2){background:linear-gradient(90deg,#ff9a9e,#fecfef,#ff6b9d);background-clip:text;-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .final-sign { font-family:var(--ff-script);font-size:clamp(1.6rem,5vw,2.5rem);color:var(--sky);text-shadow:0 0 20px var(--sky-glow); }
        .replay-btn { background:transparent;border:1px solid rgba(255,255,255,0.2);color:var(--muted);padding:10px 28px;
          border-radius:30px;font-family:var(--ff-sans);font-size:0.88rem;cursor:pointer;letter-spacing:0.5px;
          transition:all 0.3s ease;margin-top:8px; }
        .replay-btn:hover,.replay-btn:active{border-color:var(--red);color:var(--red);background:rgba(230,57,70,0.08);}
        .chat-cta { display:inline-flex;align-items:center;gap:10px;background:linear-gradient(135deg,#0d1a2e,#1a1a2e);
          border:1px solid rgba(135,206,235,0.5);color:var(--white);text-decoration:none;padding:12px 26px;border-radius:50px;
          font-family:var(--ff-sans);font-size:0.9rem;font-weight:500;letter-spacing:0.3px;margin-top:4px;
          box-shadow:0 4px 24px rgba(230,57,70,0.25);transition:all 0.3s ease; }
        .chat-cta:hover,.chat-cta:active{background:linear-gradient(135deg,#1a2a3e,#2a2a3e);border-color:var(--sky);box-shadow:0 4px 32px var(--sky-glow);transform:translateY(-1px);}
        .chat-cta-dp { width:28px;height:28px;border-radius:50%;object-fit:cover;border:1px solid var(--sky); }
      `}</style>

      <canvas ref={canvasRef} id="hearts" style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />

      <audio ref={audioRef} id="bgMusic" src="https://media.vocaroo.com/mp3/1jHrq2CGxZAW" loop preload="none" />

      {/* Overlay */}
      <div className={`overlay${overlayHidden ? " hidden" : ""}`} style={{ zIndex: 100 }}>
        <div className="ov-box">
          <div className="ov-ring"><div className="ov-heart-big">❤️</div></div>
          <h1 className="ov-name">Prince <em>&amp;</em> <span className="ishu-sky">Ishu</span></h1>
          <p className="ov-tagline">Ek dil ki ek khaas baat...</p>
          <button className="start-btn" onClick={handleStart}>
            <span style={{ fontSize: "1.2rem" }}>💌</span>
            <span>Shuru Karo</span>
          </button>
          <p className="ov-note">tap karo aur dekho jaadu ✨</p>
        </div>
      </div>

      {/* Stage */}
      <div id="stage" style={{ position: "fixed", inset: 0, zIndex: 1 }}>

        {/* SC1 */}
        <div className={`scene${activeScene === "sc1" ? " active" : ""}`} id="sc1">
          <div className="sc-inner">
            <p className="pre-title reveal-up d1">Dil ke kisi kone se...</p>
            <h2 className="big-title reveal-up d2">Meri<br /><span className="name-glow">Ishu</span></h2>
            <p className="small-sub reveal-up d3">tumhare liye yeh khaas lamha hai 🌹</p>
          </div>
        </div>

        {/* SC2 */}
        <div className={`scene${activeScene === "sc2" ? " active" : ""}`} id="sc2">
          <div className="sc-inner">
            <div className="shayri-card reveal-scale">
              <div className="shayri-ornament">✦</div>
              <p className="shayri-line sl1 reveal-up d1">"Tum kali ho andheron ki,</p>
              <p className="shayri-line sl2 reveal-up d2"> Laal gulab sa rang tumhara,</p>
              <p className="shayri-line sl3 reveal-up d3"> Koi nahi is duniya mein,</p>
              <p className="shayri-line sl4 reveal-up d4"> Jo ho jaaye tum sa pyara..."</p>
              <div className="shayri-ornament flip">✦</div>
              <p className="shayri-by reveal-up d5">— Prince Malhotra 🖤</p>
            </div>
          </div>
        </div>

        {/* SC3 */}
        <div className={`scene${activeScene === "sc3" ? " active" : ""}`} id="sc3">
          <div className="sc-inner">
            <p className="feeling reveal-up d1">Socha tha kab tha koi aisa aayega...</p>
            <p className="feeling reveal-up d2">Jo meri duniya roshan kar jayega...</p>
            <p className="feeling reveal-up d3">Tum aayi aur meri zindagi badal gayi.</p>
            <div className="divider-rose reveal-up d4">🌹 🌹 🌹</div>
          </div>
        </div>

        {/* SC4 */}
        <div className={`scene${activeScene === "sc4" ? " active" : ""}`} id="sc4">
          <div className="sc-inner">
            <div className="letter-wrap reveal-scale">
              <div className="letter-header">
                <span className="lh-dot" /><span className="lh-dot" /><span className="lh-dot" />
                <span className="lh-name">💬 Prince</span>
              </div>
              <p className="letter-text">{letterText}<span className={`letter-cursor${cursorHidden ? " hidden" : ""}`}>|</span></p>
              <span className="letter-send">✔✔</span>
            </div>
          </div>
        </div>

        {/* SC5 */}
        <div className={`scene${activeScene === "sc5" ? " active" : ""}`} id="sc5">
          <div className="sc-inner sc5-inner">
            <p className={`s5line${s5Shown.includes("s5l1") ? " show" : ""}`} id="s5l1">❝ Mohabbat karna seekha tumse...</p>
            <p className={`s5line${s5Shown.includes("s5l2") ? " show" : ""}`} id="s5l2">Dard bhi tumse hi sehna seekha...</p>
            <p className={`s5line${s5Shown.includes("s5l3") ? " show" : ""}`} id="s5l3">Har subah tera chehra yaad aata hai,</p>
            <p className={`s5line${s5Shown.includes("s5l4") ? " show" : ""}`} id="s5l4">Har raat tere sapne lekar sota hoon... ❞</p>
          </div>
        </div>

        {/* SC6 */}
        <div className={`scene${activeScene === "sc6" ? " active" : ""}`} id="sc6">
          <div className="sc-inner">
            <p className="big-words-pre reveal-up d1">Ishu,</p>
            <div className="big-words">
              <span className="bw reveal-pop d1">Tum</span>
              <span className="bw reveal-pop d2">Ho</span>
              <span className="bw reveal-pop d3">Meri</span>
              <span className="bw reveal-pop d4">Duniya</span>
            </div>
          </div>
        </div>

        {/* SC7 */}
        <div className={`scene${activeScene === "sc7" ? " active" : ""}`} id="sc7">
          <div className="sc-inner">
            <div className="photo-frame reveal-photo">
              <img src={`${basePath}/img/photo-1.jpg`} alt="Prince & Ishu" className="photo-img" />
            </div>
            <p className="photo-caption reveal-up d3">Yeh pal, yeh khwab — sab tumhara hai 🌹</p>
          </div>
        </div>

        {/* SC7b */}
        <div className={`scene${activeScene === "sc7b" ? " active" : ""}`} id="sc7b">
          <div className="sc-inner">
            <div className="photo-frame reveal-photo">
              <img src={`${basePath}/img/photo-2.jpg`} alt="Prince & Ishu" className="photo-img" />
            </div>
            <p className="photo-caption reveal-up d3">Tum ho toh har raat khoobsurat lagti hai 🕯️</p>
          </div>
        </div>

        {/* SC7c */}
        <div className={`scene${activeScene === "sc7c" ? " active" : ""}`} id="sc7c">
          <div className="sc-inner">
            <div className="photo-frame reveal-photo">
              <img src={`${basePath}/img/photo-3.jpg`} alt="Prince & Ishu" className="photo-img" />
            </div>
            <p className="photo-caption reveal-up d3">Sirf teri aankhon mein doobna chahta hoon 💫</p>
          </div>
        </div>

        {/* SC8 */}
        <div className={`scene${activeScene === "sc8" ? " active" : ""}`} id="sc8">
          <div className="sc-inner">
            <div className="photo-frame reveal-photo">
              <img src={`${basePath}/img/photo-4.jpg`} alt="Prince & Ishu" className="photo-img" />
            </div>
            <p className="photo-caption reveal-up d3">Prince Weds Ishu — Hamesha ke liye 💍</p>
          </div>
        </div>

        {/* SC8b */}
        <div className={`scene${activeScene === "sc8b" ? " active" : ""}`} id="sc8b">
          <div className="sc-inner">
            <div className="photo-frame reveal-photo">
              <img src={`${basePath}/img/photo-5.jpg`} alt="Prince & Ishu" className="photo-img" />
            </div>
            <p className="photo-caption reveal-up d3">Tere bina yeh duniya adhoori hai meri 💖</p>
          </div>
        </div>

        {/* SC8c */}
        <div className={`scene${activeScene === "sc8c" ? " active" : ""}`} id="sc8c">
          <div className="sc-inner">
            <div className="photo-frame reveal-photo">
              <img src={`${basePath}/img/photo-6.jpg`} alt="Prince & Ishu" className="photo-img" />
            </div>
            <p className="photo-caption reveal-up d3">Yeh gulab teri tarah hi pyara hai 🌹</p>
          </div>
        </div>

        {/* SC8d */}
        <div className={`scene${activeScene === "sc8d" ? " active" : ""}`} id="sc8d">
          <div className="sc-inner">
            <div className="photo-frame reveal-photo">
              <img src={`${basePath}/img/photo-7.jpg`} alt="Prince & Ishu" className="photo-img" />
            </div>
            <p className="photo-caption reveal-up d3">Love you so much, meri Ishu 💝</p>
          </div>
        </div>

        {/* SC9 */}
        <div className={`scene${activeScene === "sc9" ? " active" : ""}`} id="sc9">
          <div className="sc-inner" style={{ position: "relative" }}>
            <div className="floating-hearts">
              {floatHearts.map(h => (
                <div key={h.id} className="fh" style={{ left: `${h.left}%`, animationDuration: `${h.duration}s`, animationDelay: `${h.delay}s`, fontSize: `${h.fontSize}px` }}>
                  {h.emoji}
                </div>
              ))}
            </div>
            <p className="proposal-pre reveal-up d1">Ishu,</p>
            <h2 className="proposal-text reveal-up d2">Kya tum mujhse<br /><span>Shaadi Karogi?</span></h2>
            <p className="proposal-ring reveal-pop d3">💍</p>
            <p className="proposal-sub reveal-up d4">Mere saath har zindagi bitaogi?</p>
          </div>
        </div>

        {/* SC10 */}
        <div className={`scene${activeScene === "sc10" ? " active" : ""}`} id="sc10">
          <div className="sc-inner">
            <div className="final-shayri reveal-up d1">
              <p>❝ Tum bin adhoori hai yeh zindagi meri,</p>
              <p>Tum ho toh hai duniya puri meri. ❞</p>
            </div>
            <p className="final-sign reveal-up d2">— Tumhara Prince Malhotra 🖤🌹</p>
            <button className="replay-btn reveal-up d3" onClick={handleReplay}>↺ Phir se dekhna hai</button>
            <a href={`${basePath}/chat`} className="chat-cta reveal-up d4">
              <img src={`${basePath}/img/prince-dp.jpg`} className="chat-cta-dp" alt="Prince" />
              <span>Prince se baat karo 💬</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
