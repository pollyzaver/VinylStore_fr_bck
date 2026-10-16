import React, { useEffect, useRef, useState } from 'react';

// Плавное появление блока, когда он попадает в экран. Без IntersectionObserver
// и при «уменьшить анимацию» блок сразу виден.
const Reveal = ({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) => {
  const ref = useRef(null);
  const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [seen, setSeen] = useState(reduce || typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    if (seen || !ref.current) return undefined;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [seen]);

  return (
    <Tag ref={ref} className={`rv ${seen ? 'in' : ''} ${className}`.trim()} style={{ '--rv-d': `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
};

export default Reveal;
