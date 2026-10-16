import React, { useEffect, useRef } from 'react';

// Живой фон теста: россыпь светящихся точек с тонкими связями. Точки отталкиваются
// от курсора, а на каждый ответ от диска расходятся круги, как звук от иглы.
// Рисуется в canvas под страницей, на кликабельность не влияет.
const TasteBg = ({ pulse = 0, progress = 0, discSelector = '.tz-tilt' }) => {
  const cv = useRef(null);
  const state = useRef({ pulse: 0, progress: 0, rings: [], pts: [], mouse: { x: -999, y: -999 } });
  state.current.progress = progress;

  useEffect(() => {
    const s = state.current;
    if (pulse > s.pulse) {
      const el = document.querySelector(discSelector);
      const r = el ? el.getBoundingClientRect() : null;
      s.rings.push({ t: 0, x: r ? r.left + r.width / 2 : innerWidth / 2, y: r ? r.top + r.height / 2 : innerHeight / 2, r0: r ? r.width / 2 : 200 });
      s.kick = r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
    }
    s.pulse = pulse;
  }, [pulse, discSelector]);

  useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const c = cv.current;
    if (!c || reduce) return undefined;
    const g = c.getContext('2d');
    const s = state.current;
    let w = 0, h = 0, raf = 0, last = performance.now();
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const size = () => {
      w = innerWidth; h = innerHeight;
      c.width = w * dpr; c.height = h * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = w < 700 ? 38 : 80;
      s.pts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
        r: 1 + Math.random() * 1.8, hot: Math.random() < 0.22,
      }));
    };
    size();

    const move = (e) => { s.mouse.x = e.clientX; s.mouse.y = e.clientY; };
    const leave = () => { s.mouse.x = -999; s.mouse.y = -999; };
    window.addEventListener('resize', size);
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);

    const frame = (now) => {
      const dt = Math.min(40, now - last) / 16.7; last = now;
      g.clearRect(0, 0, w, h);
      const { pts, mouse, rings } = s;
      const boost = 1 + s.progress * 0.9;

      if (s.kick) {
        pts.forEach(p => {
          const dx = p.x - s.kick.x, dy = p.y - s.kick.y, d = Math.hypot(dx, dy) || 1;
          p.vx += (dx / d) * 1.6; p.vy += (dy / d) * 1.6;
        });
        s.kick = null;
      }

      for (const p of pts) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 150) { const f = (1 - d / 150) * 0.9; p.vx += (dx / (d || 1)) * f; p.vy += (dy / (d || 1)) * f; }
        p.vx *= 0.965; p.vy *= 0.965;
        p.x += (p.vx + (p.hot ? 0.05 : 0)) * dt * boost; p.y += p.vy * dt * boost;
        if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;
      }

      g.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 120) { g.strokeStyle = `rgba(207,139,62,${(1 - d / 120) * 0.22})`; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
        }
        const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (dm < 170) { g.strokeStyle = `rgba(243,233,210,${(1 - dm / 170) * 0.35})`; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(mouse.x, mouse.y); g.stroke(); }
      }
      for (const p of pts) {
        g.fillStyle = p.hot ? 'rgba(179,38,45,.85)' : 'rgba(207,139,62,.7)';
        g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.2832); g.fill();
      }

      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i]; r.t += dt / 90;
        if (r.t >= 1) { rings.splice(i, 1); continue; }
        const e = 1 - Math.pow(1 - r.t, 3);
        g.strokeStyle = `rgba(207,139,62,${(1 - r.t) * 0.45})`; g.lineWidth = 2 - r.t;
        g.beginPath(); g.arc(r.x, r.y, r.r0 + e * 520, 0, 6.2832); g.stroke();
        g.strokeStyle = `rgba(179,38,45,${(1 - r.t) * 0.3})`;
        g.beginPath(); g.arc(r.x, r.y, r.r0 + e * 340, 0, 6.2832); g.stroke();
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    const vis = () => { if (document.hidden) { cancelAnimationFrame(raf); } else { last = performance.now(); raf = requestAnimationFrame(frame); } };
    document.addEventListener('visibilitychange', vis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', size);
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      document.removeEventListener('visibilitychange', vis);
    };
  }, []);

  return <canvas ref={cv} className="tz-bg" aria-hidden="true" />;
};

export default TasteBg;
