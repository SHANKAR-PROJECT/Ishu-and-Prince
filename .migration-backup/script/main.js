/* ════════════════════════════════════════════════
   Prince & Nitya — Scene Manager
   Pure JS, no dependencies except browser APIs
════════════════════════════════════════════════ */

// ── Canvas hearts background ──────────────────────
(function initCanvas() {
  var canvas = document.getElementById('hearts');
  var ctx    = canvas.getContext('2d');
  var W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function Particle() {
    this.x    = Math.random() * W;
    this.y    = H + 20;
    this.vy   = -(Math.random() * 0.7 + 0.3);
    this.vx   = (Math.random() - 0.5) * 0.4;
    this.size = Math.random() * 9 + 5;
    this.alpha= Math.random() * 0.25 + 0.05;
    this.col  = Math.random() > 0.5 ? '#e63946' : '#f4d03f';
  }

  function drawHeart(x, y, size, col, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle   = col;
    ctx.beginPath();
    var s = size / 8;
    ctx.moveTo(x, y + s);
    ctx.bezierCurveTo(x, y - s, x - size/2, y - size/2, x - size/2, y);
    ctx.bezierCurveTo(x - size/2, y + size * 0.4, x, y + size * 0.7, x, y + size * 0.7);
    ctx.bezierCurveTo(x, y + size * 0.7, x + size/2, y + size * 0.4, x + size/2, y);
    ctx.bezierCurveTo(x + size/2, y - size/2, x, y - s, x, y + s);
    ctx.fill();
    ctx.restore();
  }

  // seed with some particles
  for (var i = 0; i < 18; i++) {
    var p = new Particle();
    p.y = Math.random() * H;
    particles.push(p);
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    if (particles.length < 25) particles.push(new Particle());
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      drawHeart(p.x, p.y, p.size, p.col, p.alpha);
      if (p.y < -30) particles.splice(i, 1);
    }
    requestAnimationFrame(tick);
  }
  tick();
})();


// ── Scene Data ────────────────────────────────────
var SCENES = [
  // id,       duration (ms), special setup fn name
  { id: 'sc1',  dur: 3200,  setup: null },
  { id: 'sc2',  dur: 5000,  setup: null },
  { id: 'sc3',  dur: 3800,  setup: null },
  { id: 'sc4',  dur: 6500,  setup: 'typewriter' },
  { id: 'sc5',  dur: 7000,  setup: 'shayriLines' },
  { id: 'sc6',  dur: 3200,  setup: null },
  { id: 'sc7',  dur: 3800,  setup: null },
  { id: 'sc7b', dur: 3800,  setup: null },
  { id: 'sc7c', dur: 3800,  setup: null },
  { id: 'sc8',  dur: 3800,  setup: null },
  { id: 'sc8b', dur: 3800,  setup: null },
  { id: 'sc8c', dur: 3800,  setup: null },
  { id: 'sc9',  dur: 6000,  setup: 'floatHearts' },
  { id: 'sc10', dur: 0,     setup: null },   // stays until replay
];

var currentIdx = -1;
var timer      = null;

function showScene(idx) {
  // hide previous
  if (currentIdx >= 0) {
    var prev = document.getElementById(SCENES[currentIdx].id);
    if (prev) prev.classList.remove('active');
  }
  currentIdx = idx;
  var s = SCENES[idx];
  var el = document.getElementById(s.id);
  if (!el) return;

  el.classList.add('active');

  // Run special setup
  if (s.setup && window['setup_' + s.setup]) {
    window['setup_' + s.setup]();
  }

  // Schedule next
  if (s.dur > 0) {
    timer = setTimeout(function() {
      if (idx < SCENES.length - 1) showScene(idx + 1);
    }, s.dur);
  }
}

function startShow() {
  if (timer) clearTimeout(timer);
  // Reset all scenes
  SCENES.forEach(function(s) {
    var el = document.getElementById(s.id);
    if (el) el.classList.remove('active');
  });
  currentIdx = -1;
  showScene(0);
}


// ── Special setup: Typewriter ─────────────────────
var typeMsg = 'Nitya... Jab se mili ho tum, laga jaise andheri raat mein chand nikal aaya. Tumhara hasna, tumhara gussa, tumhari har ada — sab mujhe pagal kar deta hai. Tum ho toh sab kuch hai... Tum nahi toh kuch bhi nahi.';
var typeTimer = null;

window.setup_typewriter = function() {
  var el     = document.getElementById('letterText');
  var cursor = document.getElementById('letterCursor');
  if (!el) return;
  el.textContent = '';
  cursor.classList.remove('hidden');
  var i = 0;
  if (typeTimer) clearInterval(typeTimer);
  typeTimer = setInterval(function() {
    if (i < typeMsg.length) {
      el.textContent += typeMsg[i++];
    } else {
      clearInterval(typeTimer);
      typeTimer = null;
      cursor.classList.add('hidden');
    }
  }, 38);
};


// ── Special setup: Shayri lines one by one ────────
var s5Timer = null;
var s5lines = ['s5l1','s5l2','s5l3','s5l4'];
var s5Delay = 1400;

window.setup_shayriLines = function() {
  s5lines.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove('show');
  });
  if (s5Timer) clearTimeout(s5Timer);
  s5lines.forEach(function(id, i) {
    s5Timer = setTimeout(function() {
      var el = document.getElementById(id);
      if (el) el.classList.add('show');
    }, 400 + i * s5Delay);
  });
};


// ── Special setup: Floating hearts in proposal ────
window.setup_floatHearts = function() {
  var container = document.getElementById('floatingHearts');
  if (!container) return;
  container.innerHTML = '';
  var emojis = ['❤️','💖','🌹','💕','💗','✨','💝'];
  for (var i = 0; i < 16; i++) {
    var h = document.createElement('div');
    h.className = 'fh';
    h.textContent = emojis[i % emojis.length];
    h.style.left             = (Math.random() * 100) + '%';
    h.style.animationDuration= (Math.random() * 4 + 4) + 's';
    h.style.animationDelay   = (Math.random() * 3) + 's';
    h.style.fontSize          = (Math.random() * 16 + 14) + 'px';
    container.appendChild(h);
  }
};


// ── Overlay button ────────────────────────────────
document.getElementById('startBtn').addEventListener('click', function() {
  // Try music
  try { document.getElementById('bgMusic').play(); } catch(e) {}

  // Hide overlay
  var ov = document.getElementById('overlay');
  ov.classList.add('hidden');

  // Start after overlay fade
  setTimeout(startShow, 500);
});


// ── Replay button ─────────────────────────────────
document.getElementById('replayBtn').addEventListener('click', function() {
  // Clear any running timers
  if (timer)    clearTimeout(timer);
  if (typeTimer) clearInterval(typeTimer);
  if (s5Timer)  clearTimeout(s5Timer);
  startShow();
});
