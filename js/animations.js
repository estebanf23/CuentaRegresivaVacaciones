/* =========================================================
   ANIMATIONS — Starfield, Fireworks, Confetti, Particles
   ========================================================= */
(function () {
  'use strict';

  /* -------------------------------------------------------
     STARFIELD
     ------------------------------------------------------- */
  function buildStarfield() {
    const container = document.getElementById('starfield');
    if (!container) return;
    const count = window.innerWidth < 600 ? 120 : 220;
    for (let i = 0; i < count; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      const size = Math.random() * 2.5 + 0.5;
      s.style.cssText = [
        `width:${size}px`,
        `height:${size}px`,
        `top:${Math.random() * 100}%`,
        `left:${Math.random() * 100}%`,
        `--dur:${(Math.random() * 4 + 2).toFixed(1)}s`,
        `--delay:-${(Math.random() * 5).toFixed(1)}s`,
        `--max-opacity:${(Math.random() * 0.6 + 0.3).toFixed(2)}`
      ].join(';');
      container.appendChild(s);
    }
  }

  /* -------------------------------------------------------
     MAGIC PARTICLES (floating sparkles from the bottom)
     ------------------------------------------------------- */
  const PARTICLE_COLORS = ['#ffd700', '#ff00aa', '#00f5ff', '#bf00ff', '#ff6a00', '#fff'];

  function buildParticles() {
    const container = document.getElementById('park-scene');
    if (!container) return;
    const count = window.innerWidth < 600 ? 20 : 40;
    for (let i = 0; i < count; i++) spawnParticle(container);
  }

  function spawnParticle(container) {
    const p = document.createElement('div');
    p.className = 'magic-particle';
    const size = Math.random() * 5 + 2;
    const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
    p.style.cssText = [
      `width:${size}px`,
      `height:${size}px`,
      `background:${color}`,
      `box-shadow:0 0 ${size * 2}px ${color}`,
      `left:${Math.random() * 100}%`,
      `bottom:${Math.random() * 30}%`,
      `--dur:${(Math.random() * 8 + 5).toFixed(1)}s`,
      `--delay:-${(Math.random() * 10).toFixed(1)}s`
    ].join(';');
    container.appendChild(p);
  }

  /* -------------------------------------------------------
     AMBIENT FIREWORKS (light background — always running)
     ------------------------------------------------------- */
  const fwCanvas = document.getElementById('fireworks-canvas');
  const fwCtx    = fwCanvas ? fwCanvas.getContext('2d') : null;
  let fwParticles = [];
  let fwAnimId    = null;
  let fwActive    = false;

  function resizeFireworks() {
    if (!fwCanvas) return;
    fwCanvas.width  = window.innerWidth;
    fwCanvas.height = window.innerHeight;
  }

  const FW_COLORS = [
    '#ffd700','#ff00aa','#00f5ff','#bf00ff',
    '#ff6a00','#ffffff','#00ff88','#ff3355'
  ];

  function launchFirework(x, y, color, particleCount) {
    const c = color || FW_COLORS[Math.floor(Math.random() * FW_COLORS.length)];
    const n = particleCount || (Math.random() * 40 + 20 | 0);
    for (let i = 0; i < n; i++) {
      const angle  = (Math.PI * 2 * i) / n;
      const speed  = Math.random() * 4 + 1.5;
      fwParticles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: c,
        radius: Math.random() * 3 + 1,
        decay: Math.random() * 0.018 + 0.012,
        gravity: 0.06
      });
    }
  }

  function tickFireworks() {
    if (!fwCtx) return;
    fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
    fwParticles = fwParticles.filter(p => p.alpha > 0.01);
    fwParticles.forEach(p => {
      p.vy += p.gravity;
      p.x  += p.vx;
      p.y  += p.vy;
      p.alpha -= p.decay;
      fwCtx.save();
      fwCtx.globalAlpha = Math.max(0, p.alpha);
      fwCtx.beginPath();
      fwCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      fwCtx.fillStyle = p.color;
      fwCtx.shadowBlur = 8;
      fwCtx.shadowColor = p.color;
      fwCtx.fill();
      fwCtx.restore();
    });
    fwAnimId = requestAnimationFrame(tickFireworks);
  }

  /* Ambient — occasional small bursts */
  function scheduleAmbientFirework() {
    if (fwActive) return; // celebration mode takes over
    const delay = Math.random() * 4000 + 2000;
    setTimeout(() => {
      if (!fwActive) {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * (window.innerHeight * 0.5);
        launchFirework(x, y, null, 25);
      }
      scheduleAmbientFirework();
    }, delay);
  }

  /* -------------------------------------------------------
     CONFETTI (celebration mode)
     ------------------------------------------------------- */
  const confCanvas = document.getElementById('confetti-canvas');
  const confCtx    = confCanvas ? confCanvas.getContext('2d') : null;
  let confParticles = [];
  let confAnimId    = null;

  function resizeConfetti() {
    if (!confCanvas) return;
    confCanvas.width  = window.innerWidth;
    confCanvas.height = window.innerHeight;
  }

  const CONF_COLORS = [
    '#ffd700','#ff00aa','#00f5ff','#bf00ff',
    '#ff6a00','#ff3355','#00ff88','#ffffff'
  ];

  function launchConfetti(count) {
    for (let i = 0; i < count; i++) {
      confParticles.push({
        x:     Math.random() * window.innerWidth,
        y:     Math.random() * -window.innerHeight * 0.5 - 10,
        w:     Math.random() * 12 + 5,
        h:     Math.random() * 6 + 3,
        color: CONF_COLORS[Math.floor(Math.random() * CONF_COLORS.length)],
        vy:    Math.random() * 4 + 2,
        vx:    Math.random() * 4 - 2,
        angle: Math.random() * Math.PI * 2,
        spin:  Math.random() * 0.2 - 0.1,
        alpha: 1
      });
    }
  }

  function tickConfetti() {
    if (!confCtx) return;
    confCtx.clearRect(0, 0, confCanvas.width, confCanvas.height);
    confParticles = confParticles.filter(p => p.y < confCanvas.height + 20 && p.alpha > 0.05);
    confParticles.forEach(p => {
      p.y     += p.vy;
      p.x     += p.vx;
      p.angle += p.spin;
      p.vy    += 0.05; // gravity
      confCtx.save();
      confCtx.globalAlpha = p.alpha;
      confCtx.translate(p.x, p.y);
      confCtx.rotate(p.angle);
      confCtx.fillStyle = p.color;
      confCtx.shadowBlur = 6;
      confCtx.shadowColor = p.color;
      confCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      confCtx.restore();
    });
    confAnimId = requestAnimationFrame(tickConfetti);
  }

  /* -------------------------------------------------------
     CELEBRATION TRIGGER (called from countdown.js)
     ------------------------------------------------------- */
  window.triggerCelebration = function () {
    fwActive = true;

    // Burst of fireworks
    function burstFireworks() {
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          const x = Math.random() * window.innerWidth;
          const y = Math.random() * (window.innerHeight * 0.6);
          launchFirework(x, y, null, 60);
        }, i * 300);
      }
    }

    burstFireworks();
    setInterval(burstFireworks, 2000);

    // Confetti burst
    launchConfetti(250);
    setInterval(() => launchConfetti(80), 1200);

    // Show overlay
    const overlay = document.getElementById('celebration-overlay');
    if (overlay) overlay.classList.add('active');
  };

  /* -------------------------------------------------------
     INIT
     ------------------------------------------------------- */
  function init() {
    resizeFireworks();
    resizeConfetti();
    buildStarfield();
    buildParticles();
    tickFireworks();
    tickConfetti();
    scheduleAmbientFirework();

    window.addEventListener('resize', () => {
      resizeFireworks();
      resizeConfetti();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
