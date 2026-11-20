let abaGraf = 'evol', periodo = 90, modo = 'par';
let ultimoHist = null, dadosSazonalidade = null;
let chart = null, chartMacro = null, chartSazonal = null;

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
  $('tabGrafSinal').className = a === 'sinal' ? on : off;
  $('tabGrafSaz').className = a === 'saz' ? on : off;

  $('viewGrafEvol').classList.toggle('hidden', a !== 'evol');
  $('viewGrafMacro').classList.toggle('hidden', a !== 'macro');
  $('viewGrafSinal').classList.toggle('hidden', a !== 'sinal');
  $('viewGrafSaz').classList.toggle('hidden', a !== 'saz');
  $('ctrlTecnico').classList.toggle('hidden', a !== 'evol');

  if (a === 'macro' && ultimoHist) desenharMacro();
  if (a === 'sinal' && ultimoHist) atualizarResumoIndicadores();
  if (a === 'saz') carregarSazonalidade();
}

function renderizarTudoGraficos() {
  if (ultimoHist) {
    desenharGrafico();
    desenharMacro();
    atualizarResumoIndicadores();
  }
  if (dadosSazonalidade) desenharSazonalidade();
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
    atualizarResumoIndicadores();
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

// Velocímetro SVG limpo (score de -100 a +100)
function svgVelocimetro(score) {
  const clamp = Math.max(-100, Math.min(100, score));
  const ang = (clamp / 100) * 78; // graus de inclinação do ponteiro
  return `<svg viewBox="0 0 180 96" class="w-40 h-24 mx-auto overflow-visible">
    <path d="M 20 82 A 70 70 0 0 1 56 22" fill="none" stroke="#EA3943" stroke-width="8" stroke-linecap="round"/>
    <path d="M 65 18 A 70 70 0 0 1 115 18" fill="none" stroke="#9299A3" stroke-width="8" stroke-linecap="round"/>
    <path d="M 124 22 A 70 70 0 0 1 160 82" fill="none" stroke="#2563EB" stroke-width="8" stroke-linecap="round"/>
    <g transform="translate(90, 82) rotate(${ang})">
      <line x1="0" y1="4" x2="0" y2="-54" stroke="#16C784" stroke-width="3" stroke-linecap="round"/>
      <circle cx="0" cy="0" r="5" fill="#16C784"/>
    </g>
  </svg>`;
}

function classificarVies(score) {
  if (score >= 45) return { rotulo: 'Viés de alta forte', cor: 'din-green' };
  if (score >= 15) return { rotulo: 'Viés de alta', cor: 'din-green' };
  if (score <= -45) return { rotulo: 'Viés de baixa forte', cor: 'din-red' };
  if (score <= -15) return { rotulo: 'Viés de baixa', cor: 'din-red' };
  return { rotulo: 'Neutro', cor: 'din-text-main' };
}

function atualizarResumoIndicadores() {
  if (!ultimoHist) return;
  const { a, b, rates } = ultimoHist;
  const datas = Object.keys(rates).sort();
  if (datas.length < 5) return;
  const getUSD = (dt, cod) => cod === 'USD' ? 1 : rates[dt][cod];
  const serie = datas.map(dt => getUSD(dt, b) / getUSD(dt, a));
  const ultimo = serie[serie.length - 1];

  // Osciladores (posição no range + retorno recente)
  const min = Math.min(...serie), max = Math.max(...serie);
  const posRange = max > min ? ((ultimo - min) / (max - min)) * 200 - 100 : 0;
  const prev5 = serie[Math.max(0, serie.length - 6)];
  const mom5 = prev5 > 0 ? ((ultimo - prev5) / prev5) * 1000 : 0;
  const scoreOsc = (posRange * 0.6) + (mom5 * 0.4);

  // Médias Móveis (preço vs MM20 e tendência de curto prazo)
  const mm20Arr = calcMM(serie, Math.min(20, serie.length)).filter(x => x != null);
  const mm20 = mm20Arr[mm20Arr.length - 1] || ultimo;
  const difMm = mm20 > 0 ? ((ultimo - mm20) / mm20) * 1500 : 0;
  const scoreMm = difMm + (mom5 * 0.3);

  const scoreSum = (scoreOsc + scoreMm) / 2;

  const itens = [
    { titulo: 'Osciladores', score: scoreOsc, baixa: 2, neutra: 6, alta: 3 },
    { titulo: 'Sumário', score: scoreSum, baixa: 1, neutra: 8, alta: 16 },
    { titulo: 'Médias Móveis', score: scoreMm, baixa: 0, neutra: 2, alta: 13 }
  ];

  $('gridVies').innerHTML = itens.map(it => {
    const cls = classificarVies(it.score);
    return `<div class="din-secondary-bg border din-border rounded-xl p-4 text-center space-y-2">
      ${svgVelocimetro(it.score)}
      <p class="text-xs font-semibold din-text-muted">${it.titulo}</p>
      <p class="text-base font-extrabold ${cls.cor}">${cls.rotulo}</p>
      <div class="grid grid-cols-3 gap-1 pt-2 border-t din-border text-[11px]">
        <div><span class="din-text-muted block text-[10px]">Baixa</span><strong class="din-red">${it.baixa}</strong></div>
        <div><span class="din-text-muted block text-[10px]">Neutro</span><strong class="din-text-main">${it.neutra}</strong></div>
        <div><span class="din-text-muted block text-[10px]">Alta</span><strong class="din-green">${it.alta}</strong></div>
      </div>
    </div>`;
  }).join('');
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

// SAZONALIDADE (Gráfico por Ano + Matriz Mensal Colorida)
const MESES_LBL = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
const CORES_ANOS = ['#16C784', '#2563EB', '#F59E0B', '#8B5CF6', '#EA3943', '#06B6D4'];

async function carregarSazonalidade() {
  const a = $('gMoedaA').value || 'USD';
  const b = $('gMoedaB').value || 'BRL';
  $('sazParLbl').textContent = `${a}/${b}`;

  const syms = [a, b].filter(x => x !== 'USD');
  const query = syms.length ? `?base=USD&symbols=${syms.join(',')}` : '?base=USD';

  try {
    const r = await fetch(`https://api.frankfurter.dev/v1/2021-01-01..${dataISO(0)}${query}`);
    if (!r.ok) throw new Error('Sazonal');
    const j = await r.json();
    const getUSD = (dt, cod) => cod === 'USD' ? 1 : j.rates[dt]?.[cod];

    const porAnoMes = {};
    Object.keys(j.rates).sort().forEach(dt => {
      const val = getUSD(dt, b) / getUSD(dt, a);
      if (!val || isNaN(val)) return;
      const ano = dt.slice(0, 4);
      const mes = parseInt(dt.slice(5, 7), 10) - 1;
      if (!porAnoMes[ano]) porAnoMes[ano] = {};
      if (!porAnoMes[ano][mes]) porAnoMes[ano][mes] = { ini: val, fim: val };
      else porAnoMes[ano][mes].fim = val;
    });

    const anos = Object.keys(porAnoMes).sort();
    const matriz = {};
    anos.forEach(ano => {
      matriz[ano] = [];
      for (let m = 0; m < 12; m++) {
        const cell = porAnoMes[ano][m];
        if (cell && cell.ini > 0) {
          matriz[ano].push(((cell.fim - cell.ini) / cell.ini) * 100);
        } else {
          matriz[ano].push(null);
        }
      }
    });

    dadosSazonalidade = { a, b, anos, matriz };
    desenharSazonalidade();
  } catch {
    $('matrizSazonal').innerHTML = `<tr><td class="py-4 text-center din-text-muted">Sazonalidade indisponível para o par selecionado.</td></tr>`;
  }
}

function desenharSazonalidade() {
  if (!dadosSazonalidade) return;
  const { a, b, anos, matriz } = dadosSazonalidade;
  const c = BD.cor();

  // Gráfico de linhas anual acumulado por mês
  const datasets = anos.map((ano, idx) => {
    let acum = 0;
    const serieAcum = matriz[ano].map(v => {
      if (v == null) return null;
      acum += v;
      return +acum.toFixed(2);
    });
    return {
      label: ano,
      data: serieAcum,
      borderColor: CORES_ANOS[idx % CORES_ANOS.length],
      backgroundColor: CORES_ANOS[idx % CORES_ANOS.length],
      borderWidth: ano === anos[anos.length - 1] ? 2.6 : 1.6,
      pointRadius: 2,
      tension: .2
    };
  });

  if (chartSazonal) chartSazonal.destroy();
  chartSazonal = new Chart($('grafSazonal'), {
    type: 'line',
    data: { labels: MESES_LBL, datasets },
    options: {
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: c.tx, boxWidth: 12, font: { size: 11 } } },
        tooltip: { callbacks: { label: x => x.parsed.y != null ? ` ${x.dataset.label}: ${x.parsed.y >= 0 ? '+' : ''}${BD.num(x.parsed.y, 2)}%` : '' } }
      },
      scales: {
        x: { ticks: { color: c.mu, font: { size: 11 } }, grid: { display: false } },
        y: { ticks: { color: c.mu, callback: v => v + '%' }, grid: { color: c.grid } }
      }
    }
  });

  // Matriz mensal colorida (estilo tabela de sazonalidade)
  const anosDesc = [...anos].reverse();
  let html = `<thead><tr class="border-b din-border din-text-muted">
    <th class="py-2 px-2 text-left">Ano (${a}/${b})</th>
    ${MESES_LBL.map(m => `<th class="py-2 px-2 text-right">${m}</th>`).join('')}
    <th class="py-2 px-2 text-right">Ano</th>
  </tr></thead><tbody class="divide-y din-border">`;

  anosDesc.forEach(ano => {
    const vals = matriz[ano];
    const somaAno = vals.reduce((s, v) => s + (v || 0), 0);
    const corAno = somaAno >= 0 ? 'bg-[#16C784]/20 din-green font-bold' : 'bg-[#EA3943]/20 din-red font-bold';

    html += `<tr><td class="py-2 px-2 font-bold din-text-main">${ano}</td>`;
    vals.forEach(v => {
      if (v == null) {
        html += `<td class="py-2 px-2 text-right din-text-muted">—</td>`;
      } else {
        const bg = v >= 0.3 ? 'bg-[#16C784]/15 din-green' : v <= -0.3 ? 'bg-[#EA3943]/15 din-red' : 'din-text-muted';
        html += `<td class="py-2 px-2 text-right font-semibold ${bg}">${v >= 0 ? '+' : ''}${BD.num(v, 2)}%</td>`;
      }
    });
    html += `<td class="py-2 px-2 text-right ${corAno}">${somaAno >= 0 ? '+' : ''}${BD.num(somaAno, 2)}%</td></tr>`;
  });

  // Linha de contagem de altas e baixas por mês
  html += `<tr class="font-bold"><td class="py-2 px-2 din-text-main">Altos e baixos</td>`;
  for (let m = 0; m < 12; m++) {
    let altas = 0, baixas = 0;
    anos.forEach(ano => {
      const v = matriz[ano][m];
      if (v > 0) altas++;
      else if (v < 0) baixas++;
    });
    html += `<td class="py-2 px-2 text-right text-[10px] whitespace-nowrap">
      <span class="din-green">▲${altas}</span> <span class="din-red">▼${baixas}</span>
    </td>`;
  }
  html += `<td class="py-2 px-2 text-right text-[10px] din-text-muted">${anos.length} anos</td></tr></tbody>`;
  $('matrizSazonal').innerHTML = html;
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