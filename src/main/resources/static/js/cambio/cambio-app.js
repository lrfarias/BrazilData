const $ = i => document.getElementById(i);
const BD = {
  brl: (v, d = 2) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: d, maximumFractionDigits: d }),
  num: (v, d = 0) => v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }),
  cor: () => { const d = document.documentElement.getAttribute('data-theme') === 'dark'; return { tx: d ? '#F5F6F7' : '#17191C', mu: d ? '#9299A3' : '#737780', grid: d ? '#2B3036' : '#E5E7EB' }; }
};

// Controles do Cabeçalho
function toggleDropdownMenu() { $('dropdownMenu').classList.toggle('hidden'); }
window.addEventListener('click', e => {
  const btn = $('menuDropdownBtn'), menu = $('dropdownMenu');
  if (btn && menu && !btn.contains(e.target) && !menu.contains(e.target)) menu.classList.add('hidden');
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
  if (ultimoHist) {
    desenharGrafico();
    desenharMacro();
  }
}

function alternarModoApresentacao() {
  document.body.classList.toggle('modo-apresentacao');
  const ativo = document.body.classList.contains('modo-apresentacao');
  $('btnModoApresentacao').innerHTML = ativo
    ? '<span>✕ Sair da Tela Cheia</span>'
    : `<svg class="w-3.5 h-3.5 din-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke-width="2"></rect><line x1="8" y1="21" x2="16" y2="21" stroke-width="2"></line><line x1="12" y1="17" x2="12" y2="21" stroke-width="2"></line></svg><span>Modo Tela Cheia</span>`;
}

// Estado da Página
const nomeMoeda = new Intl.DisplayNames(['pt-BR'], { type: 'currency' });
const nomeCurto = c => { try { return nomeMoeda.of(c); } catch { return c; } };
const labelMoeda = c => `${c} — ${nomeCurto(c)}`;

const TOP5_GLOBAIS = [
  { c: 'USD', n: 'Dólar Americano', tag: '#1' },
  { c: 'EUR', n: 'Euro', tag: '#2' },
  { c: 'GBP', n: 'Libra Esterlina', tag: '#3' },
  { c: 'JPY', n: 'Iene Japonês', tag: '#4' },
  { c: 'CNY', n: 'Yuan Chinês', tag: '#5' }
];

const HIST_MOEDAS = ['USD','BRL','EUR','GBP','JPY','CNY','CHF','CAD','AUD','MXN','INR','KRW','ZAR','TRY','NZD','SEK','NOK','PLN'];
const MACRO_PARES = [
  { c: 'BRL', n: 'Real (BR)' },
  { c: 'MXN', n: 'Peso (MX)' },
  { c: 'ZAR', n: 'Rand (ZA)' },
  { c: 'INR', n: 'Rúpia (IN)' },
  { c: 'TRY', n: 'Lira (TR)' },
  { c: 'EUR', n: 'Euro (EU)' },
  { c: 'GBP', n: 'Libra (UK)' },
  { c: 'JPY', n: 'Iene (JP)' }
];

const RETRO_COMPARADORES = [
  { cod: 'USD', rotulo: 'Dólar (USD)', badgeBg: 'bg-[#EA3943]', badgeTxt: 'text-white' },
  { cod: 'EUR', rotulo: 'Euro (EUR)', badgeBg: 'bg-[#2563EB]', badgeTxt: 'text-white' },
  { cod: 'GBP', rotulo: 'Libra (GBP)', badgeBg: 'bg-[#0F766E]', badgeTxt: 'text-white' },
  { cod: 'CHF', rotulo: 'Franco Suíço (CHF)', badgeBg: 'bg-[#475569]', badgeTxt: 'text-white' },
  { cod: 'CAD', rotulo: 'Dólar Canadense (CAD)', badgeBg: 'bg-[#D97706]', badgeTxt: 'text-white' },
  { cod: 'AUD', rotulo: 'Dólar Australiano (AUD)', badgeBg: 'bg-[#16C784]', badgeTxt: 'text-white' }
];

let ratesUSD = {}, variacoesDia = [], retroRatesAntigas = null, retroDataRef = '';
let rankingModo = 'globais', abaConv = 'custo', abaGraf = 'evol';
let periodo = 90, modo = 'par';
let ultimoHist = null, chart = null, chartMacro = null;

function taxaCruzada(de, para) {
  if (!ratesUSD[de] || !ratesUSD[para]) return 0;
  return ratesUSD[para] / ratesUSD[de];
}

// 1. RANKING TOP 5
function setRanking(m) {
  rankingModo = m;
  const on = 'px-3 py-1 rounded-md din-card-bg din-text-main border din-border transition';
  const off = 'px-3 py-1 rounded-md din-text-muted transition';
  $('rkGlobais').className = m === 'globais' ? on : off;
  $('rkAltas').className = m === 'altas' ? on : off;
  $('rkBaixas').className = m === 'baixas' ? on : off;

  if (m === 'globais') $('rkSub').textContent = 'Ordem de relevância e liquidez internacional (FMI/BIS). Clique em um card para selecionar.';
  if (m === 'altas') $('rkSub').textContent = 'Top 5 moedas que mais se valorizaram frente ao Dólar no último pregão oficial (BCE).';
  if (m === 'baixas') $('rkSub').textContent = 'Top 5 moedas que mais se desvalorizaram frente ao Dólar no último pregão oficial (BCE).';
  renderTop5();
}

function renderTop5() {
  const multi = $('chkMultiConv').checked;
  const valDigitado = parseFloat(String($('convVal').value).replace(',', '.')) || 0;
  const moedaOrigem = $('convDe').value || 'BRL';

  let lista = [];
  if (rankingModo === 'globais') {
    lista = TOP5_GLOBAIS.map(m => {
      const vd = variacoesDia.find(x => x.c === m.c);
      return { c: m.c, n: m.n, tag: m.tag, varPct: vd ? vd.pct : null };
    });
  } else if (variacoesDia.length) {
    const ord = [...variacoesDia].sort((a, b) => rankingModo === 'altas' ? b.pct - a.pct : a.pct - b.pct);
    lista = ord.slice(0, 5).map((x, i) => ({ c: x.c, n: nomeCurto(x.c), tag: `#${i + 1}`, varPct: x.pct }));
  } else {
    $('top5').innerHTML = `<div class="col-span-full text-xs din-text-muted py-3">Carregando variações diárias do BCE...</div>`;
    return;
  }

  $('top5').innerHTML = lista.map(m => {
    let valorTxt = '—', parLbl = `${m.c}/BRL`;
    if (multi && valDigitado > 0) {
      const conv = valDigitado * taxaCruzada(moedaOrigem, m.c);
      const dec = conv < 10 ? 4 : 2;
      parLbl = `${BD.num(valDigitado, 0)} ${moedaOrigem} → ${m.c}`;
      valorTxt = conv ? `${BD.num(conv, dec)} ${m.c}` : '—';
    } else {
      const val = taxaCruzada(m.c, 'BRL');
      const dec = val < 0.1 ? 4 : 2;
      valorTxt = val ? BD.brl(val, dec) : '—';
    }

    const badgeVar = m.varPct !== null
      ? `<span class="font-bold ${m.varPct >= 0 ? 'din-green' : 'din-red'}">${m.varPct >= 0 ? '+' : ''}${BD.num(m.varPct, 2)}%</span>`
      : `<span>${m.tag}</span>`;

    return `<button type="button" onclick="selecionarPar('${m.c}','BRL')"
      class="text-left din-card-bg border din-border rounded-lg p-3.5 shadow-sm hover:border-[#16C784] transition">
      <div class="flex items-center justify-between text-[11px] din-text-muted gap-1">
        <span class="font-bold din-text-main truncate">${parLbl}</span>
        ${badgeVar}
      </div>
      <p class="text-base sm:text-lg font-extrabold din-green mt-1 truncate">${valorTxt}</p>
      <span class="block text-[11px] din-text-muted truncate">${m.n}</span>
    </button>`;
  }).join('');
}

async function carregarVariacoesDia() {
  try {
    const r = await fetch(`https://api.frankfurter.dev/v1/${dataISO(10)}..${dataISO(0)}?base=USD`);
    if (!r.ok) return;
    const j = await r.json();
    const datas = Object.keys(j.rates).sort();
    if (datas.length < 2) return;
    const prev = j.rates[datas[datas.length - 2]];
    const curr = j.rates[datas[datas.length - 1]];
    variacoesDia = Object.keys(curr).filter(c => prev[c] && curr[c]).map(c => ({
      c,
      pct: ((prev[c] / curr[c]) - 1) * 100
    }));
    renderTop5();
  } catch {}
}

// 2. CONVERSOR + CUSTO REAL + DETECTOR DE SPREAD
function setAbaConv(a) {
  abaConv = a;
  const on = 'px-3 py-1 rounded-md din-card-bg din-text-main border din-border transition';
  const off = 'px-3 py-1 rounded-md din-text-muted transition';
  $('tabCusto').className = a === 'custo' ? on : off;
  $('tabSpread').className = a === 'spread' ? on : off;
  $('viewCusto').classList.toggle('hidden', a !== 'custo');
  $('viewSpread').classList.toggle('hidden', a !== 'spread');
  $('custoHint').textContent = a === 'custo'
    ? 'Simulação de IOF + spread médio por canal'
    : 'Compare a taxa comercial com a cotação oferecida pelo seu banco';
}

function selecionarPar(a, b) {
  $('convDe').value = a;
  $('convPara').value = b;
  converter();
  if (HIST_MOEDAS.includes(a) && HIST_MOEDAS.includes(b)) {
    $('gMoedaA').value = a;
    $('gMoedaB').value = b;
    carregarGrafico();
  }
}

function converter() {
  const val = parseFloat(String($('convVal').value).replace(',', '.')) || 0;
  const de = $('convDe').value, para = $('convPara').value;
  const tx = taxaCruzada(de, para);
  if (!tx) return;
  const res = val * tx;
  const dec = tx < 0.1 ? 4 : 2;
  $('convRes').textContent = `${BD.num(res, dec)} ${para}`;
  $('convTaxa').textContent = `1 ${de} = ${BD.num(tx, 4)} ${para}`;
  $('convInverso').textContent = `1 ${para} = ${BD.num(1 / tx, 4)} ${de}`;
  $('lblParSpread').textContent = `${de}/${para}`;

  renderCustoReal(val, de, para, tx);
  auditarSpread();
  renderRetrospectivo();
  if ($('chkMultiConv').checked) renderTop5();
}

function renderCustoReal(val, de, para, tx) {
  const comprandoComBRL = (de === 'BRL' && para !== 'BRL');
  const canais = [
    { n: 'Comercial (Ref.)', extra: 0, desc: 'Sem taxas / referência', cor: 'din-green' },
    { n: 'Conta Global', extra: 0.026, desc: 'IOF 1,1% + spread ~1,5%', cor: 'din-text-main' },
    { n: 'Cartão de Crédito', extra: 0.064, desc: 'IOF + spread ~4%', cor: 'din-text-main' },
    { n: 'Casa de Câmbio', extra: 0.071, desc: 'Espécie + spread ~6%', cor: 'din-red' }
  ];
  const base = val * tx;
  const dec = base < 10 ? 4 : 2;

  $('viewCusto').innerHTML = canais.map(c => {
    const efetivo = comprandoComBRL ? base / (1 + c.extra) : base * (1 + c.extra);
    const dif = Math.abs(efetivo - base);
    const subDif = c.extra === 0
      ? 'Base de mercado'
      : (comprandoComBRL ? `-${BD.num(dif, dec)} ${para}` : `+${BD.num(dif, dec)} ${para}`);
    return `<div class="din-secondary-bg border din-border rounded-lg p-3">
      <span class="text-[11px] font-semibold din-text-main block">${c.n}</span>
      <p class="text-sm font-extrabold ${c.cor} mt-1">${BD.num(efetivo, dec)} ${para}</p>
      <div class="flex justify-between items-center text-[10px] din-text-muted mt-1">
        <span>${c.desc}</span>
        <span class="font-semibold">${subDif}</span>
      </div>
    </div>`;
  }).join('');
}

function auditarSpread() {
  const val = parseFloat(String($('convVal').value).replace(',', '.')) || 0;
  const de = $('convDe').value, para = $('convPara').value;
  const tx = taxaCruzada(de, para);
  const txBanco = parseFloat(String($('inpBanco').value).replace(',', '.'));

  if (!tx || !txBanco || txBanco <= 0) {
    $('resSpread').innerHTML = `Digite a taxa que o banco te passou para descobrir o <strong class="din-text-main">spread oculto (%)</strong> e quanto você perde ou economiza nessa operação.`;
    return;
  }

  const spreadPct = ((txBanco - tx) / tx) * 100;
  const difTotal = val * (txBanco - tx);
  const absSpread = Math.abs(spreadPct);
  const cor = spreadPct > 2 ? 'din-red' : spreadPct > 0 ? 'text-[#F59E0B]' : 'din-green';

  if (spreadPct >= 0) {
    $('resSpread').innerHTML = `Spread oculto de <strong class="${cor}">+${BD.num(absSpread, 2)}%</strong> acima do comercial (${BD.num(tx, 4)}). Para <strong>${BD.num(val, 2)} ${de}</strong>, você paga <strong class="${cor}">${BD.num(Math.abs(difTotal), 2)} ${para}</strong> a mais que a cotação de mercado.`;
  } else {
    $('resSpread').innerHTML = `Cotação <strong class="din-green">${BD.num(absSpread, 2)}% abaixo</strong> do comercial (${BD.num(tx, 4)}). Se estiver <em>comprando</em>, é vantagem; se estiver <em>vendendo/recebendo</em>, esse é o deságio de <strong>${BD.num(Math.abs(difTotal), 2)} ${para}</strong> retido pela instituição.`;
  }
}

function inverterConv() {
  const a = $('convDe').value;
  $('convDe').value = $('convPara').value;
  $('convPara').value = a;
  converter();
}

// 2.5 SIMULADOR RETROSPECTIVO ("Se você tivesse convertido há X tempo")
async function carregarRetrospectivo() {
  const dias = parseInt($('retroPeriodo').value, 10) || 365;
  const alvo = dataISO(dias);
  $('retroStatus').textContent = `Base histórica: ${alvo}`;

  try {
    const r = await fetch(`https://api.frankfurter.dev/v1/${alvo}`);
    if (!r.ok) throw new Error('Retro');
    const j = await r.json();
    // Frankfurter baseia-se em EUR quando sem ?base=...
    const eurRates = { EUR: 1, ...(j.rates || {}) };
    retroRatesAntigas = eurRates;
    retroDataRef = j.date || alvo;
    $('retroStatus').textContent = `Cotação de referência: ${retroDataRef} (BCE)`;
    renderRetrospectivo();
  } catch {
    $('retroStatus').textContent = 'Histórico antigo indisponível para o período';
  }
}

function taxaHistorica(de, para) {
  if (!retroRatesAntigas || !retroRatesAntigas[de] || !retroRatesAntigas[para]) return 0;
  return retroRatesAntigas[para] / retroRatesAntigas[de];
}

function renderRetrospectivo() {
  if (!retroRatesAntigas || !Object.keys(ratesUSD).length) return;
  const val = parseFloat(String($('convVal').value).replace(',', '.')) || 1000;
  const de = $('convDe').value || 'BRL';
  const para = $('convPara').value || 'USD';

  const txHoje = taxaCruzada(de, para);
  const txAntiga = taxaHistorica(de, para);

  if (txHoje && txAntiga) {
    // Se comprava 'para' com 'de' há X tempo: unidades adquiridas * cotação atual em 'de'
    const unidadesCompradas = val * txAntiga;
    const valorHojeEmDe = unidadesCompradas / txHoje;
    const varPct = ((valorHojeEmDe - val) / val) * 100;
    const corVar = varPct >= 0 ? 'din-green' : 'din-red';

    $('retroDestaque').innerHTML = `Se você tivesse convertido <strong>${BD.num(val, 2)} ${de}</strong> em <strong>${para}</strong> em <strong>${retroDataRef}</strong>, hoje equivaleria a <strong class="${corVar}">${BD.num(valorHojeEmDe, 2)} ${de}</strong> (<strong class="${corVar}">${varPct >= 0 ? '+' : ''}${BD.num(varPct, 2)}%</strong>).`;
  } else {
    $('retroDestaque').textContent = `Simulação histórica para ${de}/${para} disponível nas moedas cobertas pelo BCE.`;
  }

  $('retroLista').innerHTML = RETRO_COMPARADORES.map(item => {
    if (item.cod === de) return '';
    const txA = taxaHistorica(de, item.cod);
    const txH = taxaCruzada(de, item.cod);
    if (!txA || !txH) return '';

    const unid = val * txA;
    const hojeEmOrigem = unid / txH;
    const pct = ((hojeEmOrigem - val) / val) * 100;
    const cor = pct >= 0 ? 'din-green' : 'din-red';

    return `<div class="flex flex-wrap items-center justify-between gap-2 py-2.5 px-3 rounded-lg din-secondary-bg border din-border text-xs">
      <div class="flex items-center gap-3 min-w-0">
        <span class="w-14 text-center py-1 rounded font-extrabold text-[11px] ${item.badgeBg} ${item.badgeTxt} shrink-0">${item.cod}</span>
        <span class="din-text-main truncate">
          <strong>${BD.num(val, 2)} ${de}</strong> em <strong>${item.cod}</strong> equivaleria hoje a <strong>${BD.num(hojeEmOrigem, 2)} ${de}</strong>
        </span>
      </div>
      <span class="font-bold ${cor} shrink-0">${pct >= 0 ? '+' : ''}${BD.num(pct, 2)}%</span>
    </div>`;
  }).join('');
}

async function carregarTaxasAoVivo(inicial = false) {
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!r.ok) throw new Error('API Live');
    const j = await r.json();
    ratesUSD = j.rates;

    if (inicial) {
      const cods = Object.keys(ratesUSD).sort();
      $('qtdMoedas').textContent = `${cods.length} moedas disponíveis`;
      const opts = cods.map(c => `<option value="${c}">${labelMoeda(c)}</option>`).join('');
      $('convDe').innerHTML = opts;
      $('convPara').innerHTML = opts;
      $('convDe').value = 'BRL';
      $('convPara').value = 'USD';
    }

    renderTop5();
    converter();
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    $('statusLive').textContent = `Atualizado às ${hora} (auto 60s)`;
  } catch {
    $('statusLive').textContent = 'Erro ao atualizar cotações';
  }
}

// 3. GRÁFICO HISTÓRICO, RADAR, CAMADA TÉCNICA, TERMÔMETRO MACRO E CSV
function setPeriodo(d) {
  periodo = d;
  const on = 'py-1.5 rounded-md din-card-bg din-text-main border din-border transition';
  const off = 'py-1.5 rounded-md din-text-muted transition';
  $('p30').className = d === 30 ? on : off;
  $('p90').className = d === 90 ? on : off;
  $('p365').className = d === 365 ? on : off;
  $('macroDias').textContent = d;
  carregarGrafico();
}

function setModo(m) {
  modo = m;
  const on = 'py-1.5 rounded-md din-card-bg din-text-main border din-border transition';
  const off = 'py-1.5 rounded-md din-text-muted transition';
  $('mPar').className = m === 'par' ? on : off;
  $('mBase').className = m === 'base100' ? on : off;
  $('boxRadar').classList.toggle('hidden', m !== 'par');
  if (ultimoHist) desenharGrafico();
}

function setAbaGraf(a) {
  abaGraf = a;
  const on = 'px-3 py-1.5 rounded-md din-card-bg din-text-main border din-border transition';
  const off = 'px-3 py-1.5 rounded-md din-text-muted transition';
  $('tabGrafEvol').className = a === 'evol' ? on : off;
  $('tabGrafMacro').className = a === 'macro' ? on : off;
  $('viewGrafEvol').classList.toggle('hidden', a !== 'evol');
  $('viewGrafMacro').classList.toggle('hidden', a !== 'macro');
  $('ctrlTecnico').classList.toggle('hidden', a !== 'evol');
  if (a === 'macro' && ultimoHist) desenharMacro();
}

function dataISO(diasAtras) {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  return d.toISOString().slice(0, 10);
}

async function carregarGrafico() {
  const a = $('gMoedaA').value, b = $('gMoedaB').value;
  const ini = dataISO(periodo), fim = dataISO(0);
  const todosSyms = [...new Set([a, b, ...MACRO_PARES.map(m => m.c)])].filter(x => x !== 'USD');

  try {
    const r = await fetch(`https://api.frankfurter.dev/v1/${ini}..${fim}?base=USD&symbols=${todosSyms.join(',')}`);
    if (!r.ok) throw new Error('Frankfurter');
    const j = await r.json();
    ultimoHist = { a, b, rates: j.rates };
    desenharGrafico();
    desenharMacro();
  } catch {
    $('leituraGraf').textContent = 'Não foi possível carregar o histórico para este par no momento.';
  }
}

function calcVolatilidade(serie) {
  const ret = [];
  for (let i = 1; i < serie.length; i++) {
    if (serie[i - 1] > 0) ret.push((serie[i] - serie[i - 1]) / serie[i - 1]);
  }
  if (ret.length < 2) return 0;
  const media = ret.reduce((s, x) => s + x, 0) / ret.length;
  const varc = ret.reduce((s, x) => s + Math.pow(x - media, 2), 0) / (ret.length - 1);
  return Math.sqrt(varc) * 100;
}

function calcMM(serie, janela) {
  return serie.map((_, i) => {
    if (i < janela - 1) return null;
    let s = 0;
    for (let k = i - janela + 1; k <= i; k++) s += serie[k];
    return s / janela;
  });
}

function atualizarRadar(atual, min, max) {
  const pct = max > min ? ((atual - min) / (max - min)) * 100 : 50;
  $('radarPin').style.left = `${Math.max(2, Math.min(98, pct))}%`;
  $('rMin').textContent = BD.num(min, 3);
  $('rMax').textContent = BD.num(max, 3);
  $('rAtual').textContent = `Hoje: ${BD.num(atual, 3)}`;

  const badge = $('radarBadge');
  if (pct <= 30) {
    badge.textContent = `Barato (${BD.num(pct, 0)}% do range)`;
    badge.className = 'text-[10px] font-bold px-2 py-0.5 rounded bg-[#16C784]/15 din-green';
  } else if (pct >= 70) {
    badge.textContent = `Caro (${BD.num(pct, 0)}% do range)`;
    badge.className = 'text-[10px] font-bold px-2 py-0.5 rounded bg-[#EA3943]/15 din-red';
  } else {
    badge.textContent = `Neutro (${BD.num(pct, 0)}% do range)`;
    badge.className = 'text-[10px] font-bold px-2 py-0.5 rounded din-secondary-bg din-text-muted';
  }
}

function desenharGrafico() {
  const { a, b, rates } = ultimoHist;
  const datas = Object.keys(rates).sort();
  const getUSD = (dt, cod) => cod === 'USD' ? 1 : rates[dt][cod];
  const labels = datas.map(d => d.slice(8, 10) + '/' + d.slice(5, 7));
  const c = BD.cor();
  const showMM20 = $('chkMM20').checked, showMedia = $('chkMedia').checked;

  if (chart) chart.destroy();

  if (modo === 'par') {
    const serie = datas.map(dt => getUSD(dt, b) / getUSD(dt, a));
    const ini = serie[0], fim = serie[serie.length - 1];
    const variacao = ((fim - ini) / ini) * 100;
    const max = Math.max(...serie), min = Math.min(...serie);
    const media = serie.reduce((s, x) => s + x, 0) / serie.length;
    const vol = calcVolatilidade(serie);

    $('titGraf').textContent = `Par direto: ${a}/${b} (${periodo} dias)`;
    $('subGraf').textContent = `Quanto 1 ${a} comprou em ${b} ao longo do período`;
    $('mVar').innerHTML = `<span class="${variacao >= 0 ? 'din-green' : 'din-red'}">${variacao >= 0 ? '+' : ''}${BD.num(variacao, 2)}%</span>`;
    $('mVol').textContent = `${BD.num(vol, 2)}%`;
    $('mMax').textContent = BD.num(max, 4);
    $('mMin').textContent = BD.num(min, 4);
    atualizarRadar(fim, min, max);

    const dir = variacao >= 0 ? `se valorizou` : `se desvalorizou`;
    $('leituraGraf').innerHTML = `Nos últimos <strong>${periodo} dias</strong>, o <strong>${a}</strong> ${dir} <strong>${BD.num(Math.abs(variacao), 2)}%</strong> frente ao <strong>${b}</strong> (média de ${BD.num(media, 4)} e volatilidade diária de <strong>${BD.num(vol, 2)}%</strong>).`;

    const datasets = [{
      label: `${a}/${b}`,
      data: serie,
      borderColor: '#16C784',
      backgroundColor: 'rgba(22,199,132,0.10)',
      fill: true,
      borderWidth: 2,
      pointRadius: 0,
      tension: .15
    }];
    if (showMM20) datasets.push({ label: 'MM20', data: calcMM(serie, 20), borderColor: '#F59E0B', borderWidth: 1.7, pointRadius: 0, tension: .2 });
    if (showMedia) datasets.push({ label: 'Média do período', data: serie.map(() => media), borderColor: '#9299A3', borderDash: [5, 4], borderWidth: 1.4, pointRadius: 0 });

    chart = new Chart($('grafMoedas'), {
      type: 'line',
      data: { labels, datasets },
      options: opcoesGrafico(c, v => BD.num(v, 4))
    });
  } else {
    const invA = datas.map(dt => 1 / getUSD(dt, a));
    const invB = datas.map(dt => 1 / getUSD(dt, b));
    const baseA = invA.map(v => (v / invA[0]) * 100);
    const baseB = invB.map(v => (v / invB[0]) * 100);

    const varA = baseA[baseA.length - 1] - 100;
    const varB = baseB[baseB.length - 1] - 100;
    const volA = calcVolatilidade(baseA);

    $('titGraf').textContent = `Desempenho relativo: ${a} vs ${b} (Base 100 · vs USD)`;
    $('subGraf').textContent = `Ambas partem de 100 no dia inicial. Acima de 100 = valorização frente ao Dólar.`;
    $('mVar').innerHTML = `${a}: <span class="${varA >= 0 ? 'din-green' : 'din-red'}">${varA >= 0 ? '+' : ''}${BD.num(varA, 1)}%</span>`;
    $('mVol').textContent = `${BD.num(volA, 2)}% (${a})`;
    $('mMax').textContent = BD.num(Math.max(...baseA, ...baseB), 1);
    $('mMin').textContent = BD.num(Math.min(...baseA, ...baseB), 1);

    const venc = varA >= varB ? a : b;
    $('leituraGraf').innerHTML = `Em <strong>${periodo} dias</strong> frente ao Dólar, <strong>${venc}</strong> teve melhor performance: <strong>${a}</strong> variou <strong>${varA >= 0 ? '+' : ''}${BD.num(varA, 2)}%</strong> e <strong>${b}</strong> variou <strong>${varB >= 0 ? '+' : ''}${BD.num(varB, 2)}%</strong>.`;

    const datasets = [
      { label: `${a} (Base 100)`, data: baseA, borderColor: '#16C784', borderWidth: 2, pointRadius: 0, tension: .15 },
      { label: `${b} (Base 100)`, data: baseB, borderColor: '#2563EB', borderWidth: 2, pointRadius: 0, tension: .15 }
    ];
    if (showMedia) datasets.push({ label: 'Linha Base (100)', data: baseA.map(() => 100), borderColor: '#9299A3', borderDash: [5, 4], borderWidth: 1.3, pointRadius: 0 });

    chart = new Chart($('grafMoedas'), {
      type: 'line',
      data: { labels, datasets },
      options: opcoesGrafico(c, v => BD.num(v, 2))
    });
  }
}

function desenharMacro() {
  if (!ultimoHist) return;
  const { rates } = ultimoHist;
  const datas = Object.keys(rates).sort();
  if (datas.length < 2) return;
  const ini = rates[datas[0]], fim = rates[datas[datas.length - 1]];

  const dados = MACRO_PARES.filter(m => ini[m.c] && fim[m.c]).map(m => ({
    ...m,
    pct: ((ini[m.c] / fim[m.c]) - 1) * 100
  })).sort((a, b) => b.pct - a.pct);

  const brl = dados.find(d => d.c === 'BRL');
  const outros = dados.filter(d => d.c !== 'BRL');
  const mediaOutros = outros.reduce((s, x) => s + x.pct, 0) / (outros.length || 1);

  if (brl) {
    const diff = brl.pct - mediaOutros;
    const msg = Math.abs(diff) < 1.2
      ? `O <strong>Real (${brl.pct >= 0 ? '+' : ''}${BD.num(brl.pct, 2)}%)</strong> acompanhou de perto a média das moedas globais (${mediaOutros >= 0 ? '+' : ''}${BD.num(mediaOutros, 2)}%) — movimento majoritariamente externo do Dólar.`
      : diff > 0
        ? `O <strong>Real (${brl.pct >= 0 ? '+' : ''}${BD.num(brl.pct, 2)}%)</strong> teve desempenho <strong>${BD.num(diff, 2)} p.p. superior</strong> à média dos pares (${mediaOutros >= 0 ? '+' : ''}${BD.num(mediaOutros, 2)}%), mostrando força relativa.`
        : `O <strong>Real (${brl.pct >= 0 ? '+' : ''}${BD.num(brl.pct, 2)}%)</strong> ficou <strong>${BD.num(Math.abs(diff), 2)} p.p. atrás</strong> da média dos pares (${mediaOutros >= 0 ? '+' : ''}${BD.num(mediaOutros, 2)}%), sinalizando pressão doméstica além do Dólar global.`;
    $('macroVeredito').innerHTML = msg;
  }

  const c = BD.cor();
  if (chartMacro) chartMacro.destroy();
  chartMacro = new Chart($('grafMacro'), {
    type: 'bar',
    data: {
      labels: dados.map(d => d.n),
      datasets: [{
        label: 'Variação vs USD (%)',
        data: dados.map(d => +d.pct.toFixed(2)),
        backgroundColor: dados.map(d => d.c === 'BRL' ? (d.pct >= 0 ? '#16C784' : '#EA3943') : (d.pct >= 0 ? 'rgba(22,199,132,0.55)' : 'rgba(234,57,67,0.55)')),
        borderColor: dados.map(d => d.c === 'BRL' ? (d.pct >= 0 ? '#16C784' : '#EA3943') : 'transparent'),
        borderWidth: 2,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: x => ` ${x.parsed.x >= 0 ? '+' : ''}${BD.num(x.parsed.x, 2)}% frente ao USD` } }
      },
      scales: {
        x: { ticks: { color: c.mu, callback: v => v + '%' }, grid: { color: c.grid } },
        y: { ticks: { color: c.tx, font: { size: 11, weight: '600' } }, grid: { display: false } }
      }
    }
  });
}

function exportarCSV() {
  if (!ultimoHist) return;
  const { a, b, rates } = ultimoHist;
  const datas = Object.keys(rates).sort();
  const getUSD = (dt, cod) => cod === 'USD' ? 1 : rates[dt][cod];
  const linhas = ['Data;Par;Cotacao;Retorno_Diario_%'];
  let prev = null;
  datas.forEach(dt => {
    const val = getUSD(dt, b) / getUSD(dt, a);
    const ret = prev ? (((val - prev) / prev) * 100).toFixed(4) : '';
    linhas.push(`${dt};${a}/${b};${val.toFixed(6)};${ret}`);
    prev = val;
  });
  const blob = new Blob(['\uFEFF' + linhas.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `brasilemdados_${a}_${b}_${periodo}d.csv`;
  link.click();
}

function opcoesGrafico(c, fmt) {
  return {
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { labels: { color: c.tx, boxWidth: 12, font: { size: 11 } } },
      tooltip: { callbacks: { label: x => ` ${x.dataset.label}: ${fmt(x.parsed.y)}` } }
    },
    scales: {
      x: { ticks: { color: c.mu, maxTicksLimit: 8 }, grid: { display: false } },
      y: { ticks: { color: c.mu, callback: v => fmt(v) }, grid: { color: c.grid } }
    }
  };
}

// Inicialização
(() => {
  let temaSalvo = 'light';
  try { temaSalvo = localStorage.getItem('brasil_em_dados_tema') || 'light'; } catch {}
  aplicarTema(temaSalvo);

  const optsHist = HIST_MOEDAS.map(c => `<option value="${c}">${labelMoeda(c)}</option>`).join('');
  $('gMoedaA').innerHTML = optsHist;
  $('gMoedaB').innerHTML = optsHist;
  $('gMoedaA').value = 'USD';
  $('gMoedaB').value = 'BRL';

  carregarTaxasAoVivo(true);
  carregarVariacoesDia();
  carregarGrafico();
  carregarRetrospectivo();
  setInterval(() => carregarTaxasAoVivo(false), 60000);
})();