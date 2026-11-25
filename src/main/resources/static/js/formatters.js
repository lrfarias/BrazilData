window.BDFmt = (() => {
  const isValido = v => v !== null && v !== undefined && !Number.isNaN(Number(v));

  function num(v, d = 0) {
    if (!isValido(v)) return '—';
    return Number(v).toLocaleString('pt-BR', {
      minimumFractionDigits: d,
      maximumFractionDigits: d
    });
  }

  function brl(v, d = 2) {
    if (!isValido(v)) return '—';
    return Number(v).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: d,
      maximumFractionDigits: d
    });
  }

  function usd(v, d = 0) {
    if (!isValido(v)) return '—';
    return Number(v).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: d,
      maximumFractionDigits: d
    });
  }

  function compactBRL(v) {
    if (!isValido(v)) return '—';
    const n = Number(v);
    const abs = Math.abs(n);
    const s = n < 0 ? '-' : '';
    if (abs >= 1e12) return `${s}R$ ${num(abs / 1e12, 2)} tri`;
    if (abs >= 1e9)  return `${s}R$ ${num(abs / 1e9, 2)} bi`;
    if (abs >= 1e6)  return `${s}R$ ${num(abs / 1e6, 1)} mi`;
    return brl(n, 0);
  }

  function compactUSD(v) {
    if (!isValido(v)) return '—';
    const n = Number(v);
    const abs = Math.abs(n);
    const s = n < 0 ? '-' : '';
    if (abs >= 1e12) return `${s}US$ ${num(abs / 1e12, 2)} tri`;
    if (abs >= 1e9)  return `${s}US$ ${num(abs / 1e9, 1)} bi`;
    if (abs >= 1e6)  return `${s}US$ ${num(abs / 1e6, 1)} mi`;
    return `${s}US$ ${num(abs, 0)}`;
  }

  function pct(v, d = 1, comSinal = false) {
    if (!isValido(v)) return '—';
    const n = Number(v);
    const sinal = comSinal && n > 0 ? '+' : '';
    return `${sinal}${num(n, d)}%`;
  }

  function ton(v) {
    if (!isValido(v)) return '—';
    const n = Number(v);
    if (n >= 1e6) return `${num(n / 1e6, 2)} mi t`;
    if (n >= 1e3) return `${num(n / 1e3, 1)} mil t`;
    return `${num(n, 0)} t`;
  }

  function pop(v) {
    if (!isValido(v)) return '—';
    const n = Number(v);
    if (n >= 1e9) return `${num(n / 1e9, 2)} bi`;
    if (n >= 1e6) return `${num(n / 1e6, 1)} mi`;
    return num(n, 0);
  }

  return { num, brl, usd, compactBRL, compactUSD, pct, ton, pop };
})();