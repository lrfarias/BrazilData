// Tabelas de referência, fallback e classificações globais (ISO-3166)
const FALLBACK_MACRO = {
  USA:{pib:28.78e12,ppc:28.78e12,pc:85370,pop:335.9e6,cresc:2.5,infla:2.9,imp:27.1,gini:41.3},
  CHN:{pib:18.53e12,ppc:35.29e12,pc:13136,pop:1409.7e6,cresc:4.8,infla:0.4,imp:21.5,gini:37.1},
  DEU:{pib:4.59e12,ppc:5.69e12,pc:54291,pop:84.5e6,cresc:0.1,infla:2.2,imp:41.2,gini:31.7},
  JPN:{pib:4.11e12,ppc:6.72e12,pc:33138,pop:124.0e6,cresc:0.3,infla:2.5,imp:34.1,gini:32.9},
  IND:{pib:3.94e12,ppc:14.59e12,pc:2731,pop:1428.6e6,cresc:6.8,infla:4.8,imp:18.0,gini:32.8},
  GBR:{pib:3.50e12,ppc:4.03e12,pc:51075,pop:68.3e6,cresc:0.9,infla:2.6,imp:35.3,gini:32.4},
  FRA:{pib:3.13e12,ppc:3.99e12,pc:47359,pop:68.1e6,cresc:1.1,infla:2.0,imp:45.6,gini:31.5},
  ITA:{pib:2.33e12,ppc:3.35e12,pc:39580,pop:58.9e6,cresc:0.7,infla:1.3,imp:42.8,gini:34.8},
  BRA:{pib:2.18e12,ppc:4.27e12,pc:10296,pop:212.6e6,cresc:2.9,infla:4.4,imp:33.0,gini:52.0},
  CAN:{pib:2.21e12,ppc:2.47e12,pc:54866,pop:40.1e6,cresc:1.3,infla:2.4,imp:34.8,gini:31.7},
  RUS:{pib:2.02e12,ppc:6.45e12,pc:14391,pop:144.2e6,cresc:3.6,infla:8.6,imp:34.0,gini:35.1},
  MEX:{pib:1.85e12,ppc:3.43e12,pc:14266,pop:129.7e6,cresc:1.8,infla:4.6,imp:16.9,gini:43.5},
  AUS:{pib:1.79e12,ppc:1.79e12,pc:66589,pop:26.6e6,cresc:1.2,infla:3.2,imp:29.5,gini:34.3},
  KOR:{pib:1.76e12,ppc:3.06e12,pc:34165,pop:51.7e6,cresc:2.2,infla:2.1,imp:29.9,gini:31.4},
  ESP:{pib:1.65e12,ppc:2.52e12,pc:34045,pop:48.4e6,cresc:2.7,infla:2.4,imp:37.5,gini:33.9},
  IDN:{pib:1.48e12,ppc:4.72e12,pc:5271,pop:277.5e6,cresc:5.0,infla:2.1,imp:12.5,gini:36.1},
  TUR:{pib:1.15e12,ppc:3.83e12,pc:13384,pop:85.8e6,cresc:3.2,infla:48.5,imp:23.5,gini:44.4},
  NLD:{pib:1.14e12,ppc:1.33e12,pc:63750,pop:17.9e6,cresc:0.8,infla:3.1,imp:39.8,gini:25.7},
  SAU:{pib:1.11e12,ppc:2.35e12,pc:33040,pop:36.9e6,cresc:1.5,infla:1.7,imp:11.0,gini:45.9},
  CHE:{pib:0.94e12,ppc:0.82e12,pc:105669,pop:8.9e6,cresc:1.4,infla:1.1,imp:27.9,gini:33.7},
  POL:{pib:0.85e12,ppc:1.80e12,pc:23014,pop:36.8e6,cresc:3.0,infla:4.1,imp:35.0,gini:28.5},
  ARG:{pib:0.60e12,ppc:1.24e12,pc:12814,pop:46.7e6,cresc:-2.8,infla:118.0,imp:28.8,gini:40.7},
  SWE:{pib:0.62e12,ppc:0.74e12,pc:58529,pop:10.5e6,cresc:0.8,infla:1.9,imp:41.4,gini:29.8},
  NOR:{pib:0.53e12,ppc:0.57e12,pc:94660,pop:5.5e6,cresc:1.6,infla:2.8,imp:42.2,gini:27.7},
  ARE:{pib:0.53e12,ppc:0.95e12,pc:53916,pop:10.1e6,cresc:3.5,infla:2.1,imp:6.5,gini:26.0},
  SGP:{pib:0.52e12,ppc:0.79e12,pc:88447,pop:6.0e6,cresc:2.6,infla:2.3,imp:13.2,gini:37.5},
  VNM:{pib:0.47e12,ppc:1.56e12,pc:4623,pop:100.3e6,cresc:6.4,infla:3.6,imp:18.5,gini:36.1},
  COL:{pib:0.39e12,ppc:1.04e12,pc:7327,pop:52.3e6,cresc:1.7,infla:5.4,imp:19.7,gini:54.8},
  ZAF:{pib:0.37e12,ppc:1.03e12,pc:5975,pop:60.4e6,cresc:1.1,infla:4.4,imp:26.2,gini:63.0},
  EGY:{pib:0.35e12,ppc:1.90e12,pc:3225,pop:112.7e6,cresc:2.8,infla:26.4,imp:15.5,gini:31.9},
  CHL:{pib:0.34e12,ppc:0.62e12,pc:16616,pop:19.6e6,cresc:2.4,infla:4.2,imp:21.3,gini:43.0},
  PER:{pib:0.28e12,ppc:0.56e12,pc:8291,pop:34.3e6,cresc:3.1,infla:2.1,imp:17.2,gini:40.3},
  NGA:{pib:0.25e12,ppc:1.44e12,pc:1110,pop:223.8e6,cresc:3.1,infla:32.7,imp:9.5,gini:35.1},
  NZL:{pib:0.25e12,ppc:0.29e12,pc:48531,pop:5.2e6,cresc:0.6,infla:2.2,imp:33.5,gini:32.5},
  URY:{pib:0.08e12,ppc:0.11e12,pc:23088,pop:3.4e6,cresc:3.2,infla:5.1,imp:27.5,gini:40.6},
  PRY:{pib:0.05e12,ppc:0.12e12,pc:6000,pop:6.9e6,cresc:3.8,infla:3.9,imp:14.2,gini:45.1}
};

const FALLBACK_CCN3 = {
  '004':'AFG','008':'ALB','012':'DZA','024':'AGO','032':'ARG','036':'AUS','040':'AUT','031':'AZE','044':'BHS','048':'BHR',
  '050':'BGD','056':'BEL','084':'BLZ','204':'BEN','064':'BTN','068':'BOL','070':'BIH','072':'BWA','076':'BRA','096':'BRN',
  '100':'BGR','854':'BFA','108':'BDI','116':'KHM','120':'CMR','124':'CAN','140':'CAF','148':'TCD','152':'CHL','156':'CHN',
  '170':'COL','178':'COG','180':'COD','188':'CRI','384':'CIV','191':'HRV','192':'CUB','196':'CYP','203':'CZE','208':'DNK',
  '262':'DJI','214':'DOM','218':'ECU','818':'EGY','222':'SLV','232':'ERI','233':'EST','231':'ETH','242':'FJI','246':'FIN',
  '250':'FRA','266':'GAB','270':'GMB','268':'GEO','276':'DEU','288':'GHA','300':'GRC','320':'GTM','324':'GIN','328':'GUY',
  '332':'HTI','340':'HND','344':'HKG','348':'HUN','352':'ISL','356':'IND','360':'IDN','364':'IRN','368':'IRQ','372':'IRL',
  '376':'ISR','380':'ITA','388':'JAM','392':'JPN','400':'JOR','398':'KAZ','404':'KEN','410':'KOR','408':'PRK','414':'KWT',
  '417':'KGZ','418':'LAO','428':'LVA','422':'LBN','426':'LSO','430':'LBR','434':'LBY','440':'LTU','442':'LUX','450':'MDG',
  '454':'MWI','458':'MYS','466':'MLI','478':'MRT','484':'MEX','498':'MDA','496':'MNG','499':'MNE','504':'MAR','508':'MOZ',
  '104':'MMR','516':'NAM','524':'NPL','528':'NLD','554':'NZL','558':'NIC','562':'NER','566':'NGA','578':'NOR','512':'OMN',
  '586':'PAK','591':'PAN','598':'PNG','600':'PRY','604':'PER','608':'PHL','616':'POL','620':'PRT','634':'QAT','642':'ROU',
  '643':'RUS','646':'RWA','682':'SAU','686':'SEN','688':'SRB','694':'SLE','702':'SGP','703':'SVK','705':'SVN','706':'SOM',
  '710':'ZAF','728':'SSD','724':'ESP','144':'LKA','729':'SDN','740':'SUR','752':'SWE','756':'CHE','760':'SYR','158':'TWN',
  '762':'TJK','834':'TZA','764':'THA','768':'TGO','780':'TTO','788':'TUN','792':'TUR','795':'TKM','800':'UGA','804':'UKR',
  '784':'ARE','826':'GBR','840':'USA','858':'URY','860':'UZB','862':'VEN','704':'VNM','887':'YEM','894':'ZMB','716':'ZWE','112':'BLR'
};

const SETORES_REAIS_ISO = {
  BRA:{serv:59,ind:21,agro:7,adm:13}, USA:{serv:72,ind:18,agro:1,adm:9}, CHN:{serv:54,ind:38,agro:7,adm:1},
  DEU:{serv:63,ind:27,agro:1,adm:9}, JPN:{serv:69,ind:28,agro:1,adm:2}, IND:{serv:49,ind:25,agro:18,adm:8},
  GBR:{serv:73,ind:17,agro:1,adm:9}, FRA:{serv:68,ind:17,agro:2,adm:13}, ITA:{serv:66,ind:23,agro:2,adm:9},
  CAN:{serv:66,ind:24,agro:2,adm:8}, RUS:{serv:53,ind:32,agro:4,adm:11}, KOR:{serv:58,ind:33,agro:2,adm:7},
  MEX:{serv:60,ind:31,agro:4,adm:5}, AUS:{serv:66,ind:25,agro:3,adm:6}, ESP:{serv:68,ind:20,agro:3,adm:9},
  IDN:{serv:43,ind:40,agro:13,adm:4}, TUR:{serv:53,ind:31,agro:6,adm:10}, NLD:{serv:70,ind:18,agro:2,adm:10},
  SAU:{serv:42,ind:49,agro:2,adm:7}, CHE:{serv:73,ind:25,agro:1,adm:1}, POL:{serv:57,ind:31,agro:3,adm:9},
  ARG:{serv:54,ind:24,agro:7,adm:15}, SWE:{serv:65,ind:22,agro:2,adm:11}, NOR:{serv:52,ind:37,agro:2,adm:9},
  ARE:{serv:48,ind:47,agro:1,adm:4}, SGP:{serv:74,ind:24,agro:0,adm:2}, VNM:{serv:42,ind:38,agro:12,adm:8},
  ZAF:{serv:61,ind:25,agro:3,adm:11}, CHL:{serv:57,ind:31,agro:4,adm:8}, COL:{serv:58,ind:24,agro:8,adm:10},
  PER:{serv:53,ind:33,agro:7,adm:7}, KAZ:{serv:54,ind:34,agro:5,adm:7}, EGY:{serv:51,ind:32,agro:11,adm:6},
  NGA:{serv:44,ind:28,agro:23,adm:5}, ETH:{serv:36,ind:22,agro:37,adm:5}, COD:{serv:33,ind:44,agro:18,adm:5},
  PAN:{serv:71,ind:22,agro:3,adm:4}, DOM:{serv:59,ind:29,agro:6,adm:6}, URY:{serv:63,ind:20,agro:7,adm:10},
  PRY:{serv:47,ind:33,agro:11,adm:9}, NZL:{serv:66,ind:21,agro:6,adm:7}
};

const SETORES_REGIAO_DEFAULT = {
  'América do Sul':{serv:56,ind:25,agro:9,adm:10}, 'América do Norte':{serv:70,ind:21,agro:2,adm:7},
  'América Central':{serv:62,ind:22,agro:9,adm:7}, 'Caribe':{serv:68,ind:18,agro:5,adm:9},
  'Europa Ocidental':{serv:70,ind:19,agro:1,adm:10}, 'Europa Central':{serv:62,ind:27,agro:2,adm:9},
  'Europa Oriental':{serv:53,ind:28,agro:8,adm:11}, 'Europa Setentrional':{serv:63,ind:25,agro:2,adm:10},
  'Europa Meridional':{serv:67,ind:20,agro:3,adm:10}, 'Norte da África':{serv:49,ind:33,agro:12,adm:6},
  'África Ocidental':{serv:45,ind:25,agro:24,adm:6}, 'África Central':{serv:36,ind:41,agro:17,adm:6},
  'África Oriental':{serv:46,ind:19,agro:29,adm:6}, 'África Austral':{serv:58,ind:26,agro:6,adm:10},
  'Ásia Oriental':{serv:58,ind:34,agro:4,adm:4}, 'Sudeste Asiático':{serv:50,ind:36,agro:10,adm:4},
  'Ásia Meridional':{serv:50,ind:26,agro:18,adm:6}, 'Ásia Central':{serv:51,ind:32,agro:10,adm:7},
  'Ásia Ocidental (Oriente Médio)':{serv:45,ind:45,agro:3,adm:7}, 'Oceania':{serv:65,ind:23,agro:5,adm:7}
};

const MOEDA_FALLBACK = {
  BRA:['BRL','Real Brasileiro'], USA:['USD','Dólar Americano'], CHN:['CNY','Yuan Chinês'],
  DEU:['EUR','Euro'], FRA:['EUR','Euro'], ITA:['EUR','Euro'], ESP:['EUR','Euro'], NLD:['EUR','Euro'], PRT:['EUR','Euro'], BEL:['EUR','Euro'], AUT:['EUR','Euro'], IRL:['EUR','Euro'], FIN:['EUR','Euro'], GRC:['EUR','Euro'],
  JPN:['JPY','Iene Japonês'], IND:['INR','Rupia Indiana'], GBR:['GBP','Libra Esterlina'], CAN:['CAD','Dólar Canadense'],
  RUS:['RUB','Rublo Russo'], KOR:['KRW','Won Sul-Coreano'], MEX:['MXN','Peso Mexicano'], AUS:['AUD','Dólar Australiano'],
  IDN:['IDR','Rupia Indonésia'], TUR:['TRY','Lira Turca'], SAU:['SAR','Rial Saudita'], CHE:['CHF','Franco Suíço'],
  POL:['PLN','Zloty Polonês'], ARG:['ARS','Peso Argentino'], SWE:['SEK','Coroa Sueca'], NOR:['NOK','Coroa Norueguesa'],
  ARE:['AED','Dirham dos EAU'], SGP:['SGD','Dólar de Singapura'], VNM:['VND','Dong Vietnamita'], ZAF:['ZAR','Rand Sul-Africano'],
  CHL:['CLP','Peso Chileno'], COL:['COP','Peso Colombiano'], PER:['PEN','Sol Peruano'], URY:['UYU','Peso Uruguaio'],
  PRY:['PYG','Guarani Paraguaio'], EGY:['EGP','Libra Egípcia'], NGA:['NGN','Naira Nigeriana'], NZL:['NZD','Dólar Neozelandês']
};

const SUBREGIOES_ISO = {
  'América do Sul': ['BRA','ARG','CHL','COL','PER','URY','PRY','BOL','ECU','VEN','GUY','SUR'],
  'América do Norte': ['USA','CAN','MEX'],
  'América Central': ['CRI','PAN','GTM','HND','SLV','NIC','BLZ'],
  'Caribe': ['CUB','DOM','HTI','JAM','TTO','BHS','BRB'],
  'Europa Ocidental': ['FRA','NLD','BEL','LUX','IRL','GBR'],
  'Europa Central': ['DEU','CHE','AUT','POL','CZE','SVK','HUN','SVN'],
  'Europa Oriental': ['RUS','UKR','ROU','BLR','BGR','MDA'],
  'Europa Setentrional': ['SWE','NOR','DNK','FIN','ISL','EST','LVA','LTU'],
  'Europa Meridional': ['ITA','ESP','PRT','GRC','HRV','SRB','CYP','MLT','ALB','BIH','MNE'],
  'Norte da África': ['EGY','MAR','DZA','TUN','LBY','SDN'],
  'África Ocidental': ['NGA','GHA','CIV','SEN','MLI','BFA','NER','GIN','BEN','TGO','SLE','LBR','MRT','GMB'],
  'África Central': ['COD','AGO','CMR','GAB','COG','TCD','CAF'],
  'África Oriental': ['ETH','KEN','TZA','UGA','RWA','MOZ','MDG','SOM','SSD','ERI','DJI','MWI','BDI'],
  'África Austral': ['ZAF','BWA','NAM','ZWE','ZMB','LSO'],
  'Ásia Oriental': ['CHN','JPN','KOR','PRK','MNG','HKG','TWN'],
  'Sudeste Asiático': ['IDN','VNM','THA','MYS','SGP','PHL','MMR','KHM','LAO','BRN'],
  'Ásia Meridional': ['IND','PAK','BGD','LKA','NPL','AFG','BTN'],
  'Ásia Central': ['KAZ','UZB','TKM','KGZ','TJK'],
  'Ásia Ocidental (Oriente Médio)': ['SAU','ARE','TUR','ISR','IRN','IRQ','QAT','KWT','OMN','JOR','LBN','BHR','SYR','YEM','AZE','GEO'],
  'Oceania': ['AUS','NZL','PNG','FJI']
};

const SUBREGIAO_PT = {
  'South America':'América do Sul', 'North America':'América do Norte', 'Central America':'América Central', 'Caribbean':'Caribe',
  'Western Europe':'Europa Ocidental', 'Eastern Europe':'Europa Oriental', 'Central Europe':'Europa Central', 'Northern Europe':'Europa Setentrional', 'Southern Europe':'Europa Meridional',
  'Northern Africa':'Norte da África', 'Western Africa':'África Ocidental', 'Middle Africa':'África Central', 'Eastern Africa':'África Oriental', 'Southern Africa':'África Austral',
  'Eastern Asia':'Ásia Oriental', 'South-Eastern Asia':'Sudeste Asiático', 'Southern Asia':'Ásia Meridional', 'Central Asia':'Ásia Central', 'Western Asia':'Ásia Ocidental (Oriente Médio)',
  'Australia and New Zealand':'Oceania', 'Melanesia':'Oceania', 'Micronesia':'Oceania', 'Polynesia':'Oceania'
};
const REGIAO_PT = { Americas:'Américas', Europe:'Europa', Asia:'Ásia', Africa:'África', Oceania:'Oceania' };

const IDH_PNUD = {
  CHE:0.967, NOR:0.966, ISL:0.959, HKG:0.956, DNK:0.952, SWE:0.952, DEU:0.950, IRL:0.950, SGP:0.949, AUS:0.946, NLD:0.946,
  BEL:0.942, FIN:0.942, GBR:0.940, NZL:0.939, ARE:0.937, CAN:0.935, KOR:0.929, LUX:0.927, USA:0.927, AUT:0.926, SVN:0.926,
  JPN:0.920, ISR:0.915, MLT:0.915, ESP:0.911, FRA:0.910, CYP:0.907, ITA:0.906, EST:0.899, CZE:0.895, GRC:0.893, BHR:0.888,
  POL:0.881, LTU:0.879, SAU:0.875, QAT:0.875, PRT:0.874, CHL:0.860, TUR:0.855, HUN:0.851, ARG:0.849, ROU:0.827, URY:0.830,
  PAN:0.832, RUS:0.821, KAZ:0.802, MYS:0.807, CRI:0.806, THA:0.803, CHN:0.788, MEX:0.781, DOM:0.767, PER:0.762, BRA:0.760,
  COL:0.758, UKR:0.734, PRY:0.731, EGY:0.728, VNM:0.726, ZAF:0.717, IDN:0.713, PHL:0.710, MAR:0.698, IND:0.644, KEN:0.601,
  NGA:0.548, ETH:0.498, COD:0.481
};

const VOCACAO_PAIS = {
  BRA: 'Agronegócio, Energia, Mineração & Serviços',
  USA: 'Tecnologia, Serviços Financeiros, Energia & Indústria Avançada',
  CHN: 'Manufatura Global, Eletrônicos, Infraestrutura & Exportação',
  DEU: 'Engenharia Mecânica, Automotivo, Químico & Exportação Industrial',
  JPN: 'Alta Tecnologia, Automotivo, Robótica & Serviços',
  IND: 'Serviços de TI, Farmacêuticos, Manufatura & Mercado Interno',
  GBR: 'Serviços Financeiros, Tecnologia, Aeroespacial & Energia',
  FRA: 'Aeroespacial, Luxo, Turismo, Energia Nuclear & Agronegócio',
  ITA: 'Manufatura de Precisão, Design, Turismo & Agroindústria',
  CAN: 'Energia, Mineração, Recursos Naturais & Serviços',
  RUS: 'Energia (Petróleo e Gás), Mineração, Grãos & Defesa',
  KOR: 'Semicondutores, Eletrônicos, Naval & Automotivo',
  MEX: 'Manufatura Integrada (USMCA), Automotivo & Petróleo',
  AUS: 'Mineração (Ferro/Lítio), Energia, Agronegócio & Serviços',
  ESP: 'Turismo, Energias Renováveis, Serviços & Agroindústria',
  IDN: 'Recursos Naturais, Níquel, Óleo de Palma & Consumo Interno',
  TUR: 'Manufatura, Têxtil, Turismo & Logística Euroasiática',
  NLD: 'Logística Portuária (Roterdã), Finanças, Agro-Tech & Semicondutores',
  SAU: 'Petróleo, Petroquímica & Transição Energética/Serviços',
  CHE: 'Finanças Privadas, Farmacêuticos & Indústria de Precisão',
  ARG: 'Agronegócio (Soja/Milho), Energia (Vaca Muerta) & Lítio',
  CHL: 'Mineração (Cobre e Lítio), Agronegócio & Serviços',
  SGP: 'Hub Financeiro, Logística Marítima & Eletrônicos',
  ARE: 'Hub Financeiro, Logística Aérea, Turismo & Petróleo',
  ZAF: 'Mineração (Ouro/Platina), Serviços Financeiros & Indústria',
  NGA: 'Petróleo, Agricultura & Serviços Digitais',
  URY: 'Agronegócio, Serviços Digitais & Finanças Regionais'
};

const VOCACAO_REGIAO = {
  'Américas': 'Agronegócio em escala global, tecnologia, energia e serviços',
  'Europa': 'Indústria de alta precisão, serviços financeiros, turismo e transição verde',
  'Ásia': 'Manufatura global, semicondutores, tecnologia e grandes mercados consumidores',
  'África': 'Recursos minerais, energia, agricultura e forte expansão demográfica',
  'Oceania': 'Mineração, agronegócio exportador e serviços avançados',
  'América do Norte': 'Tecnologia, finanças globais, energia e manufatura integrada',
  'América Central': 'Logística interoceânica, turismo, serviços e agricultura tropical',
  'Caribe': 'Turismo internacional, serviços financeiros e remessas',
  'América do Sul': 'Commodities agrícolas, mineração estratégica, petróleo e energia limpa',
  'América Latina': 'Agronegócio, mineração, manufatura regional e serviços',
  'Europa Ocidental': 'Serviços financeiros, aeroespacial, logística portuária e luxo',
  'Europa Oriental': 'Energia, agricultura extensiva, manufatura e serviços de TI',
  'Europa Central': 'Indústria pesada, automotivo, engenharia e finanças',
  'Europa Setentrional': 'Tecnologia limpa, finanças, petróleo/gás e inovação social',
  'Europa Meridional': 'Turismo, agroindústria, manufatura e logística mediterrânea',
  'Norte da África': 'Energia (gás/petróleo), turismo, agricultura e logística no Canal de Suez',
  'África Ocidental': 'Petróleo, cacau, mineração e comércio regional',
  'África Central': 'Minerais críticos (cobalto/cobre), petróleo e recursos florestais',
  'África Oriental': 'Agricultura, serviços móveis/digitais e logística do Índico',
  'África Austral': 'Mineração industrial, serviços financeiros e agricultura',
  'Ásia Oriental': 'Semicondutores, eletrônicos, robótica e manufatura exportadora',
  'Sudeste Asiático': 'Cadeias industriais eletrônicas, logística marítima e commodities',
  'Ásia Meridional': 'Serviços de TI, farmacêuticos, têxtil e mercado interno massivo',
  'Ásia Central': 'Energia (petróleo/gás), urânio, mineração e rotas terrestres',
  'Ásia Ocidental (Oriente Médio)': 'Petróleo, gás natural, logística aérea e fundos soberanos',
  'Eurásia': 'Corredor energético, manufatura pesada e comércio intercontinental',
  'G7': 'Economias avançadas líderes em tecnologia, finanças e pesquisa',
  'G20': 'Cerca de 85% do PIB global — reúne potências desenvolvidas e emergentes',
  'BRICS+': 'Grandes mercados emergentes, commodities, energia e manufatura',
  'Mercosul': 'Potência agroalimentar, integração industrial e energia',
  'União Europeia': 'Mercado único integrado de indústria avançada, serviços e regulação'
};

const COMERCIO_EXTRA = {
  BRA: { parceiros: [['China', 30.7], ['Estados Unidos', 11.2], ['Argentina', 4.9], ['Países Baixos', 3.6], ['Espanha', 2.9]], produtos: ['Soja em grãos', 'Petróleo bruto', 'Minério de ferro', 'Açúcar e carnes', 'Celulose e milho'] },
  USA: { parceiros: [['Canadá', 17.5], ['México', 16.0], ['China', 7.3], ['Países Baixos', 4.1], ['Alemanha', 3.8]], produtos: ['Petróleo refinado e gás', 'Aeronaves e peças', 'Semicondutores e TI', 'Veículos e máquinas', 'Farmacêuticos'] },
  CHN: { parceiros: [['Estados Unidos', 14.8], ['Hong Kong', 8.1], ['Japão', 4.6], ['Coreia do Sul', 4.4], ['Vietnã', 4.1]], produtos: ['Equipamentos de telecomunicação', 'Computadores e eletrônicos', 'Circuitos integrados', 'Veículos elétricos e baterias', 'Maquinário industrial'] },
  DEU: { parceiros: [['Estados Unidos', 9.9], ['França', 7.4], ['Países Baixos', 7.1], ['China', 6.1], ['Polônia', 5.7]], produtos: ['Automóveis e autopeças', 'Maquinário industrial', 'Produtos farmacêuticos', 'Equipamentos elétricos', 'Químicos'] },
  JPN: { parceiros: [['Estados Unidos', 20.2], ['China', 17.6], ['Coreia do Sul', 6.5], ['Taiwan', 6.2], ['Tailândia', 4.1]], produtos: ['Veículos e autopeças', 'Máquinas de semicondutores', 'Circuitos integrados', 'Aço e navios', 'Instrumentos de precisão'] },
  IND: { parceiros: [['Estados Unidos', 17.7], ['Emirados Árabes', 8.1], ['Países Baixos', 5.1], ['China', 3.8], ['Singapura', 3.3]], produtos: ['Combustíveis refinados', 'Diamantes e joias', 'Medicamentos genéricos', 'Serviços de TI e software', 'Arroz e têxteis'] },
  GBR: { parceiros: [['Estados Unidos', 15.4], ['Alemanha', 8.5], ['Países Baixos', 7.9], ['Irlanda', 7.2], ['França', 6.3]], produtos: ['Serviços financeiros', 'Turbinas e motores', 'Automóveis', 'Farmacêuticos', 'Ouro e petróleo'] },
  FRA: { parceiros: [['Alemanha', 13.7], ['Itália', 8.9], ['Estados Unidos', 7.6], ['Bélgica', 7.5], ['Espanha', 7.4]], produtos: ['Aeronaves (Airbus)', 'Farmacêuticos', 'Cosméticos e luxo', 'Vinhos e destilados', 'Automóveis'] },
  ARG: { parceiros: [['Brasil', 17.8], ['China', 7.9], ['Estados Unidos', 8.4], ['Chile', 7.4], ['Índia', 3.8]], produtos: ['Farelo e óleo de soja', 'Milho e trigo', 'Petróleo e lítio', 'Carne bovina', 'Veículos utilitários'] },
  MEX: { parceiros: [['Estados Unidos', 83.1], ['Canadá', 3.0], ['China', 1.6], ['Alemanha', 1.3], ['Brasil', 0.8]], produtos: ['Automóveis e caminhões', 'Autopeças', 'Computadores e TVs', 'Equipamentos médicos', 'Petróleo bruto'] }
};

const SETS = {
  blocos: {
    'G7': ['USA','CAN','GBR','FRA','DEU','ITA','JPN'],
    'G20': ['ARG','AUS','BRA','CAN','CHN','FRA','DEU','IND','IDN','ITA','JPN','MEX','RUS','SAU','ZAF','KOR','TUR','GBR','USA'],
    'BRICS+': ['BRA','RUS','IND','CHN','ZAF','EGY','ETH','IRN','ARE','IDN'],
    'Mercosul': ['BRA','ARG','URY','PRY','BOL'],
    'União Europeia': ['AUT','BEL','BGR','HRV','CYP','CZE','DNK','EST','FIN','FRA','DEU','GRC','HUN','IRL','ITA','LVA','LTU','LUX','MLT','NLD','POL','PRT','ROU','SVK','SVN','ESP','SWE'],
    'USMCA': ['USA','CAN','MEX'],
    'ASEAN': ['BRN','KHM','IDN','LAO','MYS','MMR','PHL','SGP','THA','VNM'],
    'APEC': ['AUS','BRN','CAN','CHL','CHN','HKG','IDN','JPN','KOR','MYS','MEX','NZL','PNG','PER','PHL','RUS','SGP','TWN','THA','USA','VNM'],
    'União Africana': ['DZA','AGO','BEN','BWA','BFA','BDI','CMR','CAF','TCD','COG','COD','CIV','DJI','EGY','ERI','ETH','GAB','GMB','GHA','GIN','KEN','LSO','LBR','LBY','MDG','MWI','MLI','MRT','MAR','MOZ','NAM','NER','NGA','RWA','SEN','SLE','SOM','ZAF','SSD','SDN','TZA','TGO','TUN','UGA','ZMB','ZWE'],
    'Comunidade Andina': ['BOL','COL','ECU','PER'],
    'CPTPP': ['AUS','BRN','CAN','CHL','JPN','MYS','MEX','NZL','PER','SGP','VNM','GBR'],
    'EFTA': ['ISL','NOR','CHE'],
    'GCC (Conselho de Cooperação do Golfo)': ['BHR','KWT','OMN','QAT','SAU','ARE']
  },
  geopol: {
    'Ocidente': ['USA','CAN','GBR','FRA','DEU','ITA','ESP','PRT','NLD','BEL','LUX','CHE','AUT','SWE','NOR','DNK','FIN','ISL','IRL','GRC','POL','CZE','SVK','HUN','AUS','NZL','JPN','KOR'],
    'Oriente': ['CHN','JPN','KOR','IND','IDN','VNM','THA','MYS','SGP','PHL','PAK','BGD','RUS','SAU','ARE','IRN','TUR','KAZ'],
    'Norte Global': ['USA','CAN','GBR','FRA','DEU','ITA','ESP','PRT','NLD','BEL','CHE','AUT','SWE','NOR','DNK','FIN','IRL','POL','CZE','AUS','NZL','JPN','KOR','SGP','ISR','RUS'],
    'América Latina': ['BRA','ARG','MEX','COL','CHL','PER','URY','PRY','BOL','ECU','VEN','CRI','PAN','DOM','CUB','GTM','HND','SLV','NIC'],
    'América Anglo-Saxônica': ['USA','CAN'],
    'Mundo Árabe': ['SAU','ARE','EGY','MAR','DZA','TUN','LBY','IRQ','JOR','LBN','OMN','QAT','KWT','BHR','YEM','SDN','SYR'],
    'Mundo Islâmico': ['IDN','PAK','BGD','NGA','EGY','TUR','IRN','SAU','ARE','MYS','MAR','DZA','IRQ','KAZ','UZB','QAT','KWT','OMN','JOR'],
    'Espaço Pós-Soviético': ['RUS','UKR','KAZ','UZB','BLR','AZE','GEO','TKM','KGZ','TJK','MDA','EST','LVA','LTU'],
    'Eurásia': ['RUS','CHN','KAZ','TUR','DEU','FRA','ITA','ESP','POL','UKR','IND','IRN','NLD','SWE','NOR','CHE'],
    'Países Não Alinhados': ['IND','IDN','EGY','ZAF','NGA','ETH','COD','VNM','MYS','CUB','VEN','COL','PER','CHL','MAR','DZA','KEN']
  },
  rankings: {
    'Maiores exportadores': ['CHN','USA','DEU','NLD','JPN','ITA','FRA','KOR','MEX','GBR','SGP','VNM'],
    'Maiores importadores': ['USA','CHN','DEU','GBR','NLD','FRA','JPN','IND','ITA','KOR','MEX','CAN'],
    'Potências militares': ['USA','RUS','CHN','IND','KOR','GBR','JPN','TUR','PAK','ITA','FRA','BRA'],
    'Potências energéticas': ['USA','SAU','RUS','CHN','CAN','NOR','AUS','IRN','QAT','BRA','IND','IDN'],
    'Países produtores de petróleo': ['USA','SAU','RUS','CAN','IRQ','CHN','ARE','BRA','IRN','KWT','NOR','MEX','KAZ','NGA'],
    'Principais centros financeiros': ['USA','GBR','SGP','HKG','CHE','JPN','DEU','FRA','CHN','ARE','NLD','LUX'],
    'Economias mais industrializadas': ['CHN','USA','JPN','DEU','IND','KOR','ITA','FRA','GBR','MEX','BRA','IDN','VNM'],
    'Países com maior participação no comércio mundial': ['CHN','USA','DEU','NLD','JPN','GBR','FRA','KOR','ITA','SGP','MEX','PAN']
  }
};

const CATEGORIAS_FILTRO = {
  cont: { label: 'Continentes', opcoes: ['Todos os países', 'Américas', 'Europa', 'Ásia', 'África', 'Oceania'] },
  reg: {
    label: 'Regiões geográficas e sub-regiões',
    opcoes: [
      'América do Sul', 'América Latina', 'América do Norte', 'América Central', 'Caribe',
      'Europa Ocidental', 'Europa Oriental', 'Europa Central', 'Europa Setentrional', 'Europa Meridional',
      'Norte da África', 'África Ocidental', 'África Central', 'África Oriental', 'África Austral',
      'Ásia Oriental', 'Sudeste Asiático', 'Ásia Meridional', 'Ásia Central', 'Ásia Ocidental (Oriente Médio)',
      'Eurásia', 'Oceania'
    ]
  },
  blocos: { label: 'Blocos e agrupamentos econômicos', opcoes: Object.keys(SETS.blocos) },
  geopol: { label: 'Divisões geopolíticas', opcoes: ['Ocidente','Oriente','Norte Global','Sul Global','América Latina','América Anglo-Saxônica','Mundo Árabe','Mundo Islâmico','Espaço Pós-Soviético','Eurásia','Países Não Alinhados'] },
  desenv: { label: 'Indicadores de desenvolvimento', opcoes: ['Países desenvolvidos','Países em desenvolvimento','Economias emergentes'] },
  rank: { label: 'Rankings econômicos e geopolíticos', opcoes: ['Maiores economias do mundo','Maiores populações',...Object.keys(SETS.rankings)] }
};