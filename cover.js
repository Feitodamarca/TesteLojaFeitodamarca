/* Gera capas de produto em SVG (placeholders de demonstração, sem imagens externas).
 * Quando o produto tiver imagens reais (admin ou Supabase Storage), elas têm prioridade. */
(function () {
  const F = (window.FDM = window.FDM || {});

  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    let a = seed;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const xml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));

  // [fundo, tinta, cor A, cor B]
  const PAL = [
    ['#FF4B1F', '#111111', '#F4F1EA', '#FFD60A'],
    ['#2B3CFF', '#F4F1EA', '#111111', '#FF8FB1'],
    ['#FFD60A', '#111111', '#2B3CFF', '#F4F1EA'],
    ['#1FBF75', '#111111', '#F4F1EA', '#FF4B1F'],
    ['#FF8FB1', '#2B3CFF', '#111111', '#F4F1EA'],
    ['#111111', '#FF4B1F', '#F4F1EA', '#FFD60A'],
    ['#C9B6FF', '#111111', '#FF4B1F', '#F4F1EA'],
    ['#F4F1EA', '#111111', '#2B3CFF', '#FF4B1F']
  ];

  function art(p, v) {
    const a = p.art || {};
    const r = rng(hash(p.id + ':' + v));
    const base = a.palette != null ? a.palette : hash(p.id) % PAL.length;
    const [bg, ink, ca, cb] = PAL[(base + v) % PAL.length];
    const pat = ((a.pattern != null ? a.pattern : hash(p.id + 'p') % 6) + v) % 6;
    const cols = [ca, cb, ink];
    let s = `<rect width="600" height="750" fill="${bg}"/>`;

    if (pat === 0) { // círculos
      for (let i = 0; i < 5; i++) {
        s += `<circle cx="${(r() * 600) | 0}" cy="${(r() * 600) | 0}" r="${(70 + r() * 150) | 0}" fill="${cols[i % 3]}"/>`;
      }
      s += `<circle cx="${(150 + r() * 300) | 0}" cy="${(150 + r() * 300) | 0}" r="120" fill="none" stroke="${ink}" stroke-width="10"/>`;
    } else if (pat === 1) { // listras diagonais
      s += '<g transform="rotate(-18 300 375)">';
      let x = -200;
      for (let i = 0; x < 900; i++) { const w = 30 + r() * 60; s += `<rect x="${x | 0}" y="-300" width="${w | 0}" height="1400" fill="${cols[i % 3]}"/>`; x += w + 14 + r() * 24; }
      s += '</g>';
    } else if (pat === 2) { // arcos
      for (let i = 0; i < 3; i++) {
        const x = i * 200, y = 250 + r() * 300;
        s += `<path d="M${x} 750 L${x} ${(y + 100) | 0} A100 100 0 0 1 ${x + 200} ${(y + 100) | 0} L${x + 200} 750 Z" fill="${cols[i % 3]}"/>`;
      }
      s += `<circle cx="${(100 + r() * 400) | 0}" cy="140" r="60" fill="${cols[(r() * 3) | 0]}"/>`;
    } else if (pat === 3) { // grade
      for (let row = 0; row < 5; row++) for (let col = 0; col < 4; col++) {
        const x = col * 150, y = row * 150, c = cols[(r() * 3) | 0], t = (r() * 4) | 0;
        if (t === 0) s += `<path d="M${x} ${y + 150} V${y} A150 150 0 0 1 ${x + 150} ${y + 150} Z" fill="${c}"/>`;
        else if (t === 1) s += `<circle cx="${x + 75}" cy="${y + 75}" r="62" fill="${c}"/>`;
        else if (t === 2) s += `<rect x="${x + 14}" y="${y + 14}" width="122" height="122" fill="${c}"/>`;
      }
    } else if (pat === 4) { // elipses
      for (let i = 0; i < 5; i++) {
        s += `<ellipse cx="${(r() * 600) | 0}" cy="${(r() * 600) | 0}" rx="${(60 + r() * 150) | 0}" ry="${(40 + r() * 90) | 0}" transform="rotate(${(r() * 180) | 0} 300 375)" fill="${cols[i % 3]}"/>`;
      }
    } else { // tipografia
      const ch = xml((p.name || 'F').trim().charAt(0).toUpperCase());
      s += `<circle cx="${(300 + r() * 160) | 0}" cy="210" r="150" fill="${cb}"/>`;
      s += `<text x="30" y="590" font-family="Arial Black, Impact, sans-serif" font-size="640" fill="${ca}" stroke="${ink}" stroke-width="8">${ch}</text>`;
    }

    const label = xml((p.name || '').toUpperCase().slice(0, 24));
    s += `<rect x="0" y="650" width="600" height="100" fill="#111"/>`;
    s += `<text x="28" y="712" font-family="Arial Black, Impact, sans-serif" font-size="30" fill="#F4F1EA">${label}</text>`;
    s += `<rect x="24" y="24" width="86" height="34" fill="#111"/><text x="36" y="48" font-family="Arial Black, sans-serif" font-size="16" fill="#F4F1EA">FDM</text>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 750" width="600" height="750">${s}</svg>`;
  }

  F.cover = function (p, v) {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(art(p, v || 0));
  };

  // Só aceita imagens de dados ou https (evita esquemas perigosos)
  const safeSrc = u => typeof u === 'string' && (/^data:image\/(png|jpe?g|webp|gif);/i.test(u) || /^https:\/\//i.test(u));

  F.img = function (p, i) {
    i = i || 0;
    const imgs = (p.images || []).filter(safeSrc);
    if (imgs.length && imgs[i]) return imgs[i];
    if (imgs.length) return imgs[0];
    return F.cover(p, i);
  };
  F.imgCount = p => Math.max(1, (p.images || []).filter(safeSrc).length || 4);
})();
