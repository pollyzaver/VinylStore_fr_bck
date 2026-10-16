import React, { useEffect, useMemo, useState } from 'react';
import { discSvg } from '../utils/tasteDisc';
import '../styles/components/CoverImg.css';

// Обложка пластинки. Если файла нет (coverMissing) или он не загрузился,
// вместо битой картинки рисуем диск по вкусу пластинки, и лишних запросов в сеть нет.
const CoverImg = ({ product, className = '', alt, loading }) => {
  const [broken, setBroken] = useState(false);
  useEffect(() => { setBroken(false); }, [product && product.image]);

  const missing = !product || !product.image || product.coverMissing || broken;
  const html = useMemo(
    () => (missing ? discSvg(product && product.taste, { seed: (product && product.title) || 'solco' }) : ''),
    [missing, product] // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (missing) {
    return (
      <div className={`ci-ph ${className}`} role="img" aria-label={alt || (product ? product.title : '')}>
        <div className="ci-disc" dangerouslySetInnerHTML={{ __html: html }} />
        {product && <span className="ci-cap">{product.title}</span>}
      </div>
    );
  }
  return (
    <img
      className={className}
      src={process.env.PUBLIC_URL + product.image}
      alt={alt || `Обложка: ${product.title}`}
      loading={loading}
      onError={() => setBroken(true)}
    />
  );
};

export default CoverImg;
