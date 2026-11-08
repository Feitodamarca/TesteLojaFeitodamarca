/* Camada de dados (repositório) da loja.
 * Hoje usa localStorage. Para migrar ao Supabase, reimplemente estes mesmos métodos
 * (ver docs/ARQUITETURA.md) sem alterar app.js nem admin.js.
 */
(function () {
  const F = (window.FDM = window.FDM || {});
  const KEY = 'fdm.catalog.v1', FAVK = 'fdm.favs.v1', CARTK = 'fdm.cart.v1';

  const clone = o => JSON.parse(JSON.stringify(o));
  function read(k, def) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function emit(type) { window.dispatchEvent(new CustomEvent('fdm:change', { detail: { type } })); }

  function valid(d) { return d && Array.isArray(d.products) && Array.isArray(d.categories) && Array.isArray(d.creators); }
  let db = read(KEY, null);
  if (!valid(db)) db = clone(F.seed);
  let favs = read(FAVK, []);
  let cart = read(CARTK, []);

  const slug = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item';
  function uniqueId(base, list) { let id = base, n = 2; while (list.some(x => x.id === id)) id = base + '-' + n++; return id; }
  const persist = () => write(KEY, db);

  const S = {
    slug,
    // ---------- Leitura ----------
    products(opts) { const all = opts && opts.all; return db.products.filter(p => all || p.active !== false); },
    product(id) { return db.products.find(p => p.id === id); },
    categories() { return db.categories.slice(); },
    category(id) { return db.categories.find(c => c.id === id) || { id: '', name: 'Sem categoria' }; },
    creators() { return db.creators.slice(); },
    creator(id) { return db.creators.find(c => c.id === id) || { id: '', name: 'Criador', bio: '' }; },
    snapshot() { return clone(db); },

    // ---------- Escrita (admin) ----------
    saveProduct(p) {
      const i = db.products.findIndex(x => x.id === p.id);
      if (i >= 0) db.products[i] = p; else { p.id = uniqueId(slug(p.name), db.products); db.products.unshift(p); }
      const ok = persist(); emit('catalog'); return ok ? p : null;
    },
    deleteProduct(id) {
      db.products = db.products.filter(p => p.id !== id);
      favs = favs.filter(x => x !== id); cart = cart.filter(x => x !== id);
      write(FAVK, favs); write(CARTK, cart);
      const ok = persist(); emit('catalog'); return ok;
    },
    saveCategory(c) {
      const i = db.categories.findIndex(x => x.id === c.id);
      if (i >= 0) db.categories[i] = c; else { c.id = uniqueId(slug(c.name), db.categories); db.categories.push(c); }
      const ok = persist(); emit('catalog'); return ok ? c : null;
    },
    deleteCategory(id) {
      if (db.products.some(p => p.categoryId === id)) return false;
      db.categories = db.categories.filter(c => c.id !== id); persist(); emit('catalog'); return true;
    },
    saveCreator(c) {
      const i = db.creators.findIndex(x => x.id === c.id);
      if (i >= 0) db.creators[i] = c; else { c.id = uniqueId(slug(c.name), db.creators); db.creators.push(c); }
      const ok = persist(); emit('catalog'); return ok ? c : null;
    },
    deleteCreator(id) {
      if (db.products.some(p => p.creatorId === id)) return false;
      db.creators = db.creators.filter(c => c.id !== id); persist(); emit('catalog'); return true;
    },
    importAll(data) { if (!valid(data)) return false; db = clone(data); const ok = persist(); emit('catalog'); return ok; },
    resetDemo() { db = clone(F.seed); persist(); emit('catalog'); },

    // ---------- Favoritos ----------
    favs() { return favs.slice(); },
    isFav(id) { return favs.includes(id); },
    toggleFav(id) {
      favs = favs.includes(id) ? favs.filter(x => x !== id) : favs.concat(id);
      write(FAVK, favs); emit('favs'); return favs.includes(id);
    },

    // ---------- Sacola (produtos digitais: 1 unidade por item) ----------
    cartIds() { return cart.slice(); },
    cartItems() { return cart.map(id => S.product(id)).filter(p => p && p.active !== false); },
    inCart(id) { return cart.includes(id); },
    addToCart(id) { if (cart.includes(id)) return false; cart.push(id); write(CARTK, cart); emit('cart'); return true; },
    removeFromCart(id) { cart = cart.filter(x => x !== id); write(CARTK, cart); emit('cart'); },
    clearCart() { cart = []; write(CARTK, cart); emit('cart'); }
  };

  // Sincroniza abas diferentes (ex.: admin aberto em outra aba)
  window.addEventListener('storage', e => {
    if (e.key === KEY) { const d = read(KEY, null); if (valid(d)) { db = d; emit('catalog'); } }
    if (e.key === FAVK) { favs = read(FAVK, []); emit('favs'); }
    if (e.key === CARTK) { cart = read(CARTK, []); emit('cart'); }
  });

  F.store = S;
})();
