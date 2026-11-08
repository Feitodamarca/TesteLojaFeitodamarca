/* FEITO DA MARCA — DADOS DE DEMONSTRAÇÃO
 * Todos os produtos, criadores, preços e vendas abaixo são FICTÍCIOS.
 * Em produção, estes dados virão do banco (Supabase) — ver docs/ARQUITETURA.md.
 */
(function () {
  const F = (window.FDM = window.FDM || {});

  const categories = [
    ['templates-redes-sociais', 'Templates para redes sociais'],
    ['identidade-visual', 'Identidade visual'],
    ['logotipos', 'Logotipos'],
    ['mockups', 'Mockups'],
    ['apresentacoes', 'Apresentações'],
    ['templates-sites', 'Templates de sites'],
    ['arquivos-impressao', 'Arquivos para impressão'],
    ['fontes', 'Fontes e tipografia'],
    ['ilustracoes', 'Ilustrações'],
    ['elementos-graficos', 'Elementos gráficos'],
    ['templates-canva', 'Templates para Canva'],
    ['branding', 'Materiais para branding'],
    ['ferramentas-designers', 'Ferramentas para designers'],
    ['outros', 'Outros recursos digitais']
  ].map(([id, name]) => ({ id, name }));

  const creators = [
    { id: 'estudio-cacto', name: 'Estúdio Cacto', bio: 'Coletivo de design independente focado em sistemas visuais para redes sociais. (Criador fictício de demonstração)', link: '' },
    { id: 'luma-ferraz', name: 'Luma Ferraz', bio: 'Designer de marcas e identidades com foco em pequenos negócios. (Criadora fictícia de demonstração)', link: '' },
    { id: 'tipo-quente', name: 'Tipo Quente', bio: 'Fundição tipográfica independente. (Criador fictício de demonstração)', link: '' },
    { id: 'oficina-pixel-sul', name: 'Oficina Pixel Sul', bio: 'Mockups, UI kits e ferramentas para designers. (Criador fictício de demonstração)', link: '' },
    { id: 'nina-araujo', name: 'Nina Araújo', bio: 'Ilustradora e criadora de elementos gráficos. (Criadora fictícia de demonstração)', link: '' }
  ];

  // Padrões por categoria (formatos, programas, conteúdo do download)
  const D = {
    'templates-redes-sociais': { formats: ['PSD', 'FIG', 'PNG'], software: ['Photoshop', 'Figma'], includes: ['Layouts editáveis para feed e stories', 'Guia de fontes e cores', 'Arquivo de instruções'] },
    'identidade-visual': { formats: ['AI', 'PDF', 'SVG'], software: ['Illustrator', 'Figma'], includes: ['Arquivos vetoriais editáveis', 'Paleta de cores e tipografia', 'Guia de uso da marca'] },
    'logotipos': { formats: ['AI', 'SVG', 'PNG'], software: ['Illustrator', 'Inkscape'], includes: ['Logotipos vetoriais', 'Versões positiva e negativa', 'Arquivos de exportação PNG'] },
    'mockups': { formats: ['PSD', 'PNG'], software: ['Photoshop'], includes: ['Arquivos PSD com smart objects', 'Cenas em alta resolução', 'Guia rápido de edição'] },
    'apresentacoes': { formats: ['PPTX', 'KEY', 'PDF'], software: ['PowerPoint', 'Keynote', 'Google Slides'], includes: ['Slides editáveis 16:9', 'Ícones e gráficos', 'Guia de fontes'] },
    'templates-sites': { formats: ['HTML', 'CSS', 'FIG'], software: ['Figma', 'Qualquer editor de código'], includes: ['Páginas prontas em HTML/CSS', 'Arquivo Figma organizado', 'Documentação'] },
    'arquivos-impressao': { formats: ['PDF', 'AI', 'INDD'], software: ['InDesign', 'Illustrator'], includes: ['Arquivos prontos para gráfica', 'Sangria e marcas de corte', 'Versões CMYK'] },
    'fontes': { formats: ['OTF', 'TTF', 'WOFF2'], software: ['Qualquer programa de design'], includes: ['Fonte em múltiplos pesos', 'Arquivos para web (WOFF2)', 'Amostra de glifos'] },
    'ilustracoes': { formats: ['AI', 'SVG', 'PNG'], software: ['Illustrator', 'Procreate'], includes: ['Ilustrações vetoriais', 'Versões em PNG transparente', 'Paleta de cores'] },
    'elementos-graficos': { formats: ['SVG', 'PNG', 'AI'], software: ['Illustrator', 'Figma', 'Canva'], includes: ['Elementos em vetor', 'PNGs com fundo transparente', 'Guia de uso'] },
    'templates-canva': { formats: ['Link Canva'], software: ['Canva'], includes: ['Link para template editável', 'Guia de fontes gratuitas', 'Instruções de edição'] },
    'branding': { formats: ['PDF', 'AI', 'INDD'], software: ['Illustrator', 'InDesign'], includes: ['Papelaria e aplicações', 'Arquivos editáveis', 'Guia de marca'] },
    'ferramentas-designers': { formats: ['FIG', 'SKETCH', 'PDF'], software: ['Figma', 'Sketch'], includes: ['Biblioteca de componentes', 'Estilos de cor e texto', 'Documentação'] },
    'outros': { formats: ['PDF', 'ZIP'], software: ['Leitor de PDF'], includes: ['Material digital completo', 'Arquivos de apoio'] }
  };

  const LIC = 'Licença padrão: uso pessoal e comercial em projetos próprios e de clientes (até 1 projeto final por cliente). Proibido revender, redistribuir ou compartilhar os arquivos originais.';
  const LIC_FREE = 'Licença gratuita: uso pessoal e comercial permitido com crédito ao criador. Proibido revender ou redistribuir os arquivos originais.';

  // [id, nome, categoria, criador, preço, promo, descrição, opções]
  // opções: f=destaque, n=novidade, s=vendas, pop=popularidade, d=data, pal=paleta, pat=padrão
  const raw = [
    ['kit-feed-pulso', 'Kit Feed Pulso', 'templates-redes-sociais', 'estudio-cacto', 79, 59, 'Pacote com 40 layouts para feed e stories com tipografia grande e composição ousada. Ideal para marcas que querem um Instagram com personalidade.', { f: 1, n: 1, s: 320, pop: 95, d: '2026-10-30', pal: 0, pat: 0 }],
    ['identidade-casa-de-barro', 'Identidade Casa de Barro', 'identidade-visual', 'luma-ferraz', 189, 0, 'Sistema de identidade visual completo e editável para negócios artesanais e de bem-estar: logotipo, paleta, tipografia e aplicações.', { f: 1, s: 142, pop: 80, d: '2026-09-12', pal: 1, pat: 2 }],
    ['logo-pack-simbolos-vivos', 'Logo Pack Símbolos Vivos', 'logotipos', 'luma-ferraz', 99, 79, '60 símbolos vetoriais prontos para personalizar e transformar em logotipos exclusivos.', { s: 410, pop: 88, d: '2026-08-02', pal: 2, pat: 4 }],
    ['mockup-sacola-kraft', 'Mockup Sacola Kraft', 'mockups', 'oficina-pixel-sul', 49, 0, 'Mockup realista de sacola de papel kraft com 6 ângulos, sombras ajustáveis e cores editáveis.', { n: 1, s: 96, pop: 70, d: '2026-11-02', pal: 3, pat: 1 }],
    ['mockup-embalagem-caixa', 'Mockup Embalagem em Caixa', 'mockups', 'oficina-pixel-sul', 59, 45, 'Cenas fotográficas de embalagens em caixa para apresentar identidades e produtos.', { f: 1, s: 205, pop: 84, d: '2026-07-20', pal: 5, pat: 3 }],
    ['deck-pitch-ousado', 'Deck Pitch Ousado', 'apresentacoes', 'estudio-cacto', 69, 0, '35 slides para pitch, portfólio e propostas comerciais com visual editorial.', { s: 178, pop: 76, d: '2026-06-18', pal: 7, pat: 5 }],
    ['site-loja-minima', 'Site Loja Mínima', 'templates-sites', 'oficina-pixel-sul', 149, 119, 'Template de loja virtual em HTML/CSS com 8 páginas e arquivo Figma incluso.', { f: 1, s: 88, pop: 72, d: '2026-10-05', pal: 4, pat: 3 }],
    ['cartao-visita-risco', 'Cartão de Visita Risco', 'arquivos-impressao', 'luma-ferraz', 29, 0, '12 modelos de cartão de visita prontos para gráfica, com sangria e versões CMYK.', { s: 260, pop: 60, d: '2026-05-14', pal: 6, pat: 1 }],
    ['fonte-quente-display', 'Quente Display', 'fontes', 'tipo-quente', 89, 69, 'Fonte display de alto contraste, com 3 pesos e alternativas estilísticas para títulos marcantes.', { f: 1, n: 1, s: 354, pop: 97, d: '2026-11-04', pal: 0, pat: 5 }],
    ['fonte-grafite-sans', 'Grafite Sans', 'fontes', 'tipo-quente', 0, 0, 'Sans serif geométrica gratuita com 2 pesos, perfeita para interfaces e textos curtos.', { s: 1200, pop: 99, d: '2026-04-08', pal: 7, pat: 5 }],
    ['ilustracoes-bichos-tropicais', 'Bichos Tropicais', 'ilustracoes', 'nina-araujo', 59, 0, '24 ilustrações vetoriais de fauna tropical em estilo colorido e recortado.', { n: 1, s: 74, pop: 68, d: '2026-10-22', pal: 3, pat: 4 }],
    ['formas-soltas', 'Formas Soltas', 'elementos-graficos', 'nina-araujo', 39, 29, '150 formas orgânicas e geométricas em vetor para composições experimentais.', { s: 233, pop: 78, d: '2026-08-30', pal: 2, pat: 0 }],
    ['pack-canva-promo', 'Pack Canva Promo', 'templates-canva', 'estudio-cacto', 35, 0, '25 templates de promoção e lançamento editáveis direto no Canva.', { s: 512, pop: 86, d: '2026-09-25', pal: 1, pat: 1 }],
    ['kit-branding-completo', 'Kit Branding Completo', 'branding', 'luma-ferraz', 229, 179, 'Papelaria, social, embalagens e manual de marca em arquivos editáveis para entregar projetos completos.', { f: 1, s: 119, pop: 82, d: '2026-10-01', pal: 5, pat: 2 }],
    ['ui-kit-componentes', 'UI Kit Componentes', 'ferramentas-designers', 'oficina-pixel-sul', 129, 0, 'Biblioteca Figma com mais de 300 componentes, variáveis e estilos para prototipar rápido.', { n: 1, s: 66, pop: 74, d: '2026-11-06', pal: 4, pat: 3 }],
    ['planilha-precificacao', 'Guia de Precificação para Designers', 'outros', 'luma-ferraz', 0, 0, 'Material gratuito em PDF com método e planilha para calcular o preço dos seus projetos.', { s: 880, pop: 91, d: '2026-03-19', pal: 6, pat: 0 }],
    ['stories-lancamento', 'Stories Lançamento', 'templates-redes-sociais', 'estudio-cacto', 45, 0, '18 stories animáveis para campanhas de lançamento e contagem regressiva.', { s: 140, pop: 66, d: '2026-09-02', pal: 5, pat: 1 }],
    ['mockup-camiseta-street', 'Mockup Camiseta Street', 'mockups', 'oficina-pixel-sul', 39, 29, 'Mockups de camisetas em ambientes urbanos com variações de cor e modelagem.', { s: 187, pop: 79, d: '2026-07-07', pal: 2, pat: 2 }]
  ];

  const products = raw.map(([id, name, cat, creator, price, sale, description, o]) => {
    const d = D[cat];
    const free = price === 0;
    return {
      id, name, categoryId: cat, creatorId: creator,
      price, salePrice: sale || 0,
      description,
      formats: d.formats.slice(), software: d.software.slice(), includes: d.includes.slice(),
      license: free ? LIC_FREE : LIC,
      isFeatured: !!o.f, isNew: !!o.n, active: true,
      sales: o.s || 0, popularity: o.pop || 0, createdAt: o.d,
      art: { palette: o.pal, pattern: o.pat },
      images: [],
      demo: true
    };
  });

  F.seed = { version: 1, categories, creators, products };
})();
