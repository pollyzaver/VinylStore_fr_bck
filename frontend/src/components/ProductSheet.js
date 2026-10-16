import React, { useCallback, useEffect, useState } from 'react';
import { CrateSheet } from './CrateShelf';
import { api } from '../api';

// Единое окно пластинки (то же, что открывается с полки каталога).
// Рекомендации из теста и избранное хранят только часть полей, поэтому полные данные берём из каталога по id.
let cache = null;
const loadAll = () => {
  if (!cache) cache = api.getProducts().catch((e) => { cache = null; throw e; });
  return cache;
};

const ProductSheet = ({ ids, openId, onClose }) => {
  const [all, setAll] = useState(null);
  const [current, setCurrent] = useState(openId);

  useEffect(() => { setCurrent(openId); }, [openId]);
  useEffect(() => {
    if (openId == null) return;
    let alive = true;
    loadAll().then((list) => { if (alive) setAll(list); }).catch(() => {});
    return () => { alive = false; };
  }, [openId]);

  const list = ids && ids.length ? ids : [openId];
  const idx = Math.max(0, list.findIndex((x) => String(x) === String(current)));

  const step = useCallback((n) => {
    if (list.length < 2) return;
    setCurrent(list[(idx + n + list.length) % list.length]);
  }, [list, idx]);

  if (openId == null || !all) return null;
  const product = all.find((p) => String(p.id) === String(current));
  if (!product) return null;

  return (
    <CrateSheet
      product={product}
      index={idx}
      total={list.length}
      label="#b3262d"
      onClose={onClose}
      onStep={step}
    />
  );
};

export default ProductSheet;
