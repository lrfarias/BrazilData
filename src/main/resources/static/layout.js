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
th.s{cursor:pointer;user-select:none}th.s:hover{color:var(--gr)}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const nav = [['index.html','Início'],['glossario.html','Glossário'],['economia.html','Economia'],['sobre.html','Sobre'],['contato.html','Contato']];
  const links = f => nav.map(([h,t]) => `<a href="/${h}" class="${f(t)}">${t}</a>`).join('');
  const on = t => t === 'Economia';

  const hdr = `<header class="sticky top-0 z-50 border-b din-border din-card-bg"><div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
<a href="/index.html" class="text-lg font-extrabold tracking-tight din-text-main">BrasilEmDados</a>
<nav class="hidden md:flex gap-1 din-secondary-bg p-1 rounded-lg border din-border text-xs font-semibold">${links(t => 'px-3.5 py-1.5 rounded-md ' + (on(t) ? 'din-card-bg din-text-main border din-border' : 'din-text-muted'))}</nav>
<button id="bdTema" class="w-9 h-9 rounded-lg din-secondary-bg border din-border din-text-main" aria-label="Alternar tema claro e escuro">◐</button></div>
<nav class="md:hidden flex gap-5 h-10 px-4 overflow-x-auto items-center text-xs font-semibold border-t din-border">${links(t => on(t) ? 'din-green' : 'din-text-muted')}</nav></header>`;
  const ftr = `<footer class="border-t din-border din-card-bg py-6 text-xs din-text-muted mt-8"><div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between gap-2"><span><strong class="din-text-main">BrasilEmDados</strong> · Terminal de Inteligência Econômica e Setorial</span><span>Conteúdo educativo, sem recomendação de investimento.</span></div></footer>`;
  document.getElementById('bd-header').innerHTML = hdr;
  document.getElementById('bd-footer').innerHTML = ftr;

  const K = 'brasil_em_dados_tema', H = document.documentElement;
  const ap = t => t === 'dark' ? H.setAttribute('data-theme', 'dark') : H.removeAttribute('data-theme');
  let salvo = 'light'; try { salvo = localStorage.getItem(K) || 'light'; } catch (e) {}
  ap(salvo);
  document.getElementById('bdTema').onclick = () => {
    const n = H.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    ap(n); try { localStorage.setItem(K, n); } catch (e) {}
    window.dispatchEvent(new Event('tema'));
  };

  window.BD = {
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
