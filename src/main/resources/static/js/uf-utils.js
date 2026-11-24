window.BDUF = (() => {
  const UFS = [
    'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
    'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
  ];

  const REGIOES = ['Todas', 'Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];

  const REGIAO_UF = {
    RO:'Norte', AC:'Norte', AM:'Norte', RR:'Norte', PA:'Norte', AP:'Norte', TO:'Norte',
    MA:'Nordeste', PI:'Nordeste', CE:'Nordeste', RN:'Nordeste', PB:'Nordeste', PE:'Nordeste', AL:'Nordeste', SE:'Nordeste', BA:'Nordeste',
    MG:'Sudeste', ES:'Sudeste', RJ:'Sudeste', SP:'Sudeste',
    PR:'Sul', SC:'Sul', RS:'Sul',
    MS:'Centro-Oeste', MT:'Centro-Oeste', GO:'Centro-Oeste', DF:'Centro-Oeste'
  };

  const IBGE_UF = {
    '11':'RO','12':'AC','13':'AM','14':'RR','15':'PA','16':'AP','17':'TO',
    '21':'MA','22':'PI','23':'CE','24':'RN','25':'PB','26':'PE','27':'AL','28':'SE','29':'BA',
    '31':'MG','32':'ES','33':'RJ','35':'SP','41':'PR','42':'SC','43':'RS',
    '50':'MS','51':'MT','52':'GO','53':'DF'
  };

  const NOMES_UF = {
    AC:'Acre', AL:'Alagoas', AP:'Amapá', AM:'Amazonas', BA:'Bahia', CE:'Ceará',
    DF:'Distrito Federal', ES:'Espírito Santo', GO:'Goiás', MA:'Maranhão',
    MT:'Mato Grosso', MS:'Mato Grosso do Sul', MG:'Minas Gerais', PA:'Pará',
    PB:'Paraíba', PR:'Paraná', PE:'Pernambuco', PI:'Piauí', RJ:'Rio de Janeiro',
    RN:'Rio Grande do Norte', RS:'Rio Grande do Sul', RO:'Rondônia', RR:'Roraima',
    SC:'Santa Catarina', SP:'São Paulo', SE:'Sergipe', TO:'Tocantins', BR:'Brasil'
  };

  const WIKIMEDIA_UF = {
    BR: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Flag_of_Brazil.svg',
    AC: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Bandeira_do_Acre.svg',
    AL: 'https://upload.wikimedia.org/wikipedia/commons/8/88/Bandeira_de_Alagoas.svg',
    AP: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Bandeira_do_Amap%C3%A1.svg',
    AM: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Bandeira_do_Amazonas.svg',
    BA: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Bandeira_da_Bahia.svg',
    CE: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Bandeira_do_Cear%C3%A1.svg',
    DF: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Bandeira_do_Distrito_Federal_%28Brasil%29.svg',
    ES: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Bandeira_do_Esp%C3%ADrito_Santo.svg',
    GO: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Flag_of_Goi%C3%A1s.svg',
    MA: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Bandeira_do_Maranh%C3%A3o.svg',
    MT: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Bandeira_de_Mato_Grosso.svg',
    MS: 'https://upload.wikimedia.org/wikipedia/commons/6/64/Bandeira_de_Mato_Grosso_do_Sul.svg',
    MG: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Bandeira_de_Minas_Gerais.svg',
    PA: 'https://upload.wikimedia.org/wikipedia/commons/0/02/Bandeira_do_Par%C3%A1.svg',
    PB: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Bandeira_da_Para%C3%ADba.svg',
    PR: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Bandeira_do_Paran%C3%A1.svg',
    PE: 'https://upload.wikimedia.org/wikipedia/commons/5/59/Bandeira_de_Pernambuco.svg',
    PI: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Bandeira_do_Piau%C3%AD.svg',
    RJ: 'https://upload.wikimedia.org/wikipedia/commons/7/73/Bandeira_do_estado_do_Rio_de_Janeiro.svg',
    RN: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Bandeira_do_Rio_Grande_do_Norte.svg',
    RS: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Bandeira_do_Rio_Grande_do_Sul.svg',
    RO: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Bandeira_de_Rond%C3%B4nia.svg',
    RR: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Bandeira_de_Roraima.svg',
    SC: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Bandeira_de_Santa_Catarina.svg',
    SP: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Bandeira_do_estado_de_S%C3%A3o_Paulo.svg',
    SE: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Bandeira_de_Sergipe.svg',
    TO: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Bandeira_do_Tocantins.svg'
  };

  window.bdImgFallback = function(img) {
    const fb = img.getAttribute('data-fb');
    if (fb && img.src !== fb) {
      img.removeAttribute('data-fb');
      img.src = fb;
      return;
    }
    const sigla = img.getAttribute('data-uf') || 'BR';
    const wrap = img.parentElement;
    if (wrap) {
      const px = wrap.offsetWidth || 20;
      wrap.className = 'rounded-full bg-[#16C784] text-white font-extrabold inline-flex items-center justify-center shrink-0';
      wrap.style.fontSize = Math.max(7, Math.round(px * 0.42)) + 'px';
      wrap.textContent = sigla;
    }
  };

  function urlBandeira(uf) {
    const key = uf && WIKIMEDIA_UF[uf] ? uf : 'BR';
    return `/img/bandeiras/${key}.svg`;
  }

  function htmlBandeira(uf, px = 20) {
    const key = uf && WIKIMEDIA_UF[uf] ? uf : 'BR';
    const localUrl = `/img/bandeiras/${key}.svg`;
    const remoteUrl = WIKIMEDIA_UF[key] || '';
    const zoom = key === 'DF' ? 'transform:scale(2.8);' : '';
    return `<span style="width:${px}px;height:${px}px" class="rounded-full overflow-hidden border din-border inline-flex items-center justify-center shrink-0 bg-white"><img src="${localUrl}" data-fb="${remoteUrl}" data-uf="${key}" alt="${key}" style="width:100%;height:100%;object-fit:cover;${zoom}" onerror="bdImgFallback(this)"></span>`;
  }

  // Escala tonal padrão do terminal: #74E3B4 -> #16C784 -> #046C4E
  function interpolarVerde(t) {
    const s = Math.pow(Math.max(0, Math.min(1, t)), 0.72);
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

  // Cache em sessionStorage para abertura instantânea dos mapas entre páginas
  const GEO_CACHE_KEY = 'bd_geojson_br_v1';
  async function obterGeoJsonBrasil() {
    try {
      const salvo = sessionStorage.getItem(GEO_CACHE_KEY);
      if (salvo) return JSON.parse(salvo);
    } catch {}

    const urls = [
      'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson',
      'https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=application/vnd.geo+json&qualidade=minima&intrarregiao=UF'
    ];
    for (const u of urls) {
      try {
        const r = await fetch(u);
        if (r.ok) {
          const geo = await r.json();
          if (geo && geo.features) {
            geo.features.forEach(f => {
              const p = f.properties || (f.properties = {});
              if (!p.sigla && p.codarea && IBGE_UF[String(p.codarea)]) {
                p.sigla = IBGE_UF[String(p.codarea)];
              }
            });
            try { sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(geo)); } catch {}
            return geo;
          }
        }
      } catch {}
    }
    return null;
  }

  return {
    UFS,
    REGIOES,
    REGIAO_UF,
    IBGE_UF,
    NOMES_UF,
    WIKIMEDIA_UF,
    urlBandeira,
    htmlBandeira,
    interpolarVerde,
    obterGeoJsonBrasil
  };
})();