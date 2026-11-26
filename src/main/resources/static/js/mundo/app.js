const $ = i => document.getElementById(i);
const CACHE_KEY = 'bd_mundo_cache_v4';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const GLOBE_SVG_DATA = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 42">
    <rect width="64" height="42" rx="4" fill="#0F172A"/>
    <circle cx="32" cy="21" r="14" fill="#16C784" fill-opacity="0.2" stroke="#16C784" stroke-width="2"/>
    <ellipse cx="32" cy="21" rx="6.5" ry="14" fill="none" stroke="#16C784" stroke-width="1.5"/>
    <line x1="18" y1="21" x2="46" y2="21" stroke="#16C784" stroke-width="1.5"/>
    <line x1="20" y1="14" x2="44" y2="14" stroke="#16C784" stroke-width="1.1" stroke-opacity="0.7"/>
    <line x1="20" y1="28" x2="44" y2="28" stroke="#16C784" stroke-width="1.1" stroke-opacity="0.7"/>
  </svg>`
);

const BD = {
  brl: (v, d = 2) => v == null ? 'N/D' : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: d, maximumFractionDigits: d }),
  usd: (v, d = 0) => v == null ? 'N/D' : v.toLocaleString('pt-BR', { style: 'currency', currency: 'USD', minimumFractionDigits: d, maximumFractionDigits: d }),
  num: (v, d = 0) => v == null ? 'N/D' : v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }),
  compactUSD: v => {
    if (v == null || isNaN(v)) return 'N/D';
    const abs = Math.abs(v), s = v < 0 ? '-' : '';
    if (abs >= 1e12) return `${s}US$ ${BD.num(abs / 1e12, 2)} tri`;
    if (abs >= 1e9) return `${s}US$ ${BD.num(abs / 1e9, 1)} bi`;
    if (abs >= 1e6) return `${s}US$ ${BD.num(abs / 1e6, 1)} mi`;
    return `${s}US$ ${BD.num(abs, 0)}`;
  },
  compactPop: v => {
    if (v == null || isNaN(v)) return 'N/D';
    if (v >= 1e9) return `${BD.num(v / 1e9, 2)} bi`;
    if (v >= 1e6) return `${BD.num(v / 1e6, 1)} mi`;
    return BD.num(v, 0);
  },
  cor: () => {
    const d = document.documentElement.getAttribute('data-theme') === 'dark';
    return { tx: d ? '#F5F6F7' : '#17191C', mu: d ? '#9299A3' : '#737780', grid: d ? '#2B3036' : '#E5E7EB' };
  }
};

function interpolarVerdeMundo(t, expoente = 0.62) {
  const s = Math.pow(Math.max(0, Math.min(1, t)), expoente);
  const c0 = [116, 227, 180], c1 = [22, 199, 132], c2 = [4, 108, 78];
  let r, g, b;
  if (s <= 0.5) {
    const k = s / 0.5;
    r = Math.round(c0[0] + (c1[0] - c0[0]) * k);
    g = Math.round(c0[1] + (c1[1] - c0[1]) * k);
    b = Math.round(c0[2] + (c1[2] - c0[2]) * k);
  } else {
    const k = (s - 0.5) / 0.5;
    r = Math.round(c1[0] + (c2[0] - c1[0]) * k);
    g = Math.round(c1[1] + (c2[1] - c1[1]) * k);
    b = Math.round(c1[2] + (c2[2] - c1[2]) * k);
  }
  return `rgb(${r}, ${g}, ${b})`;
}

function inferirContinente(iso3, wbRegion, restRegion) {
  if (restRegion && REGIAO_PT[restRegion]) return REGIAO_PT[restRegion];
  for (const [sub, list] of Object.entries(SUBREGIOES_ISO)) {
    if (list.includes(iso3)) {
      if (sub.includes('América') || sub === 'Caribe') return 'Américas';
      if (sub.includes('Europa')) return 'Europa';
      if (sub.includes('África')) return 'África';
      if (sub.includes('Ásia')) return 'Ásia';
      if (sub === 'Oceania') return 'Oceania';
    }
  }
  const r = (wbRegion || '').toLowerCase();
  if (r.includes('latin america') || r.includes('north america')) return 'Américas';
  if (r.includes('europe')) return 'Europa';
  if (r.includes('sub-saharan')) return 'África';
  if (r.includes('middle east')) return 'Ásia';
  if (r.includes('asia') || r.includes('pacific')) return 'Ásia';
  return 'Outros';
}

function inferirSubregiao(iso3, cont, restSub) {
  if (restSub && SUBREGIAO_PT[restSub]) return SUBREGIAO_PT[restSub];
  for (const [sub, list] of Object.entries(SUBREGIOES_ISO)) {
    if (list.includes(iso3)) return sub;
  }
  return cont;
}

let PAISES_MAP = {}, CCN3_TO_ISO3 = { ...FALLBACK_CCN3 }, PAISES = [], ratesUSD = null, PIB_MUNDIAL_SOMA = 1;
let catAtiva = 'cont', filtroValor = 'Todos os países', isoAtivo = 'BRA', abaRx = 'econ', topN = 5;
let svgMap = null, zoomBehavior = null, chartParceiros = null, chartHist = null, chartCmp = null;
let chartVocPais = null, chartVocRegiao = null;
let cacheDetalhe = {}, ultimoHistReal = null;

function toggleDropdownMenu() { $('dropdownMenu').classList.toggle('hidden'); }
window.addEventListener('click', e => {
  const btn = $('menuDropdownBtn'), menu = $('dropdownMenu');
  if (btn && menu && !btn.contains(e.target) && !menu.contains(e.target)) menu.classList.add('hidden');
});

window.addEventListener('keydown', e => {
  const tag = (e.target && e.target.tagName) || '';
  if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
  if (e.key === 'Escape') {
    if (document.body.classList.contains('modo-apresentacao')) alternarModoApresentacao();
    else if (isoAtivo) desselecionarPais();
  }
});

function alternarDarkLight() {
  const novo = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  aplicarTema(novo);
  try { localStorage.setItem('brasil_em_dados_tema', novo); } catch {}
}

function aplicarTema(tema) {
  const html = document.documentElement, bg = $('switchBg'), ball = $('switchBall');
  if (tema === 'dark') {
    html.setAttribute('data-theme', 'dark');
    if (bg && ball) { bg.style.backgroundColor = '#16C784'; ball.classList.add('translate-x-5'); }
  } else {
    html.removeAttribute('data-theme');
    if (bg && ball) { bg.style.backgroundColor = '#E5E7EB'; ball.classList.remove('translate-x-5'); }
  }
  pintarMapa();
  renderComparadorMulti();
  if (isoAtivo && PAISES_MAP[isoAtivo]) {
    renderPizzaVocacao('pais', PAISES_MAP[isoAtivo].setores);
    if (abaRx === 'comercio') renderComercio(PAISES_MAP[isoAtivo]);
  } else if (PAISES.length) {
    exibirConsolidadoGlobal();
  }
  atualizarResumoRegiao();
  if (abaRx === 'hist' && ultimoHistReal) desenharHistoricoReal();
}

function alternarModoApresentacao() {
  document.body.classList.toggle('modo-apresentacao');
  const ativo = document.body.classList.contains('modo-apresentacao');
  $('btnModoApresentacao').innerHTML = ativo ? '<span>✕ Sair da Tela Cheia</span>'
    : `<svg class="w-3.5 h-3.5 din-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke-width="2"></rect><line x1="8" y1="21" x2="16" y2="21" stroke-width="2"></line><line x1="12" y1="17" x2="12" y2="21" stroke-width="2"></line></svg><span>Modo Tela Cheia</span>`;
}

async function fetchWBGlobal(ind) {
  try {
    const r = await fetch(`https://api.worldbank.org/v2/country/all/indicator/${ind}?format=json&mrnev=1&per_page=350`);
    if (!r.ok) return {};
    const j = await r.json();
    const out = {};
    if (Array.isArray(j[1])) {
      j[1].forEach(row => {
        if (row.countryiso3code && row.value != null) out[row.countryiso3code] = { v: +row.value, ano: row.date };
      });
    }
    return out;
  } catch { return {}; }
}

function aplicarDadosGlobais(paisesArr, ccnMap, ts, origem) {
  PAISES_MAP = {};
  paisesArr.forEach(p => { PAISES_MAP[p.iso3] = p; });
  CCN3_TO_ISO3 = { ...FALLBACK_CCN3, ...ccnMap };
  PAISES = [...paisesArr].sort((a, b) => a.nome.localeCompare(b.nome));
  PIB_MUNDIAL_SOMA = PAISES.reduce((s, p) => s + (p.pib || 0), 0) || 1;

  $('listaPaises').innerHTML = PAISES.map(p => `<option value="${p.nome}">`).join('');
  preencherSelectsComparador();

  const dataStr = new Date(ts).toLocaleString('pt-BR');
  $('statusSync').textContent = `${PAISES.length} países carregados · ${origem}`;
  $('dataAtualizacaoGlobal').textContent = `Última consulta às APIs: ${dataStr}`;

  atualizarDescFiltro();
  atualizarResumoRegiao();
  pintarMapa();
  renderRanking();
  renderComparadorMulti();

  if (isoAtivo === null) {
    exibirConsolidadoGlobal();
  } else {
    selecionarPais(PAISES_MAP[isoAtivo] ? isoAtivo : (PAISES_MAP['BRA'] ? 'BRA' : PAISES[0]?.iso3));
  }
}

function forcarAtualizacaoCache() {
  try { localStorage.removeItem(CACHE_KEY); } catch {}
  $('statusSync').textContent = 'Atualizando dados das APIs...';
  carregarBaseGlobal(true);
}

async function carregarBaseGlobal(ignorarCache = false) {
  if (!ignorarCache) {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const comPib = (parsed?.paises || []).filter(p => p.pib > 0).length;
        if (parsed && comPib > 30 && (Date.now() - parsed.ts) < CACHE_TTL_MS) {
          aplicarDadosGlobais(parsed.paises, parsed.ccnMap || {}, parsed.ts, 'Cache local (rápido)');
          return;
        }
      }
    } catch {}
  }

  try {
    const restUrl = 'https://restcountries.com/v3.1/all?fields=cca3,ccn3,name,translations,flags,capital,region,subregion,currencies';
    const wbCountriesUrl = 'https://api.worldbank.org/v2/country?format=json&per_page=350';

    const [resRest, resWbList, resFx, resPib, resPc, resPop] = await Promise.allSettled([
      fetch(restUrl).then(r => r.ok ? r.json() : null),
      fetch(wbCountriesUrl).then(r => r.ok ? r.json() : null),
      fetch('https://open.er-api.com/v6/latest/USD').then(r => r.ok ? r.json() : null),
      fetchWBGlobal('NY.GDP.MKTP.CD'),
      fetchWBGlobal('NY.GDP.PCAP.CD'),
      fetchWBGlobal('SP.POP.TOTL')
    ]);

    const [resPpc, resCresc, resInfla, resImp, resGini] = await Promise.allSettled([
      fetchWBGlobal('NY.GDP.MKTP.PP.CD'),
      fetchWBGlobal('NY.GDP.MKTP.KD.ZG'),
      fetchWBGlobal('FP.CPI.TOTL.ZG'),
      fetchWBGlobal('GC.TAX.TOTL.GD.ZS'),
      fetchWBGlobal('SI.POV.GINI')
    ]);

    const rRest = resRest.status === 'fulfilled' && Array.isArray(resRest.value) ? resRest.value : null;
    const rWbList = resWbList.status === 'fulfilled' && Array.isArray(resWbList.value?.[1]) ? resWbList.value[1] : [];
    ratesUSD = resFx.status === 'fulfilled' ? resFx.value?.rates : null;

    const getV = res => res.status === 'fulfilled' ? res.value : {};
    const wbPib = getV(resPib), wbPpc = getV(resPpc), wbPc = getV(resPc), wbPop = getV(resPop);
    const wbCresc = getV(resCresc), wbInfla = getV(resInfla), wbImp = getV(resImp), wbGini = getV(resGini);

    const fonteLista = rRest || rWbList.filter(c => c.region?.value !== 'Aggregates').map(c => ({
      cca3: c.id,
      ccn3: Object.keys(FALLBACK_CCN3).find(k => FALLBACK_CCN3[k] === c.id) || '',
      name: { common: c.name },
      capital: [c.capitalCity || '—'],
      wbRegion: c.region?.value || '',
      flags: { png: c.iso2Code ? `https://flagcdn.com/w80/${c.iso2Code.toLowerCase()}.png` : '' }
    }));

    const listaFinal = [];
    const ccnMap = { ...FALLBACK_CCN3 };

    fonteLista.forEach(c => {
      if (!c.cca3) return;
      const iso3 = c.cca3;
      const fb = FALLBACK_MACRO[iso3] || {};
      const currObj = c.currencies ? Object.entries(c.currencies)[0] : null;
      const fbM = MOEDA_FALLBACK[iso3];
      const moeda = currObj ? currObj[0] : (fbM ? fbM[0] : 'USD');
      const mNome = currObj ? currObj[1].name : (fbM ? fbM[1] : moeda);
      const moedaBRL = (moeda === 'BRL') ? 1 : (ratesUSD && ratesUSD[moeda] && ratesUSD['BRL'] ? ratesUSD['BRL'] / ratesUSD[moeda] : null);
      const nomePT = c.translations?.por?.common || c.name?.common || iso3;
      const cont = inferirContinente(iso3, c.wbRegion, c.region);
      const regiaoGeo = inferirSubregiao(iso3, cont, c.subregion);
      const ccn3 = c.ccn3 ? String(c.ccn3).padStart(3, '0') : '';

      if (ccn3) ccnMap[ccn3] = iso3;

      const setores = SETORES_REAIS_ISO[iso3] || SETORES_REGIAO_DEFAULT[regiaoGeo] || { serv: 55, ind: 25, agro: 12, adm: 8 };

      listaFinal.push({
        iso3, ccn3, nome: nomePT,
        flag: c.flags?.png || '',
        cap: Array.isArray(c.capital) && c.capital[0] ? c.capital[0] : '—',
        cont, regiaoGeo,
        vocacao: VOCACAO_PAIS[iso3] || VOCACAO_REGIAO[regiaoGeo] || VOCACAO_REGIAO[cont] || 'Economia diversificada',
        setores,
        moeda, mNome, moedaBRL,
        pib: wbPib[iso3]?.v ?? fb.pib ?? null, pibAno: wbPib[iso3]?.ano ?? (fb.pib ? '2024' : ''),
        pibPpc: wbPpc[iso3]?.v ?? fb.ppc ?? null, pibPpcAno: wbPpc[iso3]?.ano ?? (fb.ppc ? '2024' : ''),
        pibPc: wbPc[iso3]?.v ?? fb.pc ?? null, pibPcAno: wbPc[iso3]?.ano ?? (fb.pc ? '2024' : ''),
        pop: wbPop[iso3]?.v ?? fb.pop ?? null, popAno: wbPop[iso3]?.ano ?? (fb.pop ? '2024' : ''),
        cresc: wbCresc[iso3]?.v ?? fb.cresc ?? null, crescAno: wbCresc[iso3]?.ano ?? (fb.cresc != null ? '2024' : ''),
        infla: wbInfla[iso3]?.v ?? fb.infla ?? null, inflaAno: wbInfla[iso3]?.ano ?? (fb.infla != null ? '2024' : ''),
        imposto: wbImp[iso3]?.v ?? fb.imp ?? null, impostoAno: wbImp[iso3]?.ano ?? (fb.imp != null ? '2024' : ''),
        gini: wbGini[iso3]?.v ?? fb.gini ?? null, giniAno: wbGini[iso3]?.ano ?? (fb.gini != null ? '2023' : ''),
        idh: IDH_PNUD[iso3] ?? null, idhAno: IDH_PNUD[iso3] ? '2023' : ''
      });
    });

    const agora = Date.now();
    if (Object.keys(wbPib).length > 50) {
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: agora, paises: listaFinal, ccnMap })); } catch {}
    }

    aplicarDadosGlobais(listaFinal, ccnMap, agora, 'Banco Mundial + Câmbio ao vivo');
  } catch (e) {
    console.error('Erro na base global:', e);
    $('statusSync').textContent = 'Erro ao sincronizar base global. Recarregue a página.';
  }
}

function paisNoFiltro(p) {
  if (!filtroValor || filtroValor === 'Todos os países') return true;
  if (catAtiva === 'cont') return p.cont === filtroValor;
  if (catAtiva === 'reg') {
    if (filtroValor === 'América Latina') return SETS.geopol['América Latina'].includes(p.iso3);
    if (filtroValor === 'Eurásia') return SETS.geopol['Eurásia'].includes(p.iso3);
    if (SUBREGIOES_ISO[filtroValor]) return SUBREGIOES_ISO[filtroValor].includes(p.iso3) || p.regiaoGeo === filtroValor;
    return p.regiaoGeo === filtroValor;
  }
  if (catAtiva === 'blocos') return (SETS.blocos[filtroValor] || []).includes(p.iso3);
  if (catAtiva === 'geopol') {
    if (filtroValor === 'Sul Global') return !SETS.geopol['Norte Global'].includes(p.iso3);
    return (SETS.geopol[filtroValor] || []).includes(p.iso3);
  }
  if (catAtiva === 'desenv') {
    if (filtroValor === 'Países desenvolvidos') return (p.idh && p.idh >= 0.85) || (p.pibPc && p.pibPc >= 25000);
    if (filtroValor === 'Economias emergentes') return ['BRA','CHN','IND','MEX','IDN','TUR','ZAF','RUS','POL','CHL','COL','PER','THA','MYS','VNM','PHL','EGY','ARG','SAU'].includes(p.iso3);
    return !((p.idh && p.idh >= 0.85) || (p.pibPc && p.pibPc >= 25000));
  }
  if (catAtiva === 'rank') {
    if (filtroValor === 'Maiores economias do mundo') {
      const top15 = [...PAISES].filter(x => x.pib).sort((a, b) => b.pib - a.pib).slice(0, 15).map(x => x.iso3);
      return top15.includes(p.iso3);
    }
    if (filtroValor === 'Maiores populações') {
      const top15 = [...PAISES].filter(x => x.pop).sort((a, b) => b.pop - a.pop).slice(0, 15).map(x => x.iso3);
      return top15.includes(p.iso3);
    }
    return (SETS.rankings[filtroValor] || []).includes(p.iso3);
  }
  return true;
}

function setCategoriaFiltro(cat) {
  catAtiva = cat;
  const ids = { cont:'catCont', reg:'catReg', blocos:'catBlocos', geopol:'catGeopol', desenv:'catDesenv', rank:'catRank' };
  Object.entries(ids).forEach(([k, id]) => {
    $(id).className = k === cat
      ? 'px-2.5 py-1.5 rounded-md din-card-bg din-text-main border din-border transition cursor-pointer'
      : 'px-2.5 py-1.5 rounded-md din-text-muted hover:din-text-main transition cursor-pointer';
  });
  $('lblCategoriaAtiva').textContent = CATEGORIAS_FILTRO[cat].label;
  renderOpcoesFiltro();
}

function renderOpcoesFiltro() {
  $('opcoesFiltro').innerHTML = CATEGORIAS_FILTRO[catAtiva].opcoes.map(op => {
    const ativo = filtroValor === op;
    return `<button type="button" onclick="selecionarFiltroOpcao('${op.replace(/'/g, "\\'")}')"
      class="px-2.5 py-1 rounded-md text-xs font-semibold border transition cursor-pointer ${ativo ? 'din-btn border-transparent' : 'din-secondary-bg din-border din-text-muted hover:din-text-main'}">${op}</button>`;
  }).join('');
}

function selecionarFiltroOpcao(op) {
  filtroValor = op;
  renderOpcoesFiltro();
  atualizarDescFiltro();
  atualizarResumoRegiao();
  if (!isoAtivo) exibirConsolidadoGlobal();
  pintarMapa();
  renderRanking();
}

function limparFiltros() {
  filtroValor = 'Todos os países';
  $('inpBuscaPais').value = '';
  renderOpcoesFiltro();
  atualizarDescFiltro();
  atualizarResumoRegiao();
  if (!isoAtivo) exibirConsolidadoGlobal();
  pintarMapa();
  renderRanking();
}

function atualizarDescFiltro() {
  const ativos = PAISES.filter(paisNoFiltro);
  const lbl = filtroValor === 'Todos os países' ? 'Todos os países' : filtroValor;
  $('filtroAtivoBadge').textContent = `Filtro: ${lbl} (${ativos.length} países)`;
  $('mapFiltroDesc').textContent = filtroValor === 'Todos os países'
    ? '1º clique seleciona o país; 2º clique (ou Esc) volta ao consolidado mundial.'
    : `Recorte ativo: "${lbl}" (${ativos.length} países destacados em verde no mapa).`;
}

function atualizarResumoRegiao() {
  const sec = $('secaoResumoRegiao');
  if (!PAISES.length || filtroValor === 'Todos os países') {
    sec.classList.add('hidden');
    return;
  }
  const ativos = PAISES.filter(paisNoFiltro);
  if (!ativos.length) { sec.classList.add('hidden'); return; }

  sec.classList.remove('hidden');
  $('regTit').textContent = filtroValor;
  $('regQtd').textContent = `${ativos.length} países`;

  const pibSoma = ativos.reduce((s, p) => s + (p.pib || 0), 0);
  const shareGlobal = (pibSoma / PIB_MUNDIAL_SOMA) * 100;
  const popSoma = ativos.reduce((s, p) => s + (p.pop || 0), 0);
  const pibPcMed = popSoma > 0 ? pibSoma / popSoma : null;

  const comIdh = ativos.filter(p => p.idh != null);
  const idhMed = comIdh.length ? comIdh.reduce((s, p) => s + p.idh, 0) / comIdh.length : null;

  const comInfla = ativos.filter(p => p.infla != null && p.infla < 80);
  const inflaMed = comInfla.length ? comInfla.reduce((s, p) => s + p.infla, 0) / comInfla.length : null;

  const ordenados = [...ativos].sort((a, b) => (b.pib || 0) - (a.pib || 0));
  const lider = ordenados[0];

  $('regShareGlobal').textContent = `${BD.num(shareGlobal, 1)}% do PIB Mundial`;
  $('regPib').textContent = BD.compactUSD(pibSoma);
  $('regPop').textContent = BD.compactPop(popSoma);
  $('regPibPc').textContent = BD.usd(pibPcMed, 0);
  $('regIdh').textContent = idhMed != null ? BD.num(idhMed, 3) : 'N/D';
  $('regInfla').textContent = inflaMed != null ? `${BD.num(inflaMed, 1)}%` : 'N/D';
  $('regLider').textContent = lider ? `${lider.nome} (${BD.compactUSD(lider.pib)})` : '—';
  $('regVocTxt').textContent = VOCACAO_REGIAO[filtroValor] || 'Composição ponderada pelo PIB dos países do recorte';

  let wTot = 0, ws = 0, wi = 0, wa = 0;
  ativos.forEach(p => {
    const w = p.pib || 1e9;
    wTot += w;
    ws += w * (p.setores?.serv || 55);
    wi += w * (p.setores?.ind || 25);
    wa += w * (p.setores?.agro || 10);
  });
  const s = Math.round(ws / wTot), i = Math.round(wi / wTot), ag = Math.round(wa / wTot);
  const adm = Math.max(1, 100 - (s + i + ag));
  renderPizzaVocacao('regiao', { serv: s, ind: i, agro: ag, adm });

  $('listaPaisesRecorte').innerHTML = ordenados.map(p => `
    <button type="button" onclick="alternarSelecaoPais('${p.iso3}')"
      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition cursor-pointer ${p.iso3 === isoAtivo ? 'din-btn border-transparent' : 'din-secondary-bg din-border din-text-main hover:border-[#16C784]'}">
      <span>${p.nome}</span>
      <span class="opacity-70 font-normal">${p.pib ? BD.compactUSD(p.pib) : ''}</span>
    </button>
  `).join('');
}

function renderPizzaVocacao(alvo, setores) {
  const s = setores || { serv: 55, ind: 25, agro: 10, adm: 10 };
  const itens = [
    { n: 'Serviços', v: s.serv, cor: '#16C784' },
    { n: 'Indústria', v: s.ind, cor: '#2563EB' },
    { n: 'Agropecuária', v: s.agro, cor: '#F59E0B' },
    { n: 'Adm. Pública / Outros', v: s.adm, cor: '#EA3943' }
  ];

  const legId = alvo === 'pais' ? 'legVocPais' : 'legVocRegiao';
  const canvasId = alvo === 'pais' ? 'grafVocPais' : 'grafVocRegiao';

  $(legId).innerHTML = itens.map(x => `
    <div class="space-y-1">
      <div class="flex items-center justify-between text-[11px]">
        <span class="din-text-muted">${x.n}</span>
        <strong class="din-text-main">${x.v}%</strong>
      </div>
      <div class="w-full h-1.5 rounded-full din-card-bg overflow-hidden">
        <div class="h-full rounded-full" style="width:${Math.min(100, x.v)}%; background:${x.cor};"></div>
      </div>
    </div>
  `).join('');

  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  const cfg = {
    type: 'doughnut',
    data: {
      labels: itens.map(x => x.n),
      datasets: [{ data: itens.map(x => x.v), backgroundColor: itens.map(x => x.cor), borderColor: dark ? '#22262B' : '#F0F2F5', borderWidth: 2 }]
    },
    options: {
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: x => ` ${x.label}: ${x.parsed}%` } } }
    }
  };

  if (alvo === 'pais') {
    if (chartVocPais) chartVocPais.destroy();
    chartVocPais = new Chart($(canvasId), cfg);
  } else {
    if (chartVocRegiao) chartVocRegiao.destroy();
    chartVocRegiao = new Chart($(canvasId), cfg);
  }
}

function buscarPais(termo) {
  const q = (termo || '').trim().toLowerCase();
  if (!q) return;
  const achado = PAISES.find(p => p.nome.toLowerCase() === q) || PAISES.find(p => p.nome.toLowerCase().includes(q));
  if (achado) selecionarPais(achado.iso3);
}

function fmtInd(p, k) {
  if (!p || p[k] == null) return 'N/D';
  if (k === 'pib' || k === 'pibPpc') return BD.compactUSD(p[k]);
  if (k === 'pibPc') return BD.usd(p[k], 0);
  if (k === 'idh') return BD.num(p[k], 3);
  if (k === 'gini') return BD.num(p[k], 1);
  if (k === 'pop') return BD.compactPop(p[k]);
  if (k === 'imposto' || k === 'infla') return BD.num(p[k], 1) + '%';
  if (k === 'cresc') return (p[k] >= 0 ? '+' : '') + BD.num(p[k], 1) + '%';
  if (k === 'moedaBRL') return BD.brl(p[k], p[k] < 0.1 ? 4 : 2);
  return 'N/D';
}

function alternarSelecaoPais(iso3) {
  if (!iso3) return;
  if (isoAtivo === iso3) desselecionarPais();
  else selecionarPais(iso3);
}

function desselecionarPais() {
  isoAtivo = null;
  $('inpBuscaPais').value = '';
  exibirConsolidadoGlobal();
  pintarMapa();
  renderRanking();
  if (filtroValor !== 'Todos os países') atualizarResumoRegiao();
}
window.desselecionarPais = desselecionarPais;

async function iniciarMapaMundi() {
  const urls = [
    'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json',
    'https://unpkg.com/world-atlas@2/countries-110m.json'
  ];
  let topo = null;
  for (const u of urls) {
    try { const r = await fetch(u); if (r.ok) { topo = await r.json(); break; } } catch {}
  }
  if (!topo) { $('mapLoading').textContent = 'Não foi possível carregar a malha mundial.'; return; }

  const raw = topojson.feature(topo, topo.objects.countries);
  const features = raw.features.filter(f => String(f.id) !== '010');
  const geo = { type: 'FeatureCollection', features };

  svgMap = d3.select('#mapaMundo');
  svgMap.selectAll('*').remove();

  const container = $('mapContainer');
  const w = Math.max(760, container.clientWidth || 1040);
  const h = Math.max(430, container.clientHeight || 540);
  svgMap.attr('viewBox', `0 0 ${w} ${h}`);

  const g = svgMap.append('g').attr('id', 'camadaPaises');
  const proj = d3.geoNaturalEarth1().fitExtent([[14, 14], [w - 14, h - 14]], geo);
  const path = d3.geoPath().projection(proj);
  const tip = $('mapTip');

  zoomBehavior = d3.zoom()
    .scaleExtent([1, 8])
    .clickDistance(4)
    .on('zoom', ev => g.attr('transform', ev.transform));

  svgMap.call(zoomBehavior);

  svgMap.on('click', ev => {
    if (ev.defaultPrevented) return;
    if (ev.target === svgMap.node() && isoAtivo) desselecionarPais();
  });

  g.selectAll('path')
    .data(features)
    .join('path')
    .attr('class', 'pais-path cursor-pointer')
    .attr('d', path)
    .attr('data-ccn3', f => String(f.id).padStart(3, '0'))
    .attr('data-geo-name', f => f.properties?.name || 'Território')
    .on('mouseenter', function(ev) {
      d3.select(this).style('stroke', '#16C784').style('stroke-width', '2.2px');

      const iso3 = CCN3_TO_ISO3[this.getAttribute('data-ccn3')];
      const p = PAISES_MAP[iso3];
      $('tipNome').textContent = p ? `${p.nome} (${p.iso3})` : this.getAttribute('data-geo-name');
      const share = p && p.pib ? `${BD.num((p.pib / PIB_MUNDIAL_SOMA) * 100, 1)}% do PIB` : '—';
      $('tipShare').textContent = share;
      $('tipPib').textContent = p ? BD.compactUSD(p.pib) : 'N/D';
      $('tipPibPc').textContent = p ? BD.usd(p.pibPc, 0) : 'N/D';
      tip.style.left = (ev.clientX + 14) + 'px';
      tip.style.top = (ev.clientY + 14) + 'px';
      tip.classList.remove('hidden');
    })
    .on('mousemove', ev => {
      tip.style.left = (ev.clientX + 14) + 'px';
      tip.style.top = (ev.clientY + 14) + 'px';
    })
    .on('mouseleave', function() {
      tip.classList.add('hidden');
      pintarMapa();
    })
    .on('click', function(ev) {
      if (ev.defaultPrevented) return;
      ev.stopPropagation();
      const iso3 = CCN3_TO_ISO3[this.getAttribute('data-ccn3')];
      if (iso3) alternarSelecaoPais(iso3);
    });

  $('mapLoading').classList.add('hidden');
  $('mapaMundo').classList.remove('hidden');
  pintarMapa();
}

function pintarMapa() {
  if (!svgMap || !PAISES.length) return;
  const modo = $('mapIndicador').value;
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  const semDado = dark ? '#181B20' : '#E5E7EB';
  const neutroAtivo = dark ? '#24332D' : '#D5ECE3';
  const neutroPadrao = dark ? '#22272E' : '#E2E8F0';
  const borda = dark ? '#121518' : '#FFFFFF';
  const bordaSel = dark ? '#F5F6F7' : '#17191C';
  const filtroAtivo = filtroValor !== 'Todos os países';

  const paths = svgMap.selectAll('path');

  if (modo === 'padrao') {
    $('legBarra').classList.add('hidden');
    $('legMin').innerHTML = `<span class="w-3 h-3 rounded-sm bg-[#16C784] inline-block"></span> ${isoAtivo ? 'País selecionado' : (filtroAtivo ? 'Países do recorte' : 'Clique em um país para inspecionar')}`;
    $('legMax').innerHTML = `<span class="w-3 h-3 rounded-sm border-2 border-[#16C784] inline-block"></span> Passe o mouse para destacar`;

    paths
      .style('fill', function() {
        const iso3 = CCN3_TO_ISO3[this.getAttribute('data-ccn3')];
        const p = PAISES_MAP[iso3];
        if (!p) return semDado;
        if (filtroAtivo) {
          if (paisNoFiltro(p)) return iso3 === isoAtivo ? '#046C4E' : '#16C784';
          return semDado;
        }
        if (isoAtivo) return iso3 === isoAtivo ? '#16C784' : neutroPadrao;
        return neutroAtivo;
      })
      .style('stroke', function() {
        const iso3 = CCN3_TO_ISO3[this.getAttribute('data-ccn3')];
        return iso3 === isoAtivo ? bordaSel : borda;
      })
      .style('stroke-width', function() {
        const iso3 = CCN3_TO_ISO3[this.getAttribute('data-ccn3')];
        return iso3 === isoAtivo ? '2.4px' : '0.7px';
      });
  } else {
    $('legBarra').classList.remove('hidden');
    $('legBarra').style.background = 'linear-gradient(90deg, #74E3B4 0%, #16C784 50%, #046C4E 100%)';

    const ativos = PAISES.filter(p => paisNoFiltro(p) && p[modo] != null);
    const vals = ativos.map(p => p[modo]);
    const min = vals.length ? Math.min(...vals) : 0;
    const max = vals.length ? Math.max(...vals) : 1;
    const exp = (modo === 'pib' || modo === 'pibPpc' || modo === 'pop') ? 0.45 : 0.72;

    if (ativos.length) {
      const pMin = ativos.find(p => p[modo] === min), pMax = ativos.find(p => p[modo] === max);
      $('legMin').textContent = `${pMin.nome}: ${fmtInd(pMin, modo)}`;
      $('legMax').textContent = `Destaque · ${pMax.nome}: ${fmtInd(pMax, modo)}`;
    }

    paths
      .style('fill', function() {
        const iso3 = CCN3_TO_ISO3[this.getAttribute('data-ccn3')];
        const p = PAISES_MAP[iso3];
        if (!p || !paisNoFiltro(p) || p[modo] == null) return semDado;
        if (max <= min) return '#046C4E';
        return interpolarVerdeMundo((p[modo] - min) / (max - min), exp);
      })
      .style('stroke', function() {
        const iso3 = CCN3_TO_ISO3[this.getAttribute('data-ccn3')];
        return iso3 === isoAtivo ? bordaSel : borda;
      })
      .style('stroke-width', function() {
        const iso3 = CCN3_TO_ISO3[this.getAttribute('data-ccn3')];
        return iso3 === isoAtivo ? '2.4px' : '0.7px';
      });
  }

  if (isoAtivo) {
    paths.filter(function() {
      return CCN3_TO_ISO3[this.getAttribute('data-ccn3')] === isoAtivo;
    }).raise();
  }
}

function ajustarZoom(f) { if (svgMap && zoomBehavior) svgMap.transition().duration(250).call(zoomBehavior.scaleBy, f); }
function resetZoom() { if (svgMap && zoomBehavior) svgMap.transition().duration(250).call(zoomBehavior.transform, d3.zoomIdentity); }

function atualizarBotaoVoltarMundo(visivel) {
  let btn = $('btnLimparPaisMundo');
  if (!btn && $('rxIso')) {
    btn = document.createElement('button');
    btn.id = 'btnLimparPaisMundo';
    btn.type = 'button';
    btn.onclick = desselecionarPais;
    btn.className = 'text-[10px] font-semibold px-2 py-0.5 rounded din-secondary-bg border din-border din-text-main hover:border-[#16C784] transition cursor-pointer';
    $('rxIso').parentElement.appendChild(btn);
  }
  if (!btn) return;
  btn.textContent = filtroValor === 'Todos os países' ? '← Ver Mundo' : '← Ver Recorte';
  btn.classList.toggle('hidden', !visivel);
}

function exibirConsolidadoGlobal() {
  if (!PAISES.length) return;
  const isMundo = filtroValor === 'Todos os países';
  const ativos = PAISES.filter(paisNoFiltro);
  if (!ativos.length) return;

  atualizarBotaoVoltarMundo(false);

  const pibSoma = ativos.reduce((s, p) => s + (p.pib || 0), 0);
  const ppcSoma = ativos.reduce((s, p) => s + (p.pibPpc || 0), 0);
  const popSoma = ativos.reduce((s, p) => s + (p.pop || 0), 0);
  const pibPcMed = popSoma > 0 ? pibSoma / popSoma : null;

  const comCresc = ativos.filter(p => p.cresc != null && Math.abs(p.cresc) < 40);
  const crescMed = comCresc.length ? comCresc.reduce((s, p) => s + p.cresc, 0) / comCresc.length : null;

  const comInfla = ativos.filter(p => p.infla != null && p.infla < 80);
  const inflaMed = comInfla.length ? comInfla.reduce((s, p) => s + p.infla, 0) / comInfla.length : null;

  const comImp = ativos.filter(p => p.imposto != null);
  const impMed = comImp.length ? comImp.reduce((s, p) => s + p.imposto, 0) / comImp.length : null;
  const arrecSoma = ativos.reduce((s, p) => s + ((p.pib != null && p.imposto != null) ? p.pib * (p.imposto / 100) : 0), 0);

  const comIdh = ativos.filter(p => p.idh != null);
  const idhMed = comIdh.length ? comIdh.reduce((s, p) => s + p.idh, 0) / comIdh.length : null;

  const comGini = ativos.filter(p => p.gini != null);
  const giniMed = comGini.length ? comGini.reduce((s, p) => s + p.gini, 0) / comGini.length : null;

  const ordenados = [...ativos].sort((a, b) => (b.pib || 0) - (a.pib || 0));
  const lider = ordenados[0];
  const usdBrl = ratesUSD && ratesUSD['BRL'] ? ratesUSD['BRL'] : null;

  $('rxBandImg').src = GLOBE_SVG_DATA;
  $('rxNome').textContent = isMundo ? 'Mundo (Consolidado)' : filtroValor;
  $('rxIso').textContent = isMundo ? 'WLD' : `${ativos.length} PAÍSES`;
  $('rxBlocos').textContent = isMundo ? 'Panorama Global · Banco Mundial' : `${BD.num((pibSoma / PIB_MUNDIAL_SOMA) * 100, 1)}% do PIB Mundial`;
  $('rxMeta').textContent = isMundo
    ? `${ativos.length} economias monitoradas · Clique em um país no mapa para inspecionar`
    : `Consolidado do recorte · Líder: ${lider ? lider.nome : '—'}`;

  $('rxMoedaCod').textContent = 'USD';
  $('rxMoedaBrl').textContent = usdBrl != null ? BD.brl(usdBrl, 2) : 'US$ 1,00';
  $('rxMoedaNome').textContent = 'Dólar Americano (Ref. Global)';
  $('rxPopArea').textContent = `População: ${BD.compactPop(popSoma)}`;
  $('rxRegiaoBadge').textContent = isMundo ? 'Economia Mundial' : filtroValor;
  $('rxVocacao').textContent = isMundo
    ? 'Composição ponderada da economia global (Serviços, Indústria e Agro)'
    : (VOCACAO_REGIAO[filtroValor] || 'Composição ponderada pelo PIB do recorte');

  if (crescMed != null) {
    const subiu = crescMed >= 0;
    $('rxTendencia').innerHTML = `Média ${subiu ? '↑' : '↓'} <span class="${subiu ? 'din-green' : 'din-red'}">${subiu ? '+' : ''}${BD.num(crescMed, 1)}%</span> <span class="text-[10px] din-text-muted font-normal">(PIB a.a.)</span>`;
  } else {
    $('rxTendencia').innerHTML = '<span class="din-text-muted">—</span>';
  }

  let wTot = 0, ws = 0, wi = 0, wa = 0;
  ativos.forEach(p => {
    const w = p.pib || 1e9;
    wTot += w;
    ws += w * (p.setores?.serv || 55);
    wi += w * (p.setores?.ind || 25);
    wa += w * (p.setores?.agro || 10);
  });
  const s = Math.round(ws / (wTot || 1)), i = Math.round(wi / (wTot || 1)), ag = Math.round(wa / (wTot || 1));
  const adm = Math.max(1, 100 - (s + i + ag));
  renderPizzaVocacao('pais', { serv: s, ind: i, agro: ag, adm });

  $('gridMacro').innerHTML = [
    cardKpi('PIB Nominal Somado', BD.compactUSD(pibSoma), 'Banco Mundial', 'Recente', 'Consolidado', 'din-green'),
    cardKpi('PIB em PPC Somado', BD.compactUSD(ppcSoma), 'Banco Mundial', 'Recente', 'Consolidado', 'din-green'),
    cardKpi('PIB per capita Médio', BD.usd(pibPcMed, 0), 'PIB ÷ População', 'Recente', 'Ponderado'),
    cardKpi('Crescimento Médio (% a.a.)', crescMed != null ? `${crescMed >= 0 ? '+' : ''}${BD.num(crescMed, 1)}%` : 'N/D', 'Banco Mundial', 'Recente', 'Média', crescMed >= 0 ? 'din-green' : 'din-red'),
    cardKpi('Inflação Média (IPC %)', inflaMed != null ? `${BD.num(inflaMed, 1)}%` : 'N/D', 'Banco Mundial', 'Recente', 'Média', 'din-red'),
    cardKpi('Carga Tributária Média', impMed != null ? `${BD.num(impMed, 1)}%` : 'N/D', 'Banco Mundial / OCDE', 'Recente', 'Média'),
    cardKpi('Arrecadação Est. Somada', BD.compactUSD(arrecSoma), 'Calculado s/ PIB', 'Recente', 'Estimado'),
    cardKpi('Maior Economia', lider ? lider.nome : 'N/D', lider ? BD.compactUSD(lider.pib) : '', '', 'Líder', 'din-green'),
    cardKpi('IDH Médio (PNUD)', idhMed != null ? BD.num(idhMed, 3) : 'N/D', 'PNUD', '2023', 'Média', 'din-green'),
    cardKpi('Economias no Recorte', `${ativos.length} países`, 'World Bank API v2', '', 'Ativo')
  ].join('');

  $('gridComercioKpi').innerHTML = [
    cardKpi('Peso no PIB Mundial', `${BD.num((pibSoma / PIB_MUNDIAL_SOMA) * 100, 1)}%`, 'Participação global', '', 'Consolidado', 'din-green'),
    cardKpi('Líder em PIB Nominal', lider ? `${lider.nome} (${lider.iso3})` : 'N/D', lider ? BD.compactUSD(lider.pib) : '', '', 'Observado'),
    cardKpi('Comércio Bilateral', 'Selecione um país', 'Clique no mapa acima', '', 'Detalhado')
  ].join('');
  $('boxGrafParceiros').classList.add('hidden');
  $('msgSemParceiros').classList.remove('hidden');
  $('msgSemParceiros').textContent = 'Clique em qualquer país no mapa para visualizar seus principais parceiros comerciais e pauta exportadora.';
  $('listaProdutosExp').innerHTML = `<li class="din-text-muted">Selecione um país no mapa para abrir a pauta exportadora (UN Comtrade).</li>`;

  const faixaIdh = idhMed == null ? 'N/D' : idhMed >= 0.8 ? 'Muito Alto' : idhMed >= 0.7 ? 'Alto' : idhMed >= 0.55 ? 'Médio' : 'Baixo';
  $('gridSocial').innerHTML = [
    cardKpi('IDH Médio (Desenv. Humano)', idhMed != null ? `${BD.num(idhMed, 3)} (${faixaIdh})` : 'N/D', 'PNUD', '2023', 'Média', 'din-green'),
    cardKpi('Índice de Gini Médio', giniMed != null ? BD.num(giniMed, 1) : 'N/D', 'Banco Mundial', 'Recente', 'Média'),
    cardKpi('População Total', BD.compactPop(popSoma), 'Banco Mundial', 'Recente', 'Consolidado')
  ].join('');
  $('rxResumoSocial').textContent = `Visão consolidada de ${isMundo ? 'todas as economias monitoradas' : filtroValor}: população total de ${BD.compactPop(popSoma)}, IDH médio de ${idhMed != null ? BD.num(idhMed, 3) : 'N/D'} (PNUD) e Índice de Gini médio de ${giniMed != null ? BD.num(giniMed, 1) : 'N/D'}. Clique em um país no mapa para ver seus indicadores individuais.`;

  if (abaRx === 'hist') carregarHistoricoReal();
}

async function carregarDetalhesPais(iso3) {
  if (cacheDetalhe[iso3]) return cacheDetalhe[iso3];
  const inds = {
    exp: 'NE.EXP.GNFS.CD', imp: 'NE.IMP.GNFS.CD', fdi: 'BX.KLT.DINV.CD.WD',
    res: 'FI.RES.TOTL.CD', divExt: 'DT.DOD.DECT.CD', divPub: 'GC.DOD.TOTL.GD.ZS'
  };
  const entries = await Promise.all(Object.entries(inds).map(async ([k, code]) => {
    try {
      const r = await fetch(`https://api.worldbank.org/v2/country/${iso3}/indicator/${code}?format=json&mrnev=1`);
      if (!r.ok) return [k, null];
      const j = await r.json();
      const row = Array.isArray(j[1]) && j[1][0] && j[1][0].value != null ? { v: +j[1][0].value, ano: j[1][0].date } : null;
      return [k, row];
    } catch { return [k, null]; }
  }));
  const obj = Object.fromEntries(entries);
  cacheDetalhe[iso3] = obj;
  return obj;
}

function cardKpi(titulo, valor, fonte, ano, status = 'Observado', cor = 'din-text-main') {
  return `<div class="din-secondary-bg border din-border rounded-lg p-3 flex flex-col justify-between">
    <span class="text-[11px] din-text-muted">${titulo}</span>
    <strong class="text-sm font-extrabold ${cor} mt-1">${valor}</strong>
    <span class="text-[9px] din-text-muted mt-1.5 block">${fonte}${ano ? ' · ' + ano : ''} · ${status}</span>
  </div>`;
}

async function selecionarPais(iso3) {
  const p = PAISES_MAP[iso3];
  if (!p) return;
  isoAtivo = iso3;
  atualizarBotaoVoltarMundo(true);

  const blocosPais = Object.entries(SETS.blocos).filter(([, list]) => list.includes(iso3)).map(([b]) => b.split(' (')[0]);
  $('rxBandImg').src = p.flag || '';
  $('rxNome').textContent = p.nome;
  $('rxIso').textContent = p.iso3;
  $('rxBlocos').textContent = blocosPais.length ? blocosPais.join(' · ') : p.cont;
  $('rxMeta').textContent = `${p.regiaoGeo} (${p.cont}) · Capital: ${p.cap}`;
  $('rxMoedaCod').textContent = p.moeda;
  $('rxMoedaBrl').textContent = p.moedaBRL != null ? BD.brl(p.moedaBRL, p.moedaBRL < 0.1 ? 4 : 2) : 'N/D';
  $('rxMoedaNome').textContent = `${p.mNome} (${p.moeda})`;
  $('rxPopArea').textContent = `População: ${BD.compactPop(p.pop)} (${p.popAno || 'ref.'})`;
  $('rxRegiaoBadge').textContent = p.regiaoGeo;
  $('rxVocacao').textContent = p.vocacao;

  const subiu = p.cresc != null && p.cresc >= 0;
  $('rxTendencia').innerHTML = p.cresc != null
    ? `PIB ${subiu ? '↑' : '↓'} <span class="${subiu ? 'din-green' : 'din-red'}">${subiu ? '+' : ''}${BD.num(p.cresc, 1)}%</span> <span class="text-[10px] din-text-muted font-normal">(${p.crescAno})</span>`
    : '<span class="din-text-muted">Cresc. N/D</span>';

  renderPizzaVocacao('pais', p.setores);
  pintarMapa();
  renderRanking();
  if (filtroValor !== 'Todos os países') atualizarResumoRegiao();

  $('gridMacro').innerHTML = `<div class="col-span-full text-xs din-text-muted py-4">Consultando Banco Mundial para ${p.nome}...</div>`;

  const det = await carregarDetalhesPais(iso3);
  const arrecEst = (p.pib != null && p.imposto != null) ? p.pib * (p.imposto / 100) : null;

  $('gridMacro').innerHTML = [
    cardKpi('PIB Nominal (US$)', BD.compactUSD(p.pib), 'Banco Mundial', p.pibAno, 'Observado', 'din-green'),
    cardKpi('PIB em PPC (US$ int.)', BD.compactUSD(p.pibPpc), 'Banco Mundial', p.pibPpcAno, 'Observado', 'din-green'),
    cardKpi('PIB per capita (US$)', BD.usd(p.pibPc, 0), 'Banco Mundial', p.pibPcAno, 'Observado'),
    cardKpi('Crescimento PIB (% a.a.)', p.cresc != null ? `${p.cresc >= 0 ? '+' : ''}${BD.num(p.cresc, 1)}%` : 'N/D', 'Banco Mundial', p.crescAno, 'Observado', subiu ? 'din-green' : 'din-red'),
    cardKpi('Inflação Anual (IPC %)', p.infla != null ? `${BD.num(p.infla, 1)}%` : 'N/D', 'Banco Mundial', p.inflaAno, 'Observado', 'din-red'),
    cardKpi('Carga Tributária (% PIB)', p.imposto != null ? `${BD.num(p.imposto, 1)}%` : 'N/D', 'Banco Mundial / OCDE', p.impostoAno, 'Observado'),
    cardKpi('Arrecadação Est. (US$)', BD.compactUSD(arrecEst), 'Calculado s/ PIB', p.impostoAno || p.pibAno, 'Estimado'),
    cardKpi('IED (Inv. Estrang. Direto)', BD.compactUSD(det.fdi?.v), 'Banco Mundial', det.fdi?.ano, 'Observado'),
    cardKpi('Reservas Cambiais (US$)', BD.compactUSD(det.res?.v), 'Banco Mundial / FMI', det.res?.ano, 'Observado'),
    cardKpi('Dívida Externa / Pública', det.divExt?.v ? BD.compactUSD(det.divExt.v) : (det.divPub?.v ? `${BD.num(det.divPub.v, 1)}% PIB` : 'N/D'), 'Banco Mundial / FMI', det.divExt?.ano || det.divPub?.ano, 'Observado')
  ].join('');

  renderComercio(p, det);
  renderSocial(p);
  if (abaRx === 'hist') carregarHistoricoReal();
}

function renderComercio(p, det = cacheDetalhe[p?.iso3]) {
  if (!p) return;
  const exp = det?.exp?.v ?? null, imp = det?.imp?.v ?? null;
  const saldo = (exp != null && imp != null) ? (exp - imp) : null;

  $('gridComercioKpi').innerHTML = [
    cardKpi('Exportações (bens e serviços)', BD.compactUSD(exp), 'Banco Mundial', det?.exp?.ano, 'Observado', 'din-green'),
    cardKpi('Importações (bens e serviços)', BD.compactUSD(imp), 'Banco Mundial', det?.imp?.ano, 'Observado', 'din-text-main'),
    cardKpi('Balança Comercial (Saldo)', BD.compactUSD(saldo), 'Calculado (Exp − Imp)', det?.exp?.ano, 'Calculado', saldo != null && saldo >= 0 ? 'din-green' : 'din-red')
  ].join('');

  const extra = COMERCIO_EXTRA[p.iso3];
  if (chartParceiros) chartParceiros.destroy();

  if (extra) {
    $('boxGrafParceiros').classList.remove('hidden');
    $('msgSemParceiros').classList.add('hidden');
    const c = BD.cor();
    chartParceiros = new Chart($('grafParceiros'), {
      type: 'bar',
      data: {
        labels: extra.parceiros.map(x => x[0]),
        datasets: [{ label: '% das exportações', data: extra.parceiros.map(x => x[1]), backgroundColor: '#16C784', borderRadius: 4 }]
      },
      options: {
        indexAxis: 'y', maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { ticks: { color: c.mu, callback: v => v + '%' }, grid: { color: c.grid } }, y: { ticks: { color: c.tx, font: { size: 11 } }, grid: { display: false } } }
      }
    });
    $('listaProdutosExp').innerHTML = extra.produtos.map((prod, i) =>
      `<li class="flex items-center gap-2"><span class="w-5 h-5 rounded-md din-card-bg border din-border flex items-center justify-center text-[10px] font-bold din-green">${i + 1}</span><span class="din-text-main">${prod}</span></li>`
    ).join('');
  } else {
    $('boxGrafParceiros').classList.add('hidden');
    $('msgSemParceiros').classList.remove('hidden');
    $('msgSemParceiros').textContent = 'Detalhamento bilateral disponível para as principais economias globais.';
    $('listaProdutosExp').innerHTML = `<li class="din-text-muted">Lista detalhada de pauta exportadora (UN Comtrade) disponível para as principais economias globais.</li>`;
  }
}

function renderSocial(p) {
  const faixaIdh = p.idh == null ? 'N/D' : p.idh >= 0.8 ? 'Muito Alto' : p.idh >= 0.7 ? 'Alto' : p.idh >= 0.55 ? 'Médio' : 'Baixo';
  $('gridSocial').innerHTML = [
    cardKpi('IDH (Desenv. Humano)', p.idh != null ? `${BD.num(p.idh, 3)} (${faixaIdh})` : 'N/D', 'PNUD', p.idhAno, 'Observado', 'din-green'),
    cardKpi('Índice de Gini (0 a 100)', p.gini != null ? BD.num(p.gini, 1) : 'N/D', 'Banco Mundial', p.giniAno, 'Observado'),
    cardKpi('População Total', BD.compactPop(p.pop), 'Banco Mundial', p.popAno, 'Observado')
  ].join('');
  $('rxResumoSocial').textContent = `O Índice de Gini mede a desigualdade de renda (0 = igualdade plena; 100 = desigualdade máxima). Para ${p.nome}, o último Gini observado pelo Banco Mundial é ${p.gini != null ? BD.num(p.gini, 1) + ' (' + p.giniAno + ')' : 'indisponível na série recente'}, com IDH de ${p.idh != null ? BD.num(p.idh, 3) : 'N/D'} (PNUD).`;
}

function setAbaRx(a) {
  abaRx = a;
  const map = { econ:'abaRxEcon', comercio:'abaRxComercio', social:'abaRxSocial', hist:'abaRxHist' };
  Object.entries(map).forEach(([k, id]) => {
    $(id).className = k === a
      ? 'py-1.5 rounded-md din-card-bg din-text-main border din-border transition cursor-pointer'
      : 'py-1.5 rounded-md din-text-muted transition cursor-pointer';
  });
  $('viewRxEcon').classList.toggle('hidden', a !== 'econ');
  $('viewRxComercio').classList.toggle('hidden', a !== 'comercio');
  $('viewRxSocial').classList.toggle('hidden', a !== 'social');
  $('viewRxHist').classList.toggle('hidden', a !== 'hist');
  if (a === 'hist') carregarHistoricoReal();
}

function atualizarControlesHist() {
  const isMoeda = $('histSerieTipo').value === 'moeda';
  $('histPeriodo').disabled = !isMoeda;
  $('histPeriodo').classList.toggle('opacity-50', !isMoeda);
}

function dataISO(diasAtras) {
  const d = new Date(); d.setDate(d.getDate() - diasAtras);
  return d.toISOString().slice(0, 10);
}

async function carregarHistoricoReal() {
  const p = isoAtivo ? PAISES_MAP[isoAtivo] : null;
  const serie = $('histSerieTipo').value;
  $('histExplicacao').textContent = 'Buscando série histórica oficial...';

  if (serie === 'moeda' || !p) {
    const dias = { '5d': 8, '1m': 30, '3m': 90, '2a': 730 }[$('histPeriodo').value] || 90;
    const isBrasilOuMundo = !p || p.moeda === 'BRL' || p.moeda === 'USD';
    const base = isBrasilOuMundo ? 'USD' : p.moeda;
    const sym = 'BRL';
    try {
      const r = await fetch(`https://api.frankfurter.dev/v1/${dataISO(dias)}..${dataISO(0)}?base=${base}&symbols=${sym}`);
      if (!r.ok) throw new Error('Moeda não coberta pelo BCE');
      const j = await r.json();
      const datas = Object.keys(j.rates).sort();
      ultimoHistReal = {
        titulo: isBrasilOuMundo ? 'USD/BRL — Dólar Americano em Reais (Referência Global)' : `${p.moeda}/BRL (BCE · Frankfurter)`,
        labels: datas.map(d => d.slice(8, 10) + '/' + d.slice(5, 7) + (dias > 100 ? '/' + d.slice(2, 4) : '')),
        valores: datas.map(d => j.rates[d][sym]),
        fmt: v => BD.brl(v, v < 0.1 ? 4 : 2),
        fonte: 'Banco Central Europeu (Frankfurter) · Série diária observada'
      };
      desenharHistoricoReal();
    } catch {
      if (chartHist) chartHist.destroy();
      $('histExplicacao').textContent = p
        ? `A moeda ${p.moeda} (${p.nome}) não possui série diária publicada pelo Banco Central Europeu (Frankfurter). Selecione PIB, População ou Inflação para ver a série histórica oficial do Banco Mundial.`
        : 'Selecione um país no mapa para consultar sua série histórica individual no Banco Mundial.';
    }
  } else {
    try {
      const r = await fetch(`https://api.worldbank.org/v2/country/${p.iso3}/indicator/${serie}?format=json&per_page=15`);
      if (!r.ok) throw new Error('WB');
      const j = await r.json();
      const rows = (j[1] || []).filter(x => x.value != null).reverse();
      if (!rows.length) throw new Error('vazio');
      const isUSD = ['NY.GDP.MKTP.CD','NY.GDP.MKTP.PP.CD','NE.EXP.GNFS.CD','NE.IMP.GNFS.CD'].includes(serie);
      ultimoHistReal = {
        titulo: `${$('histSerieTipo').selectedOptions[0].text.split(' (')[0]} — ${p.nome}`,
        labels: rows.map(x => x.date),
        valores: rows.map(x => +x.value),
        fmt: v => isUSD ? BD.compactUSD(v) : serie === 'SP.POP.TOTL' ? BD.compactPop(v) : BD.num(v, 2) + '%',
        fonte: `Banco Mundial (${serie}) · Série anual observada (${rows[0].date}–${rows[rows.length - 1].date})`
      };
      desenharHistoricoReal();
    } catch {
      if (chartHist) chartHist.destroy();
      $('histExplicacao').textContent = `Série histórica indisponível no Banco Mundial para ${p.nome} neste indicador.`;
    }
  }
}

function desenharHistoricoReal() {
  if (!ultimoHistReal) return;
  const { titulo, labels, valores, fmt, fonte } = ultimoHistReal;
  const tipo = $('histTipoGraf').value;
  const c = BD.cor();
  const ini = valores[0], fim = valores[valores.length - 1];
  const varPct = ini ? ((fim - ini) / Math.abs(ini)) * 100 : 0;

  $('histExplicacao').innerHTML = `<strong>${titulo}:</strong> de <strong>${fmt(ini)}</strong> para <strong>${fmt(fim)}</strong> (<strong class="${varPct >= 0 ? 'din-green' : 'din-red'}">${varPct >= 0 ? '+' : ''}${BD.num(varPct, 2)}%</strong>). <span class="din-text-muted">${fonte}.</span>`;

  if (chartHist) chartHist.destroy();
  chartHist = new Chart($('grafMiniPais'), {
    type: tipo === 'bar' ? 'bar' : 'line',
    data: {
      labels,
      datasets: [{
        label: titulo, data: valores,
        borderColor: '#16C784',
        backgroundColor: tipo === 'area' ? 'rgba(22,199,132,0.20)' : 'rgba(22,199,132,0.75)',
        fill: tipo === 'area', borderWidth: 2, pointRadius: tipo === 'bar' ? 0 : 2.5, borderRadius: tipo === 'bar' ? 3 : 0, tension: .2
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: x => ` ${fmt(x.parsed.y)}` } } },
      scales: {
        x: { ticks: { color: c.mu, maxTicksLimit: 10, font: { size: 10 } }, grid: { display: false } },
        y: { ticks: { color: c.mu, font: { size: 10 }, callback: v => fmt(v) }, grid: { color: c.grid } }
      }
    }
  });
}

function setTopN(n) {
  topN = n;
  const on = 'px-2.5 py-1 rounded-md din-card-bg din-text-main border din-border transition cursor-pointer';
  const off = 'px-2.5 py-1 rounded-md din-text-muted transition cursor-pointer';
  $('top5Btn').className = n === 5 ? on : off;
  $('top10Btn').className = n === 10 ? on : off;
  $('top20Btn').className = n === 20 ? on : off;
  renderRanking();
}

function renderRanking() {
  if (!PAISES.length) return;
  const m = $('rkMetrica').value;
  const key = m === 'inflaAsc' ? 'infla' : m === 'giniAsc' ? 'gini' : m;
  const asc = m === 'inflaAsc' || m === 'giniAsc';

  const lista = PAISES.filter(p => paisNoFiltro(p) && p[key] != null)
    .sort((a, b) => asc ? a[key] - b[key] : b[key] - a[key])
    .slice(0, topN);

  $('rkDescricao').textContent = `${$('rkMetrica').selectedOptions[0].text} · exibindo ${lista.length} países do filtro atual`;

  $('gridRanking').innerHTML = lista.map((p, i) => `
    <button type="button" onclick="alternarSelecaoPais('${p.iso3}')"
      class="text-left din-secondary-bg border rounded-lg p-3 hover:border-[#16C784] focus:outline-none transition cursor-pointer ${p.iso3 === isoAtivo ? 'border-[#16C784] ring-1 ring-[#16C784]' : 'din-border'}">
      <div class="flex items-center justify-between gap-1.5 text-[11px] din-text-muted">
        <span class="flex items-center gap-1.5 min-w-0">
          ${p.flag ? `<img src="${p.flag}" alt="${p.iso3}" class="w-4 h-3 object-cover rounded-[2px] border din-border shrink-0">` : ''}
          <span class="font-bold din-text-main truncate">#${i + 1} · ${p.nome}</span>
        </span>
        <span class="font-mono text-[10px] shrink-0">${p.iso3}</span>
      </div>
      <p class="text-sm font-extrabold din-green mt-1">${fmtInd(p, key)}</p>
      <span class="block text-[10px] din-text-muted mt-0.5 truncate">${p.regiaoGeo}</span>
    </button>
  `).join('');
}

function preencherSelectsComparador() {
  const opts = PAISES.map(p => `<option value="${p.iso3}">${p.nome} (${p.iso3})</option>`).join('');
  $('cmp1').innerHTML = opts;
  $('cmp2').innerHTML = opts;
  $('cmp3').innerHTML = `<option value="">Nenhum (comparar apenas 2)</option>` + opts;
  if (PAISES_MAP['BRA']) $('cmp1').value = 'BRA';
  if (PAISES_MAP['USA']) $('cmp2').value = 'USA';
  if (PAISES_MAP['CHN']) $('cmp3').value = 'CHN';
}

function renderComparadorMulti() {
  if (!PAISES.length) return;
  const ids = [$('cmp1').value, $('cmp2').value, $('cmp3').value].filter(Boolean);
  const esc = [...new Set(ids)].map(id => PAISES_MAP[id]).filter(Boolean);
  if (esc.length < 2) return;

  $('cmpThead').innerHTML = `<th class="py-2 px-2">Indicador</th>` + esc.map(p => `<th class="py-2 px-2 din-text-main">${p.nome} (${p.iso3})</th>`).join('');
  const linhas = [
    ['PIB Nominal', p => fmtInd(p, 'pib')],
    ['PIB em PPC', p => fmtInd(p, 'pibPpc')],
    ['PIB per capita', p => fmtInd(p, 'pibPc')],
    ['População', p => fmtInd(p, 'pop')],
    ['IDH (PNUD)', p => fmtInd(p, 'idh')],
    ['Índice de Gini', p => fmtInd(p, 'gini')],
    ['Inflação anual', p => fmtInd(p, 'infla')],
    ['Carga tributária', p => fmtInd(p, 'imposto')],
    ['Valor da moeda', p => `${p.moeda} · ${fmtInd(p, 'moedaBRL')}`],
    ['Crescimento PIB', p => fmtInd(p, 'cresc')]
  ];
  $('cmpTbody').innerHTML = linhas.map(([lbl, fn]) => `<tr><td class="py-2 px-2 font-semibold din-text-muted">${lbl}</td>${esc.map(p => `<td class="py-2 px-2 font-bold din-text-main">${fn(p)}</td>`).join('')}</tr>`).join('');

  const gm = $('compGrafMetrica').value, c = BD.cor();
  if (chartCmp) chartCmp.destroy();
  chartCmp = new Chart($('grafComparador'), {
    type: 'bar',
    data: {
      labels: esc.map(p => p.nome),
      datasets: [{ data: esc.map(p => p[gm] ?? 0), backgroundColor: ['#16C784', '#2563EB', '#F59E0B'].slice(0, esc.length), borderRadius: 5 }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: x => ` ${fmtInd(esc[x.dataIndex], gm)}` } } },
      scales: { x: { ticks: { color: c.tx, font: { size: 11 } }, grid: { display: false } }, y: { ticks: { color: c.mu, font: { size: 10 }, callback: v => (gm === 'pib' || gm === 'pibPpc') ? BD.compactUSD(v) : v }, grid: { color: c.grid } } }
    }
  });

  const mPib = [...esc].filter(p => p.pib).sort((a, b) => b.pib - a.pib)[0];
  const mPc = [...esc].filter(p => p.pibPc).sort((a, b) => b.pibPc - a.pibPc)[0];
  $('cmpAnalise').innerHTML = mPib && mPc
    ? `Entre os selecionados, <strong class="din-text-main">${mPib.nome}</strong> tem o maior PIB nominal (${BD.compactUSD(mPib.pib)}), enquanto <strong class="din-green">${mPc.nome}</strong> lidera em PIB per capita (${BD.usd(mPc.pibPc, 0)}).`
    : 'Selecione países com dados disponíveis para comparar.';
}

(() => {
  let temaSalvo = 'light';
  try { temaSalvo = localStorage.getItem('brasil_em_dados_tema') || 'light'; } catch {}
  aplicarTema(temaSalvo);
  setCategoriaFiltro('cont');
  atualizarControlesHist();
  iniciarMapaMundi();
  carregarBaseGlobal();
})();

window.addEventListener('tema', () => {
  pintarMapa();
  renderComparadorMulti();
  if (isoAtivo && PAISES_MAP[isoAtivo]) {
    renderPizzaVocacao('pais', PAISES_MAP[isoAtivo].setores);
    if (abaRx === 'comercio') renderComercio(PAISES_MAP[isoAtivo]);
  } else if (PAISES.length) {
    exibirConsolidadoGlobal();
  }
  atualizarResumoRegiao();
  if (abaRx === 'hist' && ultimoHistReal) desenharHistoricoReal();
});
