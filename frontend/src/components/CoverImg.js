import React, { useEffect, useMemo, useState } from 'react';
import { discSvg } from '../utils/tasteDisc';
import { useI18n } from '../i18n/I18nContext';
import '../styles/components/CoverImg.css';

// Обложка пластинки. Если файла нет (coverMissing) или он не загрузился,
// вместо битой картинки рисуем диск по вкусу пластинки, и лишних запросов в сеть нет.
const CoverImg = ({ product, className = '', alt, loading }) => {
  const { t, tr } = useI18n();
  const [broken, setBroken] = useState(false);
  useEffect(() => { setBroken(false); }, [product && product.image]);

  const missing = !product || !product.image || product.coverMissing || broken;
  const html = useMemo(
    () => (missing ? discSvg(product && product.taste, { seed: (product && product.title) || 'solco' }) : ''),
    [missing, product] // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (missing) {
    return (
      <div className={`ci-ph ${className}`} role="img" aria-label={alt || (product ? tr.name(product.title) : '')}>
        <div className="ci-disc" dangerouslySetInnerHTML={{ __html: html }} />
        {product && <span className="ci-cap">{tr.name(product.title)}</span>}
      </div>
    );
  }
  return (
    <img
      className={className}
      src={process.env.PUBLIC_URL + product.image}
      alt={alt || t('cr.cover', { title: tr.name(product.title), artist: tr.name(product.description || product.artist || '') })}
      loading={loading}
      onError={() => setBroken(true)}
    />
  );
};

export default CoverImg;
