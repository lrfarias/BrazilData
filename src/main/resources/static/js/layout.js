(() => {
  const css = `:root{--bg:#fff;--card:#F7F8FA;--sec:#F0F2F5;--tx:#17191C;--mu:#737780;--bd:#E5E7EB;--gr:#16C784;--rd:#EA3943}
[data-theme=dark]{--bg:#101214;--card:#191C20;--sec:#22262B;--tx:#F5F6F7;--mu:#9299A3;--bd:#2B3036}
body{background:var(--bg);color:var(--tx)}
.din-card-bg{background:var(--card)}.din-secondary-bg{background:var(--sec)}
.din-text-main{color:var(--tx)}.din-text-muted{color:var(--mu)}
.din-border{border-color:var(--bd)!important}.din-green{color:var(--gr)}.din-red{color:var(--rd)}
.din-btn{background:var(--gr);color:#fff}.din-btn:hover{opacity:.9}
.inp{background:var(--sec);border:1px solid var(--bd);color:var(--tx);border-radius:.5rem;padding:.5rem .75rem;width:100%;font-size:.875rem}
.inp:focus-visible,button:focus-visible,a:focus-visible{outline:2px solid var(--gr);outline-offset:2px}
select option{background:var(--card);color:var(--tx)}
th.s{cursor:pointer;user-select:none}th.s:hover{color:var(--gr)}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const isFile = location.protocol === 'file:';
  const rota = slug => {
    const limpo = String(slug || '').replace(/^\/|\.html$/g, '');
    if (!limpo || limpo === 'index') return isFile ? 'index.html' : '/';
    return isFile ? `${limpo}.html` : `/${limpo}`;
  };

  // Detecta automaticamente o contexto da página (ou respeita data-badge / data-sub se informados)
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
  } else if (/bovespa|bolsa|b3|acoes/.test(ctxStr)) {
    autoBadge = 'B3 · MERCADO';
    autoSub = 'Ibovespa e Principais Ações Brasileiras';
  } else if (/agro|safra|pam/.test(ctxStr)) {
    autoBadge = 'IBGE PAM · AGRO';
    autoSub = 'Produção Agrícola, Safras e Vocação Regional';
  } else if (/mundo|global/.test(ctxStr)) {
    autoBadge = 'GLOBAL · MACRO';
    autoSub = 'Panorama Global, PIB Mundial & Blocos Econômicos';
  } else if (/imposto|popula|idh|contas|pib/.test(ctxStr)) {
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
    ['bovespa', '08. Bolsa de Valores (B3)'],
    ['agro', '09. Agronegócio Brasileiro']
  ];

  const path = location.pathname.toLowerCase().replace(/\.html$/, '').replace(/\/$/, '') || '/';
  const isAtivo = (slug, label) => {
    if (slug === 'index' && (path === '/' || path === '/index')) return true;
    if (path === '/' + slug) return true;
    if (label === 'Economia' && /economia|terminal-pib|imposto|simulador|selic|moeda|cambio|mundo|infla|contas-publicas|bovespa|agro/.test(path)) return true;
    return false;
  };
  const links = f => nav.map(([s, t]) => `<a href="${rota(s)}" class="${f(isAtivo(s, t))}">${t}</a>`).join('');

  const temTabela = !!document.getElementById('titTabela');
  const linkClassif = temTabela ? '#titTabela' : rota('economia');
  const logoSrc = isFile ? 'download.png' : '/download.png';

  const hdr = `<header class="sticky top-0 z-50 border-b din-border din-card-bg">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
    <!-- Esquerda: Logo + Marca + Selo + Subtítulo -->
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
        <p class="hidden sm:block text-[11px] din-text-muted leading-tight mt-0.5 truncate">${sub}</p>
      </div>
    </a>

    <!-- Centro: Navegação -->
    <nav class="hidden lg:flex gap-1 din-secondary-bg p-1 rounded-xl border din-border text-xs font-semibold">
      ${links(on => 'px-4 py-1.5 rounded-lg transition ' + (on ? 'din-card-bg din-text-main border din-border shadow-sm' : 'din-text-muted hover:din-text-main'))}
    </nav>

    <!-- Direita: Base (quando existir) + Modo Tela Cheia + Menu Ferramentas -->
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
          ${temTabela ? `<a href="${linkClassif}" onclick="document.getElementById('bdMenu').classList.add('hidden')" class="flex items-center gap-3 px-4 py-2 text-xs font-semibold din-text-main hover:din-secondary-bg transition">
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
  <nav class="lg:hidden flex gap-5 h-10 px-4 overflow-x-auto items-center text-xs font-semibold border-t din-border">
    ${links(on => (on ? 'din-green' : 'din-text-muted') + ' shrink-0')}
  </nav>
</header>`;

  const ftr = `<footer class="border-t din-border din-card-bg py-6 text-xs din-text-muted mt-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
      <span><strong class="din-text-main">BrasilEmDados</strong> · Dados públicos e inteligência econômica</span>
      <div class="flex flex-wrap items-center gap-4">
        <a href="${rota('economia')}" class="hover:din-text-main transition">Economia</a>
        <a href="${rota('glossario')}" class="hover:din-text-main transition">Glossário</a>
        <a href="${rota('sobre')}" class="hover:din-text-main transition">Fontes & Sobre</a>
        <a href="${rota('contato')}" class="hover:din-text-main transition">Contato</a>
      </div>
    </div>
  </footer>`;

  if (elHdr) elHdr.innerHTML = hdr;
  const elFtr = document.getElementById('bd-footer');
  if (elFtr) elFtr.innerHTML = ftr;

  // Se a página possuir <select id="ano">, encaixa automaticamente no "Base: 2021 v" do cabeçalho
  const selAno = document.getElementById('ano');
  const slot = document.getElementById('bd-base-slot');
  if (selAno && slot) {
    const pai = selAno.parentElement;
    selAno.className = 'bg-transparent font-bold din-text-main text-xs outline-none cursor-pointer pr-1';
    slot.appendChild(selAno);
    slot.classList.remove('hidden');
    slot.classList.add('inline-flex');
    if (pai && pai.tagName === 'LABEL') pai.classList.add('hidden');
  }

  // Tema claro/escuro com switch
  const K = 'brasil_em_dados_tema', H = document.documentElement;
  const syncToggle = dark => {
    const tr = document.getElementById('bdToggleTrack'), dot = document.getElementById('bdToggleDot');
    if (!tr || !dot) return;
    tr.style.background = dark ? '#16C784' : '';
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

  // Menu Ferramentas
  const btnM = document.getElementById('bdMenuBtn'), menu = document.getElementById('bdMenu');
  if (btnM && menu) {
    btnM.onclick = e => { e.stopPropagation(); menu.classList.toggle('hidden'); };
    document.addEventListener('click', e => { if (!menu.contains(e.target) && e.target !== btnM) menu.classList.add('hidden'); });
  }

  // Modo Tela Cheia
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

  window.BD = {
    rota,
    brl: (v, d = 2) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: d, maximumFractionDigits: d }),
    num: (v, d = 0) => v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }),
    compact: r => {
      const f = (x, s) => 'R$ ' + (r / x).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + s;
      return r >= 1e12 ? f(1e12, 'tri') : r >= 1e9 ? f(1e9, 'bi') : r >= 1e6 ? f(1e6, 'mi') : BD.brl(r, 0);
    },
    cor: () => { const d = H.getAttribute('data-theme') === 'dark'; return { tx: d ? '#F5F6F7' : '#17191C', mu: d ? '#9299A3' : '#737780', grid: d ? '#2B3036' : '#E5E7EB' }; },
    indicadores: async () => { const r = await fetch('/api/indicadores'); if (!r.ok) throw new Error('API ' + r.status); return r.json(); }
  };
})();