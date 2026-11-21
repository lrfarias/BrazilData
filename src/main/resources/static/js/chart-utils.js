(() => {
  const MESES_ABNT = ['jan.', 'fev.', 'mar.', 'abr.', 'maio', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];

  function getPerfilTela() {
    const w = window.innerWidth;
    if (w < 640) return { tipo: 'mobile', fonte: 10, maxTicksX: 4, maxTicksY: 5, padRight: 8 };
    if (w < 1024) return { tipo: 'tablet', fonte: 11, maxTicksX: 6, maxTicksY: 6, padRight: 12 };
    return { tipo: 'desktop', fonte: 11, maxTicksX: 9, maxTicksY: 7, padRight: 16 };
  }

  function getCoresTema() {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      dark,
      bg: dark ? '#161A1E' : '#FFFFFF',
      tx: dark ? '#F5F6F7' : '#17191C',
      mu: dark ? '#9299A3' : '#6B7280',
      grid: dark ? '#2B3036' : '#E5E7EB',
      border: dark ? '#2B3036' : '#E5E7EB',
      verde: '#16C784',
      vermelho: '#EA3943'
    };
  }

  function dataAcessoABNT(dt = new Date()) {
    const dia = String(dt.getDate()).padStart(2, '0');
    const mes = MESES_ABNT[dt.getMonth()];
    const ano = dt.getFullYear();
    return `${dia} ${mes} ${ano}`;
  }

  // Gera referência no padrão ABNT (NBR 6023)
  function gerarCitacaoABNT({ titulo, fonteOficial, serie = '', url = window.location.href }) {
    const ano = new Date().getFullYear();
    const urlLimpa = url.split('#')[0];
    const blocoFonte = fonteOficial
      ? ` Dados originais: ${fonteOficial}${serie ? ` (${serie})` : ''}.`
      : '';
    return `BRASILEMDADOS. ${titulo}. São Paulo, ${ano}.${blocoFonte} Disponível em: <${urlLimpa}>. Acesso em: ${dataAcessoABNT()}.`;
  }

  // Copia a citação ABNT e dá feedback visual no botão e no toast
  async function copiarABNT(config, btnEl) {
    const texto = gerarCitacaoABNT(config);
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = texto;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }

    if (btnEl) {
      const orig = btnEl.innerHTML;
      btnEl.innerHTML = '✓ ABNT copiada';
      btnEl.classList.add('border-[#16C784]', 'din-green');
      setTimeout(() => {
        btnEl.innerHTML = orig;
        btnEl.classList.remove('border-[#16C784]', 'din-green');
      }, 2200);
    }
    mostrarToast('Citação ABNT copiada para a área de transferência.');
    return texto;
  }

  // Exporta qualquer <canvas> do Chart.js em PNG 2x com título, fonte oficial e marca BrasilEmDados
  function baixarPNG(canvasId, { titulo = 'Indicador Econômico', subtitulo = '', fonte = 'Fontes oficiais', nomeArquivo = 'brasilemdados-grafico' } = {}) {
    const srcCanvas = document.getElementById(canvasId);
    if (!srcCanvas) return;

    const c = getCoresTema();
    const escala = 2;
    const larguraGraf = srcCanvas.clientWidth || srcCanvas.width || 900;
    const alturaGraf = srcCanvas.clientHeight || srcCanvas.height || 420;
    const padX = 28;
    const headerH = subtitulo ? 74 : 56;
    const footerH = 44;

    const totalW = larguraGraf + padX * 2;
    const totalH = headerH + alturaGraf + footerH + 16;

    const out = document.createElement('canvas');
    out.width = totalW * escala;
    out.height = totalH * escala;
    const ctx = out.getContext('2d');
    ctx.scale(escala, escala);

    // Fundo sólido
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, totalW, totalH);

    // Barra verde superior
    ctx.fillStyle = c.verde;
    ctx.fillRect(0, 0, totalW, 4);

    // Cabeçalho
    ctx.fillStyle = c.tx;
    ctx.font = '700 16px system-ui, -apple-system, sans-serif';
    ctx.fillText(titulo, padX, 34);

    if (subtitulo) {
      ctx.fillStyle = c.mu;
      ctx.font = '400 12px system-ui, -apple-system, sans-serif';
      ctx.fillText(subtitulo, padX, 54);
    }

    // Marca à direita
    ctx.textAlign = 'right';
    ctx.fillStyle = c.verde;
    ctx.font = '800 13px system-ui, -apple-system, sans-serif';
    ctx.fillText('BrasilEmDados', totalW - padX, 34);
    ctx.textAlign = 'left';

    // Gráfico original
    ctx.drawImage(srcCanvas, padX, headerH, larguraGraf, alturaGraf);

    // Linha divisória do rodapé
    const rodapeY = headerH + alturaGraf + 12;
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padX, rodapeY);
    ctx.lineTo(totalW - padX, rodapeY);
    ctx.stroke();

    // Fonte + Data de acesso
    ctx.fillStyle = c.mu;
    ctx.font = '500 11px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Fonte: ${fonte}`, padX, rodapeY + 22);

    ctx.textAlign = 'right';
    ctx.fillText(`brasilemdados.com • ${dataAcessoABNT()}`, totalW - padX, rodapeY + 22);

    const link = document.createElement('a');
    link.download = `${nomeArquivo}.png`;
    link.href = out.toDataURL('image/png', 1.0);
    link.click();
    mostrarToast('Gráfico exportado em PNG com fonte oficial.');
  }

  // Opções base responsivas para Chart.js (celular / tablet / PC)
  function opcoesBase({ fmtY = v => v, mostrarLegenda = true } = {}) {
    const p = getPerfilTela();
    const c = getCoresTema();
    return {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 8, right: p.padRight, bottom: 4, left: 2 } },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: mostrarLegenda,
          align: 'end',
          labels: { color: c.tx, boxWidth: 10, padding: 10, font: { size: p.fonte } }
        },
        tooltip: {
          backgroundColor: c.bg,
          titleColor: c.tx,
          bodyColor: c.tx,
          borderColor: c.border,
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${fmtY(ctx.parsed.y)}`
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: c.mu,
            maxTicksLimit: p.maxTicksX,
            font: { size: p.fonte },
            maxRotation: 0
          },
          grid: { display: false }
        },
        y: {
          grace: '6%',
          ticks: {
            color: c.mu,
            maxTicksLimit: p.maxTicksY,
            font: { size: p.fonte },
            callback: v => fmtY(v)
          },
          grid: { color: c.grid }
        }
      }
    };
  }

  // Renderiza um selo de fonte oficial padronizado
  function seloFonte({ orgao, tabela = '', atualizado = '', url = '' }) {
    const link = url
      ? `<a href="${url}" target="_blank" rel="noopener" class="underline hover:din-green transition">${orgao}</a>`
      : `<strong class="din-text-main">${orgao}</strong>`;
    return `
      <div class="flex flex-wrap items-center justify-between gap-2 pt-3 border-t din-border text-[11px] din-text-muted">
        <span class="inline-flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-[#16C784]"></span>
          <span>Fonte oficial: ${link}${tabela ? ` • ${tabela}` : ''}</span>
        </span>
        ${atualizado ? `<span class="font-mono text-[10px]">Ref.: ${atualizado}</span>` : ''}
      </div>
    `;
  }

  function mostrarToast(msg) {
    let el = document.getElementById('bdToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'bdToast';
      el.className = 'fixed bottom-5 right-5 z-[999] px-4 py-2.5 rounded-lg din-card-bg border border-[#16C784] shadow-xl text-xs font-semibold din-text-main transition-opacity duration-300 opacity-0 pointer-events-none';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.remove('opacity-0');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.add('opacity-0'), 2600);
  }

  window.BDChart = {
    getPerfilTela,
    getCoresTema,
    gerarCitacaoABNT,
    copiarABNT,
    baixarPNG,
    opcoesBase,
    seloFonte,
    mostrarToast
  };
})();