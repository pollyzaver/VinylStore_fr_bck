import React, { useEffect, useRef } from 'react';

// Дымка под курсором: тёплое пятно света, которое идёт за мышью внутри секции.
// Стили у класса .cr-haze (CrateShelf.css), та же дымка, что на полке с пластинками.
const Haze = ({ scope }) => {
  const ref = useRef(null);
  useEffect(() => {
    const h = ref.current;
    if (!h) return undefined;
    const sec = (scope && h.closest(scope)) || h.parentElement;
    const move = (e) => {
      h.style.setProperty('--mx', `${e.clientX}px`);
      h.style.setProperty('--my', `${e.clientY}px`);
    };
    const on = () => h.classList.add('on');
    const off = () => h.classList.remove('on');
    sec.addEventListener('pointermove', move, { passive: true });
    sec.addEventListener('pointerenter', on);
    sec.addEventListener('pointerleave', off);
    return () => {
      sec.removeEventListener('pointermove', move);
      sec.removeEventListener('pointerenter', on);
      sec.removeEventListener('pointerleave', off);
    };
  }, [scope]);
  return <div ref={ref} className="cr-haze" aria-hidden="true" />;
};

export default Haze;
