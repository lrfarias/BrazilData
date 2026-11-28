(() => {
  const css = `:root{--bg:#fff;--card:#F7F8FA;--sec:#F0F2F5;--tx:#17191C;--mu:#737780;--bd:#E5E7EB;--gr:#16C784;--rd:#EA3943}
[data-theme=dark]{--bg:#101214;--card:#191C20;--sec:#22262B;--tx:#F5F6F7;--mu:#9299A3;--bd:#2B3036}
body{background:var(--bg);color:var(--tx)}
.din-card-bg{background:var(--card)}.din-secondary-bg{background:var(--sec)}
.din-text-main{color:var(--tx)}.din-text-muted{color:var(--mu)}
.din-border{border-color:var(--bd)!important}.din-green{color:var(--gr)}.din-red{color:var(--rd)}
.din-btn{background:var(--gr);color:#fff}.din-btn:hover{opacity:.9}
.bd-nav-ativo,.bd-tab.ativo{background:var(--gr)!important;color:#fff!important;border-color:var(--gr)!important;box-shadow:0 2px 8px rgba(22,199,132,.28)}
.bd-tab{background:var(--sec);color:var(--mu);border:1px solid var(--bd);transition:all 150ms ease;cursor:pointer}
.bd-tab:hover{color:var(--tx);border-color:var(--gr)}
.din-secondary-bg > button.din-card-bg,
.din-secondary-bg > [role="tab"].din-card-bg,
[role="tablist"] [aria-selected="true"],
[role="tablist"] .ativo,
[role="tablist"] .active,
.tabs button.ativo,
.tab-btn.ativo,
button[data-tab].ativo,
button[data-aba].ativo,
button[data-modo].ativo,
button[data-filtro].ativo,
button[data-rank].ativo,
.bg-white.rounded-lg,
.bg-white.rounded-xl,
.grid > button.bg-white,
.flex > button.bg-white{background:var(--gr)!important;color:#fff!important;border-color:var(--gr)!important;box-shadow:0 2px 8px rgba(22,199,132,.28)}
.din-secondary-bg > button.din-card-bg *,
.din-secondary-bg > [role="tab"].din-card-bg *,
.grid > button.bg-white *,
.flex > button.bg-white *{color:#fff!important}

/* Borda verde simples (sem contorno duplo) em botões, abas e selects */
button:hover,
[role="button"]:hover,
[role="tab"]:hover,
select:hover,
summary:hover,
.card-hover:hover,
.card-roleta:hover{
  border-color:var(--gr)!important;
  outline:none!important;
  box-shadow:none!important;
}

/* Links comuns: sem borda dupla */
a[href]:hover{
  outline:none!important;
  box-shadow:none!important;
}

/* Itens de lista e menu: sem borda e texto verde no hover */
#bdMenu a,
#bdMenu button,
nav a,
footer a,
li a,
li button{
  border:none!important;
  outline:none!important;
  box-shadow:none!important;
}
#bdMenu a:hover,
#bdMenu button:hover,
li a:hover,
li button:hover{
  color:var(--gr)!important;
  border:none!important;
  outline:none!important;
  box-shadow:none!important;
}

button,
[role="button"],
[role="tab"],
select,
a[href],
summary,
.card-hover,
.card-roleta{
  transition:border-color 150ms ease,color 150ms ease,opacity 150ms ease,transform 150ms ease;
}

/* Evita corte da borda superior quando o card sobe no hover dentro do carrossel */
#carrosselFerramentas{padding-top:6px;padding-bottom:8px;scroll-padding-top:6px}

.inp{background:var(--sec);border:1px solid var(--bd);color:var(--tx);border-radius:.5rem;padding:.5rem .75rem;width:100%;font-size:.875rem}
.inp:focus-visible,button:focus-visible,a:focus-visible,select:focus-visible{outline:2px solid var(--gr);outline-offset:2px}
select option{background:var(--card);color:var(--tx)}
th.s{cursor:pointer;user-select:none}th.s:hover{color:var(--gr)}
.tabular-nums{font-variant-numeric:tabular-nums}
.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const isFile = location.protocol === 'file:';
  const rota = slug => {
    const raw = String(slug || '');
    const [caminho, hash] = raw.split('#');
    const limpo = caminho.replace(/^\/|\.html$/g, '');
    const base = (!limpo || limpo === 'index')
      ? (isFile ? 'index.html' : '/')
      : (isFile ? `${limpo}.html` : `/${limpo}`);
    return hash ? `${base}#${hash}` : base;
  };

  // Detecta automaticamente o contexto da página (ou respeita data-badge / data-sub)
  const elHdr = document.getElementById('bd-header');
  const ctxStr = (location.pathname + ' ' + document.title).toLowerCase();

  let autoBadge = 'DADOS ABERTOS';
  let autoSub = 'Terminal de Inteligência Econômica e Setorial';
  if (/infla|ipca|igpm|poder/.test(ctxStr)) {
    autoBadge = 'BCB · IBGE';
    autoSub = 'Inflação Oficial (IPCA/IGP-M) & Poder de Compra';
  } else if (/contas-publicas|divida|fiscal|tesouro/.test(ctxStr)) {
    autoBadge = 'TESOURO · BCB';
    autoSub = 'Contas Públicas, Dívida/PIB & Trajetória Fiscal';
  } else if (/agro|safra|pam/.test(ctxStr)) {
    autoBadge = 'IBGE PAM · AGRO';
    autoSub = 'Produção Agrícola, Safras e Vocação Regional';
  } else if (/mundo|global/.test(ctxStr)) {
    autoBadge = 'WORLD BANK · BCE';
    autoSub = 'Panorama Global, PIB Mundial & Blocos Econômicos';
  } else if (/imposto|popula|idh/.test(ctxStr)) {
    autoBadge = 'IBGE · PNUD';
    autoSub = 'Inteligência Macroeconômica, Tributária & IDH';
  } else if (/contas|pib/.test(ctxStr)) {
    autoBadge = 'IBGE SIDRA';
    autoSub = 'Inteligência Macroeconômica e Contas Regionais';
  } else if (/selic|juros|simulador/.test(ctxStr)) {
    autoBadge = 'BCB SGS';
    autoSub = 'Simulador de Renda Fixa & Juro Real';
  } else if (/moeda|cambio|câmbio/.test(ctxStr)) {
    autoBadge = 'CÂMBIO GLOBAL';
    autoSub = 'Taxas Cruzadas & Comparador Histórico';
  } else if (/economia/.test(ctxStr)) {
    autoBadge = 'ECONOMIA BR';
    autoSub = 'Hub de Indicadores, Câmbio & Simuladores';
  } else if (/glossario|glossário/.test(ctxStr)) {
    autoBadge = 'GLOSSÁRIO';
    autoSub = 'Conceitos de Economia, Finanças e Dados';
  }

  const badge = (elHdr && elHdr.dataset.badge) || autoBadge;
  const sub = (elHdr && elHdr.dataset.sub) || autoSub;

  const nav = [
    ['index', 'Início'],
    ['glossario', 'Glossário'],
    ['economia', 'Economia'],
    ['sobre', 'Sobre'],
    ['contato', 'Contato']
  ];

  const modulos = [
    ['terminal-pib', '01. Contas Regionais & PIB'],
    ['imposto-idh', '02. Impostos, População & IDH'],
    ['cambio', '03. Conversor de Moedas'],
    ['simulador-selic', '04. Simulador Selic & Juros'],
    ['mundo', '05. Mapa-Múndi & Global'],
    ['inflacao', '06. Inflação & Poder de Compra'],
    ['contas-publicas', '07. Contas Públicas & Dívida'],
    ['agro', '08. Agronegócio Brasileiro']
  ];

  const norm = s => String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\.html$/, '')
    .replace(/\/+$/, '') || '/';

  const path = norm(location.pathname);
  const isAtivo = (slug, label) => {
    const alvo = norm(slug);
    if (alvo === 'index' && (path === '/' || path === '/index')) return true;
    if (path === '/' + alvo || path.endsWith('/' + alvo)) return true;
    if (label === 'Economia' && /economia|terminal-pib|imposto|simulador|selic|moeda|cambio|mundo|infla|contas-publicas|agro/.test(path)) return true;
    return false;
  };
  const links = f => nav.map(([s, t]) => `<a href="${rota(s)}" class="${f(isAtivo(s, t))}">${t}</a>`).join('');

  const temRanking = !!(document.getElementById('secaoRanking') || document.getElementById('titTabela'));
  const linkClassif = document.getElementById('secaoRanking') ? '#secaoRanking' : '#titTabela';
  const logoSrc = isFile ? 'download.png' : '/download.png';

  const hdr = `<header class="sticky top-0 z-50 border-b din-border din-card-bg">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
    <a href="${rota('index')}" class="flex items-center gap-3 min-w-0 group">
      <div class="w-10 h-10 shrink-0 rounded-lg din-secondary-bg border din-border flex items-center justify-center shadow-sm overflow-hidden group-hover:border-[#16C784] transition-colors duration-200">
        <img src="${logoSrc}" alt="BrasilEmDados" class="w-8 h-8 object-contain transition-transform duration-200 group-hover:scale-110">
      </div>
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <span class="text-base sm:text-lg font-extrabold tracking-tight din-text-main leading-none">BrasilEmDados</span>
          <span class="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md din-secondary-bg border din-border text-[10px] font-mono font-semibold din-text-muted tracking-wide">
            <span class="w-1.5 h-1.5 rounded-full bg-[#16C784]"></span>${badge}
          </span>
        </div>
        <p class="hidden xl:block text-[11px] din-text-muted leading-tight mt-0.5 truncate">${sub}</p>
      </div>
    </a>

    <nav class="hidden lg:flex gap-1 din-secondary-bg p-1 rounded-xl border din-border text-xs font-semibold">
      ${links(on => 'px-4 py-1.5 rounded-lg transition ' + (on ? 'bd-nav-ativo font-bold' : 'din-text-muted hover:din-text-main'))}
    </nav>

    <div class="flex items-center gap-2">
      <div id="bd-base-slot" class="hidden items-center gap-1.5 px-3 h-9 rounded-lg din-secondary-bg border din-border text-xs">
        <span class="din-text-muted font-medium">Base:</span>
      </div>

      <button id="bdFull" type="button" class="hidden md:inline-flex items-center gap-2 px-3 h-9 rounded-lg din-secondary-bg border din-border text-xs font-semibold din-text-main hover:border-[#16C784] transition cursor-pointer">
        <svg class="w-4 h-4 din-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
        </svg>
        <span id="bdFullTxt">Modo Tela Cheia</span>
      </button>

      <div class="relative">
        <button id="bdMenuBtn" type="button" aria-label="Ferramentas do terminal"
          class="w-9 h-9 rounded-lg din-secondary-bg border din-border din-text-main flex items-center justify-center hover:border-[#16C784] transition cursor-pointer">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>
          </svg>
        </button>

        <div id="bdMenu" class="hidden absolute right-0 mt-2 w-64 rounded-xl din-card-bg border din-border shadow-xl py-2 z-50">
          <p class="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider din-text-muted">Ferramentas do terminal</p>
          <a href="${rota('economia')}" class="flex items-center gap-3 px-4 py-2 text-xs font-semibold din-text-main hover:din-secondary-bg transition">
            <span class="din-green text-sm leading-none">←</span> Voltar ao Hub Economia
          </a>
          ${temRanking ? `<a href="${linkClassif}" onclick="document.getElementById('bdMenu').classList.add('hidden')" class="flex items-center gap-3 px-4 py-2 text-xs font-semibold din-text-main hover:din-secondary-bg transition">
            <svg class="w-4 h-4 din-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/></svg>
            Classificação Estadual
          </a>` : ''}
          <button type="button" onclick="document.getElementById('bdMenu').classList.add('hidden'); window.print();" class="w-full text-left flex items-center gap-3 px-4 py-2 text-xs font-semibold din-text-main hover:din-secondary-bg transition cursor-pointer">
            <svg class="w-4 h-4 din-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3"/></svg>
            Exportar Relatório (PDF)
          </button>

          <div class="my-1.5 border-t din-border"></div>
          <p class="px-4 py-1 text-[10px] font-bold uppercase tracking-wider din-text-muted">Módulos</p>
          <div class="max-h-52 overflow-y-auto">
            ${modulos.map(([s, n]) => `<a href="${rota(s)}" class="flex items-center gap-2.5 px-4 py-1.5 text-xs font-medium din-text-main hover:din-secondary-bg transition">
              <span class="w-1.5 h-1.5 rounded-full bg-[#16C784] shrink-0"></span><span class="truncate">${n}</span>
            </a>`).join('')}
          </div>

          <div class="my-1.5 border-t din-border"></div>
          <button id="bdTema" type="button" class="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold din-text-main hover:din-secondary-bg transition cursor-pointer">
            <span class="flex items-center gap-3">
              <svg class="w-4 h-4 din-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              Modo Escuro (Dark)
            </span>
            <span id="bdToggleTrack" class="w-9 h-5 rounded-full din-secondary-bg border din-border p-0.5 flex items-center transition">
              <span id="bdToggleDot" class="w-3.5 h-3.5 rounded-full bg-white shadow transition-transform"></span>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
  <nav class="lg:hidden flex gap-5 h-10 px-4 overflow-x-auto no-scrollbar items-center text-xs font-semibold border-t din-border">
    ${links(on => (on ? 'din-green border-b-2 border-[#16C784] h-full flex items-center' : 'din-text-muted h-full flex items-center') + ' shrink-0')}
  </nav>
</header>`;

  const ftr = `<footer class="border-t din-border din-card-bg py-6 text-xs din-text-muted mt-8 ocultar-em-presentation">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
      <span><strong class="din-text-main">BrasilEmDados</strong> · Terminal de Inteligência Econômica e Setorial</span>
      <div class="flex flex-wrap items-center justify-center gap-4">
        <a href="${rota('index')}" class="hover:din-text-main transition">Início</a>
        <a href="${rota('economia')}" class="hover:din-text-main transition">Economia</a>
        <a href="${rota('glossario')}" class="hover:din-text-main transition">Glossário</a>
        <a href="${rota('sobre')}" class="hover:din-text-main transition">Sobre</a>
        <a href="${rota('contato')}" class="hover:din-text-main transition">Contato</a>
      </div>
    </div>
  </footer>`;

  if (elHdr) elHdr.innerHTML = hdr;
  const elFtr = document.getElementById('bd-footer');
  if (elFtr) elFtr.innerHTML = ftr;

  document.querySelectorAll('header nav a').forEach(a => {
    a.addEventListener('click', () => {
      const navBox = a.closest('nav');
      navBox?.querySelectorAll('a').forEach(item => item.classList.remove('bd-nav-ativo', 'font-bold'));
      a.classList.add('bd-nav-ativo', 'font-bold');
    });
  });

  // Move seletor de ano (#ano ou #selectAno) para o cabeçalho unificado quando #bd-header está ativo
  const selAno = document.getElementById('ano') || document.getElementById('selectAno');
  const slot = document.getElementById('bd-base-slot');
  if (elHdr && selAno && slot) {
    const pai = selAno.parentElement;
    selAno.className = 'bg-transparent font-bold din-text-main text-xs outline-none cursor-pointer pr-1';
    slot.appendChild(selAno);
    slot.classList.remove('hidden');
    slot.classList.add('inline-flex');
    if (pai && (pai.tagName === 'LABEL' || pai.children.length === 0)) pai.classList.add('hidden');
  }

  // Normaliza links internos *.html -> rotas limpas automaticamente quando rodando via HTTP/HTTPS
  if (!isFile) {
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href') || '';
      if (/^(https?:|mailto:|tel:|#)/i.test(href)) return;
      if (/\.html($|#)/i.test(href)) {
        a.setAttribute('href', rota(href));
      }
    });
  }

  const K = 'brasil_em_dados_tema', H = document.documentElement;
  const syncToggle = dark => {
    const tr = document.getElementById('bdToggleTrack'), dot = document.getElementById('bdToggleDot');
    if (!tr || !dot) return;
    tr.style.background = dark ? 'var(--gr)' : '';
    dot.style.transform = dark ? 'translateX(16px)' : 'translateX(0)';
  };
  const ap = t => {
    const dark = t === 'dark';
    dark ? H.setAttribute('data-theme', 'dark') : H.removeAttribute('data-theme');
    syncToggle(dark);
  };
  let salvo = 'light'; try { salvo = localStorage.getItem(K) || 'light'; } catch (e) {}
  ap(salvo);

  const btnTema = document.getElementById('bdTema');
  if (btnTema) {
    btnTema.onclick = () => {
      const n = H.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      ap(n); try { localStorage.setItem(K, n); } catch (e) {}
      window.dispatchEvent(new Event('tema'));
    };
  }

  const btnM = document.getElementById('bdMenuBtn'), menu = document.getElementById('bdMenu');
  if (btnM && menu) {
    btnM.onclick = e => { e.stopPropagation(); menu.classList.toggle('hidden'); };
    document.addEventListener('click', e => { if (!menu.contains(e.target) && e.target !== btnM) menu.classList.add('hidden'); });
  }

  const btnF = document.getElementById('bdFull'), txtF = document.getElementById('bdFullTxt');
  if (btnF && txtF) {
    btnF.onclick = () => {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
      else document.exitFullscreen?.();
    };
    document.addEventListener('fullscreenchange', () => {
      txtF.textContent = document.fullscreenElement ? 'Sair Tela Cheia' : 'Modo Tela Cheia';
    });
  }

  const DICIONARIO = {
    PIB: 'Soma de todos os bens e serviços finais produzidos em um território em um período.',
    VAB: 'Valor que cada setor (Agro, Indústria, Serviços) agrega aos insumos antes dos impostos.',
    IDH: 'Índice de Desenvolvimento Humano (0 a 1): combina saúde, educação e renda.',
    IPCA: 'Inflação oficial do Brasil (IBGE), referência para a meta do Banco Central.',
    'IGP-M': 'Índice da FGV com peso de 60% no atacado, sensível ao câmbio e commodities.',
    DBGG: 'Dívida Bruta do Governo Geral em % do PIB, sem descontar ativos financeiros.',
    DLSP: 'Dívida Líquida do Setor Público: desconta ativos como reservas internacionais.',
    SELIC: 'Taxa básica de juros definida pelo Copom/Banco Central.',
    SPREAD: 'Diferença cobrada pelo intermediário sobre a taxa comercial de câmbio.',
    PTAX: 'Taxa de referência do Dólar calculada diariamente pelo Banco Central.',
    PAM: 'Pesquisa Agrícola Municipal do IBGE (produção, área colhida e rendimento).'
  };

  document.querySelectorAll('[data-glossario]').forEach(el => {
    const chave = (el.dataset.glossario || '').toUpperCase();
    const texto = DICIONARIO[chave];
    if (!texto || el.dataset.tooltipInit) return;
    el.dataset.tooltipInit = '1';
    const wrap = document.createElement('span');
    wrap.className = 'relative inline-flex items-center ml-1 group align-middle';
    wrap.innerHTML = `
      <a href="${rota('glossario')}" title="${texto}"
        class="w-4 h-4 rounded-full din-secondary-bg border din-border text-[10px] font-bold din-text-muted hover:din-green hover:border-[#16C784] inline-flex items-center justify-center transition">?</a>
      <span class="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 rounded-xl din-card-bg border din-border shadow-xl text-[11px] font-normal din-text-main leading-snug z-50">
        <strong class="din-green block mb-0.5">${chave}</strong>
        ${texto}
        <span class="block mt-1 text-[10px] din-text-muted">Clique para abrir no Glossário →</span>
      </span>`;
    el.appendChild(wrap);
  });

  window.BD = {
    rota,
    brl: (v, d = 2) => window.BDFmt ? BDFmt.brl(v, d) : Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: d, maximumFractionDigits: d }),
    num: (v, d = 0) => window.BDFmt ? BDFmt.num(v, d) : Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }),
    compact: r => {
      if (window.BDFmt) return BDFmt.compactBRL(r);
      const n = Number(r || 0);
      const f = (x, s) => 'R$ ' + (n / x).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + s;
      return n >= 1e12 ? f(1e12, 'tri') : n >= 1e9 ? f(1e9, 'bi') : n >= 1e6 ? f(1e6, 'mi') : window.BD.brl(n, 0);
    },
    cor: () => { const d = H.getAttribute('data-theme') === 'dark'; return { tx: d ? '#F5F6F7' : '#17191C', mu: d ? '#9299A3' : '#737780', grid: d ? '#2B3036' : '#E5E7EB' }; },
    indicadores: async () => {
      if (window.BDUF && BDUF.obterCacheIndicadores) {
        const cache = BDUF.obterCacheIndicadores();
        if (cache && cache.length) return cache;
      }
      const r = await fetch('/api/indicadores');
      if (!r.ok) throw new Error('API ' + r.status);
      const j = await r.json();
      if (!Array.isArray(j)) throw new Error('Formato inválido');
      if (window.BDUF && BDUF.salvarCacheIndicadores) BDUF.salvarCacheIndicadores(j);
      return j;
    }
  };
})();