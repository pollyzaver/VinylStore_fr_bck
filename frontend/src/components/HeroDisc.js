import React, { useEffect, useRef } from 'react';
import '../styles/components/HeroDisc.css';

const BASE_DEG_PER_S = 9; // как раньше: оборот за 40 секунд
const RINGS = [360, 340, 320, 300, 280, 260, 240, 220, 200, 180];

// Диск героя: вращается сам, ускоряется при прокрутке, мягко тянется за курсором;
// вокруг расходятся кольца, а узор фона едет медленнее страницы.
const HeroDisc = () => {
  const move = useRef(null);
  const svg = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !move.current || !svg.current) return undefined;

    const hero = move.current.closest('.solco-hero');
    let angle = 0, extra = 0, target = 0, last = performance.now();
    let sy = window.scrollY, lastT = last;
    let px = 0, py = 0, tx = 0, ty = 0, drift = 0;
    let visible = true, raf = 0;

    const onScroll = () => {
      const now = performance.now();
      const dt = Math.max(16, now - lastT);
      const dy = Math.abs(window.scrollY - sy);
      target = Math.min(260, (dy / dt) * 1000 * 0.06);
      sy = window.scrollY; lastT = now;
    };
    const onMove = (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
    });
    io.observe(hero || move.current);

    function tick(now) {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      target *= Math.pow(0.04, dt);              // после остановки прокрутки скорость затухает
      extra += (target - extra) * Math.min(1, dt * 5);
      angle = (angle + (BASE_DEG_PER_S + extra) * dt) % 360;
      px += (tx - px) * Math.min(1, dt * 3);
      py += (ty - py) * Math.min(1, dt * 3);
      drift = (drift + 7 * dt) % 360;            // свет сам медленно ходит по диску
      move.current.style.setProperty('--ga', `${(30 + drift * 0.35 + px * 55 - py * 25 + extra * 0.4).toFixed(1)}deg`);
      svg.current.style.transform = `rotate(${angle.toFixed(2)}deg)`;
      move.current.style.transform = `translate3d(${(px * 14).toFixed(1)}px, ${(py * 10).toFixed(1)}px, 0)`;
      if (hero) {
        hero.style.setProperty('--py', `${Math.round(window.scrollY * 0.28)}px`);
        hero.style.setProperty('--px', `${(px * -10).toFixed(1)}px`);
      }
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onMove);
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="solco-hero__disc" aria-hidden="true">
      <div className="hdisc-move" ref={move}>
        <span className="hdisc-ripple" />
        <span className="hdisc-ripple" style={{ animationDelay: '-2.4s' }} />
        <span className="hdisc-ripple" style={{ animationDelay: '-4.8s' }} />
        <svg ref={svg} viewBox="0 0 800 800" className="solco-hero__svg hdisc-svg" focusable="false">
          <circle cx="400" cy="400" r="390" fill="#0b0302" stroke="#3a1d10" strokeWidth="2" />
          {RINGS.map((r, i) => (
            <circle key={r} cx="400" cy="400" r={r} fill="none" stroke={i % 3 === 1 ? '#3a1d10' : '#2a140b'} strokeWidth="2" />
          ))}
          <path d="M120 250A310 310 0 0 1 300 110" fill="none" stroke="#f3e9d2" strokeOpacity=".14" strokeWidth="10" strokeLinecap="round" />
          <path d="M680 550A310 310 0 0 1 500 690" fill="none" stroke="#f3e9d2" strokeOpacity=".14" strokeWidth="10" strokeLinecap="round" />
          <path d="M89.9 287.1A330 330 0 0 1 565 114.2" fill="none" stroke="#b3262d" strokeWidth="6" strokeLinecap="round" />
          <circle cx="400" cy="400" r="130" fill="#6a0d12" />
          <circle cx="400" cy="400" r="118" fill="none" stroke="#cf8b3e" strokeWidth="2" />
          <circle cx="400" cy="400" r="90" fill="none" stroke="#cf8b3e" strokeWidth="3" strokeDasharray="3 9" />
          <circle cx="400" cy="400" r="10" fill="#120503" />
        </svg>
        <span className="hdisc-gloss hdisc-gloss--a" />
        <span className="hdisc-gloss hdisc-gloss--c" />
        <span className="hdisc-gloss hdisc-gloss--b" />
      </div>
    </div>
  );
};

export default HeroDisc;
