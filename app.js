/* FEITO DA MARCA — aplicação da loja (rotas por hash, sem dependências) */
(function () {
  const F = window.FDM, S = F.store;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const brl = n => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
  const onSale = p => p.salePrice > 0 && p.salePrice < p.price;
  const eff = p => (onSale(p) ? p.salePrice : p.price);
  const isFree = p => eff(p) === 0;
  const pct = p => Math.round((1 - p.salePrice / p.price) * 100);
  const main = $('#main');

  /* ---------- Componentes ---------- */
  const heart = '<svg width="22" height="22" viewBox="0 0 24 24" stroke-linejoin="round"><path d="M12 20.5s-8-4.9-8-11A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5c0 6.1-8 11-8 11z"/></svg>';

  function priceHtml(p, lg) {
    if (isFree(p)) return `<div class="price${lg ? ' price--lg' : ''}"><span class="price__now">GRÁTIS</span></div>`;
    if (onSale(p)) return `<div class="price${lg ? ' price--lg' : ''}"><span class="price__now">${brl(p.salePrice)}</span><s>${brl(p.price)}</s></div>`;
    return `<div class="price${lg ? ' price--lg' : ''}"><span class="price__now">${brl(p.price)}</span></div>`;
  }
  function tagsHtml(p) {
    const t = [];
    if (isFree(p)) t.push('<span class="tag tag--free">Grátis</span>');
    if (p.isNew) t.push('<span class="tag tag--new">Novo</span>');
    if (p.isFeatured) t.push('<span class="tag">Destaque</span>');
    if (onSale(p)) t.push(`<span class="tag tag--sale">-${pct(p)}%</span>`);
    return t.length ? `<div class="tags">${t.join('')}</div>` : '';
  }
  function favBtn(p) {
    const on = S.isFav(p.id);
    return `<button class="fav" type="button" data-fav="${esc(p.id)}" aria-pressed="${on}" aria-label="${on ? 'Remover dos favoritos' : 'Favoritar'}: ${esc(p.name)}">${heart}</button>`;
  }
  function card(p) {
    const href = '#/produto/' + encodeURIComponent(p.id);
    return `<article class="card">
      <a class="card__media" href="${href}" tabindex="-1" aria-hidden="true"><img src="${F.img(p, 0)}" alt="" loading="lazy" width="600" height="750"></a>
      ${tagsHtml(p)}${favBtn(p)}
      <div class="card__body">
        <p class="card__cat">${esc(S.category(p.categoryId).name)}</p>
        <h3 class="card__title"><a href="${href}">${esc(p.name)}</a></h3>
        <p class="card__by">por ${esc(S.creator(p.creatorId).name)}</p>
        ${priceHtml(p)}
        <a class="btn btn--sm" href="${href}">Ver produto</a>
      </div></article>`;
  }
  const grid = list => `<div class="grid">${list.map(card).join('')}</div>`;
  const section = (title, link, inner) => `<section class="section wrap"><div class="section__head"><h2>${title}</h2>${link ? `<a class="link-more" href="${link[0]}">${link[1]} →</a>` : ''}</div>${inner}</section>`;

  /* ---------- Ordenação / filtros ---------- */
  const SORTS = {
    novidades: (a, b) => String(b.createdAt).localeCompare(String(a.createdAt)),
    popular: (a, b) => b.popularity - a.popularity,
    menor: (a, b) => eff(a) - eff(b),
    maior: (a, b) => eff(b) - eff(a)
  };
  const byDate = SORTS.novidades;
  function applyFilters(st) {
    const q = st.q.trim().toLowerCase();
    const min = st.min !== '' ? Number(st.min) : null, max = st.max !== '' ? Number(st.max) : null;
    return S.products().filter(p => {
      if (q) {
        const hay = (p.name + ' ' + S.category(p.categoryId).name + ' ' + S.creator(p.creatorId).name).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (st.cat && p.categoryId !== st.cat) return false;
      if (st.free && !isFree(p)) return false;
      if (st.sale && !onSale(p)) return false;
      if (st.isNew && !p.isNew) return false;
      if (min != null && !isNaN(min) && eff(p) < min) return false;
      if (max != null && !isNaN(max) && eff(p) > max) return false;
      return true;
    }).sort(SORTS[st.sort] || SORTS.novidades);
  }

  /* ---------- Views ---------- */
  function setTitle(t, desc) {
    document.title = t ? t + ' — FEITO DA MARCA' : 'FEITO DA MARCA — Loja de produtos digitais';
    const m = $('meta[name="description"]');
    if (m && desc) m.setAttribute('content', desc);
  }
  function setLd(obj) { const el = $('#ld-json'); if (el) el.textContent = JSON.stringify(obj).replace(/</g, '\\u003c'); }

  function home() {
    setTitle('', 'Templates, mockups, fontes, identidades visuais e ferramentas digitais para criar, transformar e tirar projetos do papel.');
    setLd({ '@context': 'https://schema.org', '@type': 'Store', name: 'FEITO DA MARCA', description: 'Marketplace de produtos digitais' });
    const all = S.products();
    const featured = all.filter(p => p.isFeatured).sort(byDate);
    const best = all.slice().sort((a, b) => b.sales - a.sales).slice(0, 8);
    const fresh = all.slice().sort(byDate).slice(0, 8);
    const showcase = (featured.length ? featured : all).slice(0, 3);
    const cats = S.categories();
    const byCreator = S.creators().map(c => ({ c, items: all.filter(p => p.creatorId === c.id).sort((a, b) => b.popularity - a.popularity).slice(0, 4) })).filter(x => x.items.length).slice(0, 3);

    main.innerHTML = `
    <section class="hero" aria-labelledby="h1">
      <div class="hero__in">
        <div>
          <span class="eyebrow">Loja de produtos digitais</span>
          <h1 id="h1">Ideias boas merecem virar <em>marca.</em></h1>
          <p>Templates, ferramentas e recursos digitais para criar, transformar e tirar projetos do papel.</p>
          <form class="search" id="heroSearch" role="search" autocomplete="off">
            <label class="sr" for="heroq">Buscar produtos</label>
            <input id="heroq" name="q" type="search" placeholder="O que você quer criar hoje?" enterkeyhint="search">
            <button type="submit" aria-label="Buscar"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></button>
          </form>
          <div class="hero__cta"><a class="btn" href="#/loja">Explorar loja</a><a class="btn btn--ghost" href="#/loja?free=1">Grátis</a><a class="btn btn--ghost" href="#/loja?sale=1">Promoções</a></div>
        </div>
        <div class="hero__showcase" aria-label="Produtos em destaque">
          ${showcase.map(p => `<a class="mini" href="#/produto/${encodeURIComponent(p.id)}"><img src="${F.img(p, 0)}" alt="" width="300" height="375"><div>${esc(p.name)}<small>${isFree(p) ? 'GRÁTIS' : brl(eff(p))}</small></div></a>`).join('')}
        </div>
      </div>
    </section>
    <div class="chipbar"><nav class="chips" aria-label="Categorias">${cats.map(c => `<a class="chip" href="#/loja?cat=${encodeURIComponent(c.id)}">${esc(c.name)}</a>`).join('')}</nav></div>
    ${featured.length ? section('Em destaque', ['#/loja', 'Ver tudo'], grid(featured.slice(0, 8))) : ''}
    ${section('Mais vendidos', ['#/loja?sort=popular', 'Ver mais'], grid(best))}
    ${section('Recém-adicionados', ['#/novidades', 'Ver novidades'], grid(fresh))}
    ${section('Navegue por categoria', ['#/categorias', 'Todas'], `<div class="cat-grid">${cats.slice(0, 8).map(catTile).join('')}</div>`)}
    ${byCreator.map(x => section(`Seleção de ${esc(x.c.name)}`, ['#/criador/' + encodeURIComponent(x.c.id), 'Ver criador'], grid(x.items))).join('')}`;
  }
  function catTile(c) {
    const n = S.products().filter(p => p.categoryId === c.id).length;
    return `<a class="cat-tile" href="#/loja?cat=${encodeURIComponent(c.id)}"><strong>${esc(c.name)}</strong><span>${n} produto${n === 1 ? '' : 's'}</span></a>`;
  }

  function categorias() {
    setTitle('Categorias', 'Explore todas as categorias de produtos digitais.');
    main.innerHTML = `<div class="wrap"><div class="page-head"><h1>Categorias</h1><p class="muted">Escolha uma categoria para filtrar o catálogo.</p></div><div class="cat-grid" style="padding-bottom:20px">${S.categories().map(catTile).join('')}</div></div>`;
  }

  let shopState = null;
  function shop(q) {
    const st = shopState = {
      q: q.get('q') || '', cat: q.get('cat') || '', sort: q.get('sort') || 'novidades',
      min: q.get('min') || '', max: q.get('max') || '', free: q.get('free') === '1', sale: q.get('sale') === '1', isNew: q.get('new') === '1'
    };
    const cat = st.cat ? S.categories().find(c => c.id === st.cat) : null;
    const title = st.isNew ? 'Novidades' : cat ? cat.name : st.q ? `Busca: ${st.q}` : 'Loja';
    setTitle(title, 'Catálogo de produtos digitais: templates, mockups, fontes, identidades e mais.');
    const cats = S.categories();
    main.innerHTML = `<div class="wrap">
      <div class="page-head"><h1 id="shopTitle">${esc(title)}</h1></div>
      <div class="shop">
        <div class="shop__bar">
          <form class="search" id="shopSearch" role="search" onsubmit="return false"><label class="sr" for="sq">Buscar por nome</label><input id="sq" type="search" value="${esc(st.q)}" placeholder="Buscar por nome…" enterkeyhint="search"><button type="submit" aria-label="Buscar"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></button></form>
          <button class="btn btn--ghost filters-btn" id="filtersBtn" type="button" aria-expanded="false" aria-controls="filters">Filtros</button>
          <label class="sr" for="sortSel">Ordenar por</label>
          <select id="sortSel">
            <option value="novidades">Novidades</option><option value="popular">Mais populares</option>
            <option value="menor">Menor preço</option><option value="maior">Maior preço</option>
          </select>
        </div>
        <form class="filters" id="filters" aria-label="Filtros" onsubmit="return false">
          <h2>Categoria</h2>
          <label class="opt"><input type="radio" name="cat" value="" ${!st.cat ? 'checked' : ''}> Todas</label>
          ${cats.map(c => `<label class="opt"><input type="radio" name="cat" value="${esc(c.id)}" ${st.cat === c.id ? 'checked' : ''}> ${esc(c.name)}</label>`).join('')}
          <h2>Preço (R$)</h2>
          <div class="range"><input type="number" min="0" inputmode="numeric" name="min" placeholder="Mín." aria-label="Preço mínimo" value="${esc(st.min)}"><input type="number" min="0" inputmode="numeric" name="max" placeholder="Máx." aria-label="Preço máximo" value="${esc(st.max)}"></div>
          <h2>Ofertas</h2>
          <label class="opt"><input type="checkbox" name="free" ${st.free ? 'checked' : ''}> Somente gratuitos</label>
          <label class="opt"><input type="checkbox" name="sale" ${st.sale ? 'checked' : ''}> Em promoção</label>
          <label class="opt"><input type="checkbox" name="isNew" ${st.isNew ? 'checked' : ''}> Novidades</label>
          <p><button class="link-btn" type="button" id="clearFilters">Limpar filtros</button></p>
        </form>
        <div class="results" id="results" aria-live="polite"></div>
      </div></div>`;
    $('#sortSel').value = SORTS[st.sort] ? st.sort : 'novidades';

    const sync = () => {
      const p = new URLSearchParams();
      if (st.q) p.set('q', st.q); if (st.cat) p.set('cat', st.cat);
      if (st.sort !== 'novidades') p.set('sort', st.sort);
      if (st.min !== '') p.set('min', st.min); if (st.max !== '') p.set('max', st.max);
      if (st.free) p.set('free', '1'); if (st.sale) p.set('sale', '1'); if (st.isNew) p.set('new', '1');
      const qs = p.toString();
      history.replaceState(null, '', '#/loja' + (qs ? '?' + qs : ''));
    };
    const update = () => {
      const list = applyFilters(st);
      $('#results').innerHTML = `<div class="results__meta"><span>${list.length} produto${list.length === 1 ? '' : 's'}</span></div>` +
        (list.length ? grid(list) : `<div class="empty"><h2>Nada encontrado</h2><p>Tente outra busca ou remova alguns filtros.</p><button class="btn" type="button" id="emptyClear">Limpar filtros</button></div>`);
      const e = $('#emptyClear'); if (e) e.onclick = clear;
    };
    const clear = () => {
      Object.assign(st, { q: '', cat: '', min: '', max: '', free: false, sale: false, isNew: false, sort: 'novidades' });
      $('#sq').value = ''; $('#sortSel').value = 'novidades';
      $('#filters').reset(); $$('#filters input[name=cat]')[0].checked = true;
      sync(); update();
    };
    $('#sq').addEventListener('input', e => { st.q = e.target.value; sync(); update(); });
    $('#sortSel').addEventListener('change', e => { st.sort = e.target.value; sync(); update(); });
    $('#filters').addEventListener('input', e => {
      const f = e.target;
      if (f.name === 'cat') st.cat = f.value;
      else if (f.name === 'min' || f.name === 'max') st[f.name] = f.value;
      else if (f.name) st[f.name] = f.checked;
      sync(); update();
    });
    $('#clearFilters').onclick = clear;
    $('#filtersBtn').onclick = e => {
      const open = $('#filters').classList.toggle('is-open');
      e.currentTarget.setAttribute('aria-expanded', open);
    };
    update();
  }

  function favoritos() {
    setTitle('Favoritos');
    const list = S.favs().map(id => S.product(id)).filter(p => p && p.active !== false);
    main.innerHTML = `<div class="wrap"><div class="page-head"><h1>Favoritos</h1></div>` +
      (list.length ? grid(list) : `<div class="empty"><h2>Nenhum favorito ainda</h2><p>Toque no coração dos produtos para salvá-los aqui.</p><a class="btn" href="#/loja">Explorar loja</a></div>`) + '</div>';
  }

  function criador(id) {
    const c = S.creators().find(x => x.id === id);
    if (!c) return notFound();
    setTitle(c.name, c.bio);
    const list = S.products().filter(p => p.creatorId === id).sort(byDate);
    main.innerHTML = `<div class="wrap"><div class="page-head"><div class="creator-head"><div class="avatar" aria-hidden="true">${esc(c.name.charAt(0))}</div><div><h1>${esc(c.name)}</h1><p class="muted">${esc(c.bio)}</p></div></div></div>` +
      (list.length ? grid(list) : '<div class="empty"><h2>Sem produtos publicados</h2></div>') + '</div>';
  }

  function produto(id) {
    const p = S.product(id);
    if (!p || p.active === false) return notFound();
    const cat = S.category(p.categoryId), cr = S.creator(p.creatorId);
    setTitle(p.name, p.description.slice(0, 155));
    const n = F.imgCount(p);
    const li = a => (a || []).map(x => `<li>${esc(x)}</li>`).join('');
    const pills = a => (a || []).map(x => `<span class="pill">${esc(x)}</span>`).join('');
    const related = S.products().filter(x => x.id !== p.id).sort((a, b) => (b.categoryId === p.categoryId) - (a.categoryId === p.categoryId) || b.popularity - a.popularity).slice(0, 4);
    setLd({
      '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.description,
      category: cat.name, brand: { '@type': 'Brand', name: cr.name },
      offers: { '@type': 'Offer', priceCurrency: 'BRL', price: String(eff(p)), availability: 'https://schema.org/InStock' }
    });
    main.innerHTML = `<div class="wrap">
      <nav class="crumbs" aria-label="Você está em"><a href="#/">Início</a> / <a href="#/loja">Loja</a> / <a href="#/loja?cat=${encodeURIComponent(cat.id)}">${esc(cat.name)}</a> / <span>${esc(p.name)}</span></nav>
      <div class="pdp">
        <div class="gallery">
          <div class="gallery__main"><img id="gMain" src="${F.img(p, 0)}" alt="${esc(p.name)} — imagem 1" width="600" height="750"></div>
          <div class="gallery__thumbs" role="group" aria-label="Galeria">
            ${Array.from({ length: n }, (_, i) => `<button class="thumb" type="button" data-img="${i}" aria-label="Ver imagem ${i + 1}" aria-current="${i === 0}"><img src="${F.img(p, i)}" alt="" loading="lazy"></button>`).join('')}
          </div>
        </div>
        <div class="pdp__info">
          <div class="tags" style="position:static;flex-direction:row;flex-wrap:wrap">${(tagsHtml(p).replace(/^<div class="tags">|<\/div>$/g, ''))}</div>
          <h1>${esc(p.name)}</h1>
          <div class="pdp__meta"><span>por <a href="#/criador/${encodeURIComponent(cr.id)}">${esc(cr.name)}</a></span><span class="pill">${esc(cat.name)}</span></div>
          <div class="pdp__buy">
            ${priceHtml(p, true)}
            <div class="btns">
              <button class="btn btn--red" type="button" data-buy="${esc(p.id)}">Comprar agora</button>
              <button class="btn btn--ghost" type="button" data-add="${esc(p.id)}">Adicionar à sacola</button>
            </div>
            <button class="btn btn--ghost btn--block" type="button" data-fav="${esc(p.id)}" aria-pressed="${S.isFav(p.id)}">${S.isFav(p.id) ? '♥ Nos favoritos' : '♡ Favoritar'}</button>
            <p class="pdp__trust">Download digital · pagamento via gateway seguro (a configurar)</p>
          </div>
          <div class="spec"><h2>Descrição</h2><p>${esc(p.description)}</p></div>
          <div class="spec"><h2>Formatos disponíveis</h2><div class="pills">${pills(p.formats)}</div></div>
          <div class="spec"><h2>Programas compatíveis</h2><div class="pills">${pills(p.software)}</div></div>
          <div class="spec"><h2>O que está incluído no download</h2><ul>${li(p.includes)}</ul></div>
          <div class="spec"><h2>Licença de uso</h2><p>${esc(p.license)}</p></div>
        </div>
      </div>
      ${section('Produtos relacionados', ['#/loja?cat=' + encodeURIComponent(cat.id), 'Ver categoria'], grid(related))}
    </div>`;
    // fav button text sync in PDP is handled via refreshFavs
    const gMain = $('#gMain');
    $$('.thumb').forEach(b => b.addEventListener('click', () => {
      const i = Number(b.dataset.img);
      gMain.src = F.img(p, i); gMain.alt = `${p.name} — imagem ${i + 1}`;
      $$('.thumb').forEach(t => t.setAttribute('aria-current', t === b));
    }));
  }

  function checkout() {
    setTitle('Checkout');
    const items = S.cartItems();
    if (!items.length) {
      main.innerHTML = `<div class="wrap"><div class="page-head"><h1>Checkout</h1></div><div class="empty"><h2>Sua sacola está vazia</h2><p>Adicione produtos para continuar.</p><a class="btn" href="#/loja">Continuar comprando</a></div></div>`;
      return;
    }
    const total = items.reduce((s, p) => s + eff(p), 0);
    const subtotal = items.reduce((s, p) => s + p.price, 0);
    main.innerHTML = `<div class="wrap"><div class="page-head"><h1>Checkout</h1></div>
    <div class="checkout">
      <form class="box" id="checkoutForm" novalidate>
        <h2>Seus dados</h2>
        <div class="field"><label for="ckEmail">E-mail para receber os downloads</label><input id="ckEmail" type="email" required autocomplete="email" placeholder="voce@email.com"></div>
        <label class="opt"><input type="checkbox" id="ckTerms" required> Li e aceito as licenças de uso dos produtos.</label>
        <div class="alert">O pagamento ainda não está conectado. Nenhuma compra será aprovada ou cobrada nesta versão.</div>
        <div id="ckMsg" role="alert"></div>
        <button class="btn btn--red btn--block" type="submit">Finalizar pagamento</button>
        <p style="margin-top:12px"><a href="#/loja">← Continuar comprando</a></p>
      </form>
      <section class="box" aria-label="Resumo do pedido"><h2>Resumo</h2>
        <div class="drawer__list" style="padding:0">${items.map(lineHtml).join('')}</div>
        <div class="sum" style="margin-top:12px"><span>Subtotal</span><span>${brl(subtotal)}</span></div>
        ${subtotal !== total ? `<div class="sum"><span>Descontos</span><span>-${brl(subtotal - total)}</span></div>` : ''}
        <div class="sum sum--total"><span>Total</span><span>${brl(total)}</span></div>
      </section></div></div>`;
    $('#checkoutForm').addEventListener('submit', async e => {
      e.preventDefault();
      const msg = $('#ckMsg'), email = $('#ckEmail').value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { msg.innerHTML = '<div class="alert alert--err">Informe um e-mail válido.</div>'; $('#ckEmail').focus(); return; }
      if (!$('#ckTerms').checked) { msg.innerHTML = '<div class="alert alert--err">Aceite as licenças de uso para continuar.</div>'; return; }
      try {
        await F.payments.startCheckout({ productIds: items.map(p => p.id), email });
      } catch (err) {
        msg.innerHTML = err.code === 'NOT_CONFIGURED'
          ? '<div class="alert alert--err">Gateway de pagamento não configurado. Integre Stripe ou Mercado Pago em js/payments.js para habilitar a compra.</div>'
          : '<div class="alert alert--err">Não foi possível iniciar o pagamento. Tente novamente.</div>';
      }
    });
  }

  function notFound() {
    setTitle('Página não encontrada');
    main.innerHTML = `<div class="wrap"><div class="page-head"><h1>Não encontrado</h1></div><div class="empty"><h2>Esse produto não está disponível</h2><a class="btn" href="#/loja">Ir para a loja</a></div></div>`;
  }

  /* ---------- Sacola ---------- */
  function lineHtml(p) {
    return `<div class="line"><img src="${F.img(p, 0)}" alt="" width="72" height="90"><div><h3>${esc(p.name)}</h3><p>${esc(S.creator(p.creatorId).name)}</p>${priceHtml(p)}</div><button class="rm" type="button" data-remove="${esc(p.id)}" aria-label="Remover ${esc(p.name)} da sacola">✕</button></div>`;
  }
  function renderDrawer() {
    const items = S.cartItems();
    const subtotal = items.reduce((s, p) => s + p.price, 0), total = items.reduce((s, p) => s + eff(p), 0);
    $('#drawer').innerHTML = `<div class="drawer__head"><h2>Sacola (${items.length})</h2><button class="icon-btn" type="button" data-close-drawer aria-label="Fechar sacola">✕</button></div>
      <div class="drawer__list">${items.length ? items.map(lineHtml).join('') : '<div class="empty"><p>Sua sacola está vazia.</p></div>'}</div>
      <div class="drawer__foot">
        <div class="sum"><span>Subtotal</span><span>${brl(subtotal)}</span></div>
        ${subtotal !== total ? `<div class="sum"><span>Descontos</span><span>-${brl(subtotal - total)}</span></div>` : ''}
        <div class="sum sum--total"><span>Total</span><span>${brl(total)}</span></div>
        <a class="btn btn--red btn--block" href="#/checkout" ${items.length ? '' : 'aria-disabled="true" style="pointer-events:none;opacity:.5"'}>Ir para o checkout</a>
        <button class="btn btn--ghost btn--block" type="button" data-close-drawer>Continuar comprando</button>
      </div>`;
  }
  let lastFocus = null;
  function openDrawer() {
    lastFocus = document.activeElement; renderDrawer();
    $('#drawer').classList.add('is-open'); $('#drawer').setAttribute('aria-hidden', 'false'); $('#overlay').hidden = false;
    $('#drawer').focus();
  }
  function closeDrawer() {
    if (!$('#drawer').classList.contains('is-open')) return;
    $('#drawer').classList.remove('is-open'); $('#drawer').setAttribute('aria-hidden', 'true'); $('#overlay').hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function closeMenu() { $('#nav').classList.remove('is-open'); $('#menuBtn').setAttribute('aria-expanded', 'false'); }

  let toastT;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('is-show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('is-show'), 2200);
  }

  /* ---------- Atualizações de UI ---------- */
  function refreshCounts() {
    const c = S.cartItems().length, f = S.favs().length;
    const cc = $('#cartCount'), fc = $('#favCount');
    cc.textContent = c; cc.hidden = !c; fc.textContent = f; fc.hidden = !f;
    $('#cartBtn').setAttribute('aria-label', `Abrir sacola (${c} ${c === 1 ? 'item' : 'itens'})`);
  }
  function refreshFavs() {
    $$('[data-fav]').forEach(b => {
      const on = S.isFav(b.dataset.fav);
      b.setAttribute('aria-pressed', on);
      if (b.classList.contains('fav')) b.setAttribute('aria-label', (on ? 'Remover dos favoritos: ' : 'Favoritar: ') + (S.product(b.dataset.fav) || {}).name);
      else b.textContent = on ? '♥ Nos favoritos' : '♡ Favoritar';
    });
  }

  /* ---------- Roteador ---------- */
  function route(keepScroll) {
    const h = location.hash.replace(/^#/, '') || '/';
    const [path, qs] = h.split('?'), parts = path.split('/').filter(Boolean), q = new URLSearchParams(qs || '');
    closeMenu(); closeDrawer();
    const key = parts[0] || '';
    if (key === 'novidades') { location.replace('#/loja?new=1&sort=novidades'); return; }
    ({ '': home, loja: () => shop(q), categorias, favoritos, checkout, produto: () => produto(decodeURIComponent(parts[1] || '')), criador: () => criador(decodeURIComponent(parts[1] || '')) }[key] || notFound)();
    $$('.nav a').forEach(a => {
      const k = a.dataset.nav, on = (k === 'loja' && key === 'loja' && !q.get('new')) || (k === 'novidades' && key === 'loja' && q.get('new')) || k === key;
      a.classList.toggle('is-active', !!on);
    });
    if (!keepScroll) { window.scrollTo(0, 0); }
    refreshCounts();
  }

  /* ---------- Eventos globais ---------- */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-fav],[data-add],[data-buy],[data-remove],[data-close-drawer]');
    if (!t) return;
    if (t.dataset.fav) { const on = S.toggleFav(t.dataset.fav); toast(on ? 'Adicionado aos favoritos' : 'Removido dos favoritos'); }
    else if (t.dataset.add) { const ok = S.addToCart(t.dataset.add); if (ok) { toast('Adicionado à sacola'); } else toast('Este produto já está na sacola'); openDrawer(); }
    else if (t.dataset.buy) { S.addToCart(t.dataset.buy); location.hash = '#/checkout'; }
    else if (t.dataset.remove) { S.removeFromCart(t.dataset.remove); }
    else if (t.hasAttribute('data-close-drawer')) closeDrawer();
  });
  $('#overlay').addEventListener('click', closeDrawer);
  $('#cartBtn').addEventListener('click', openDrawer);
  $('#menuBtn').addEventListener('click', e => {
    const open = $('#nav').classList.toggle('is-open'); e.currentTarget.setAttribute('aria-expanded', open);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeDrawer(); closeMenu(); } });
  document.addEventListener('submit', e => {
    if (['headerSearch', 'mobileSearch', 'heroSearch'].includes(e.target.id)) {
      e.preventDefault();
      const v = new FormData(e.target).get('q').toString().trim();
      location.hash = '#/loja' + (v ? '?q=' + encodeURIComponent(v) : '');
      $('#hq').value = ''; $('#mq').value = '';
    }
  });

  window.addEventListener('fdm:change', e => {
    const type = e.detail.type;
    refreshCounts();
    if (type === 'favs') {
      refreshFavs();
      if (location.hash.startsWith('#/favoritos')) route(true);
    } else if (type === 'cart') {
      if ($('#drawer').classList.contains('is-open')) renderDrawer();
      if (location.hash.startsWith('#/checkout')) route(true);
    } else if (type === 'catalog') {
      if (!location.hash.startsWith('#/loja')) route(true);
    }
  });
  window.addEventListener('hashchange', () => route(false));
  route(false);
})();
