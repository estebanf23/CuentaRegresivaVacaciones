/* =========================================================
   MAGIC WAND CURSOR TRAIL
   Estela de partículas de colores que sigue el cursor.
   Se omite automáticamente en dispositivos táctiles.
   ========================================================= */
(function () {
  'use strict';

  // Omitir en dispositivos sin puntero (táctiles puros)
  if (window.matchMedia('(hover: none)').matches) return;

  /* -------------------------------------------------------
     Canvas superpuesto — toda la pantalla, no interactivo
     ------------------------------------------------------- */
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = [
    'position:fixed',
    'inset:0',
    'width:100%',
    'height:100%',
    'pointer-events:none',
    'z-index:99999'
  ].join(';');
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* -------------------------------------------------------
     Paleta de colores mágicos
     ------------------------------------------------------- */
  const COLORS = [
    '#ffd700', // dorado
    '#ff00aa', // rosa neón
    '#00f5ff', // cian neón
    '#bf00ff', // violeta neón
    '#ff6a00', // naranja
    '#00ff88', // verde neón
    '#ff3355', // rojo neón
    '#ffffff'  // blanco brillante
  ];

  /* -------------------------------------------------------
     Pool de partículas
     ------------------------------------------------------- */
  let particles = [];

  /* -------------------------------------------------------
     Dibujar estrella de 5 puntas
     ------------------------------------------------------- */
  function drawStar(cx, cy, r, angle) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const outerA = angle + (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const innerA = outerA + Math.PI / 5;
      const px = cx + Math.cos(outerA) * r;
      const py = cy + Math.sin(outerA) * r;
      if (i === 0) ctx.moveTo(px, py);
      else         ctx.lineTo(px, py);
      ctx.lineTo(
        cx + Math.cos(innerA) * r * 0.42,
        cy + Math.sin(innerA) * r * 0.42
      );
    }
    ctx.closePath();
  }

  /* -------------------------------------------------------
     Spawn de partículas en la posición del mouse
     ------------------------------------------------------- */
  document.addEventListener('mousemove', (e) => {
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.5 + 0.5;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      particles.push({
        x:      e.clientX,
        y:      e.clientY,
        vx:     Math.cos(angle) * speed,
        vy:     Math.sin(angle) * speed - 1.8, // impulso hacia arriba
        radius: Math.random() * 3.5 + 1,
        color,
        alpha:  0.9,
        decay:  Math.random() * 0.03 + 0.02,
        spin:   Math.random() * 0.3 - 0.15,
        angle:  Math.random() * Math.PI * 2,
        isStar: Math.random() < 0.35
      });
    }
  });

  /* -------------------------------------------------------
     Loop de animación
     ------------------------------------------------------- */
  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Eliminar partículas muertas
    particles = particles.filter(p => p.alpha > 0.02);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Física
      p.x     += p.vx;
      p.y     += p.vy;
      p.vy    += 0.07;   // gravedad suave
      p.alpha -= p.decay;
      p.angle += p.spin;

      const a = Math.max(0, p.alpha);

      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle   = p.color;
      ctx.shadowBlur  = p.radius * 4;
      ctx.shadowColor = p.color;

      if (p.isStar) {
        drawStar(p.x, p.y, p.radius * 1.5, p.angle);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      }

      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(tick);
  }

  tick();
})();
