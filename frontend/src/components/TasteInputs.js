import React, { useRef, useState } from 'react';

// Ручка громкости: ползунок + вращающаяся ручка
export function VolumeInput({ value, onChange, ui }) {
  const v = value === undefined ? 5 : value;
  const angle = -135 + (v / 10) * 270;
  return (
    <div className="tz-vol">
      <svg viewBox="0 0 120 120" className="tz-knob" aria-hidden="true">
        {Array.from({ length: 21 }, (_, i) => {
          const a = (-135 + i * 13.5 - 90) * Math.PI / 180;
          const on = i / 20 * 10 <= v;
          return <line key={i} x1={60 + 50 * Math.cos(a)} y1={60 + 50 * Math.sin(a)} x2={60 + 56 * Math.cos(a)} y2={60 + 56 * Math.sin(a)} stroke={on ? '#cf8b3e' : '#3a1d10'} strokeWidth="2.4" strokeLinecap="round" />;
        })}
        <circle cx="60" cy="60" r="40" fill="#1e0c07" stroke="#3a1d10" strokeWidth="2" />
        <g transform={`rotate(${angle} 60 60)`}><line x1="60" y1="60" x2="60" y2="28" stroke="#f3e9d2" strokeWidth="4" strokeLinecap="round" /></g>
        <circle cx="60" cy="60" r="6" fill="#6a0d12" />
      </svg>
      <input className="tz-range" type="range" min="0" max="10" step="0.1" value={v} aria-label="Громкость"
        onChange={e => onChange(Number(e.target.value))} />
      <div className="tz-range-l"><span>{ui.left}</span><span>{ui.right}</span></div>
    </div>
  );
}

// Постукивание: четыре и больше ударов дают темп
export function TapInput({ value, onResult, onBeat, ui }) {
  const taps = useRef([]);
  const [count, setCount] = useState(0);
  const [hit, setHit] = useState(false);
  const tap = () => {
    const now = performance.now();
    const t = taps.current;
    if (t.length && now - t[t.length - 1] > 2500) t.length = 0;
    t.push(now);
    setCount(t.length);
    setHit(true); setTimeout(() => setHit(false), 130);
    if (onBeat) onBeat();
    if (t.length >= 4) {
      const iv = t.slice(1).map((x, i) => x - t[i]).sort((a, b) => a - b);
      const bpm = Math.round(60000 / iv[Math.floor(iv.length / 2)]);
      onResult(Math.min(220, Math.max(40, bpm)));
    }
  };
  const reset = () => { taps.current = []; setCount(0); onResult(undefined); };
  return (
    <div className="tz-tap">
      <button className={`tz-tap-btn ${hit ? 'hit' : ''}`} onClick={tap} aria-label="Стучать в ритм">
        <span>{value ? value : count || '♪'}</span>
        <small>{value ? 'уд/мин' : 'стук'}</small>
      </button>
      <p className="tz-hint">{value ? 'Записали ритм. Можно стукнуть заново.' : (count > 0 && count < 4 ? `Ещё ${4 - count}` : ui.hint)}</p>
      {(value || count > 0) && <button className="tz-link" onClick={reset}>Сбросить</button>}
    </div>
  );
}

// Планшет настроения: точка на поле
export function MoodPad({ value, onChange, onCommit, ui }) {
  const ref = useRef(null);
  const set = e => {
    const r = ref.current.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, 1 - (e.clientY - r.top) / r.height));
    onChange({ x, y });
  };
  const key = e => {
    const cur = value || { x: 0.5, y: 0.5 };
    const d = { ArrowLeft: [-0.08, 0], ArrowRight: [0.08, 0], ArrowUp: [0, 0.08], ArrowDown: [0, -0.08] }[e.key];
    if (!d) return;
    e.preventDefault();
    const nx = { x: Math.min(1, Math.max(0, cur.x + d[0])), y: Math.min(1, Math.max(0, cur.y + d[1])) };
    onChange(nx);
  };
  return (
    <div className="tz-pad-wrap">
      <span className="tz-pad-t">{ui.yt}</span>
      <div className="tz-pad-row">
        <span className="tz-pad-l">{ui.xl}</span>
        <div ref={ref} className="tz-pad" tabIndex="0" role="slider" aria-label="Настроение" aria-valuetext={value ? `${Math.round(value.x * 100)}% светлое, ${Math.round(value.y * 100)}% бодрое` : 'не выбрано'}
          onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); set(e); }}
          onPointerMove={e => { if (e.buttons) set(e); }}
          onPointerUp={() => onCommit && onCommit()}
          onKeyDown={key}>
          <i className="tz-pad-cx" /><i className="tz-pad-cy" />
          {value && <b className="tz-pad-dot" style={{ left: `${value.x * 100}%`, top: `${(1 - value.y) * 100}%` }} />}
        </div>
        <span className="tz-pad-r">{ui.xr}</span>
      </div>
      <span className="tz-pad-b">{ui.yb}</span>
    </div>
  );
}
