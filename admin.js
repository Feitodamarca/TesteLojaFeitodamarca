/* FEITO DA MARCA — painel administrativo (demonstração local, sem autenticação) */
(function () {
  const F = window.FDM, S = F.store;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const brl = n => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
  const root = $('#admin'), dlg = $('#dlg');
  let tab = 'produtos', search = '';
  let formImages = [];

  function toast(m) { const t = $('#atoast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2400); }
  const lines = s => String(s || '').split('\n').map(x => x.trim()).filter(Boolean);
  const commas = s => String(s || '').split(',').map(x => x.trim()).filter(Boolean);

  /* ---------- Render por aba ---------- */
  function render() {
    $$('#tabs button').forEach(b => b.setAttribute('aria-current', b.dataset.tab === tab));
    ({ produtos: viewProducts, categorias: viewCategories, criadores: viewCreators, dados: viewData }[tab])();
  }

  function viewProducts() {
    const q = search.toLowerCase();
    const list = S.products({ all: true }).filter(p => !q || p.name.toLowerCase().includes(q));
    root.innerHTML = `<div class="bar"><h1>Produtos (${list.length})</h1>
      <label class="sr" for="aq" style="position:absolute;left:-9999px">Buscar</label>
      <input id="aq" type="search" placeholder="Buscar produto…" value="${esc(search)}">
      <button class="abtn" type="button" id="newProd">+ Novo produto</button></div>
      <div class="twrap"><table><thead><tr><th></th><th>Produto</th><th>Categoria</th><th>Criador</th><th>Preço</th><th>Status</th><th>Ações</th></tr></thead><tbody>
      ${list.map(p => `<tr>
        <td><img src="${F.img(p, 0)}" alt=""></td>
        <td><strong>${esc(p.name)}</strong>${p.demo ? '<br><small>demo</small>' : ''}</td>
        <td>${esc(S.category(p.categoryId).name)}</td>
        <td>${esc(S.creator(p.creatorId).name)}</td>
        <td>${p.price === 0 ? 'Grátis' : (p.salePrice > 0 && p.salePrice < p.price ? `<s>${brl(p.price)}</s><br><strong>${brl(p.salePrice)}</strong>` : brl(p.price))}</td>
        <td>
          <span class="badge ${p.active !== false ? 'badge--on' : 'badge--off'}">${p.active !== false ? 'ATIVO' : 'INATIVO'}</span>
          ${p.isFeatured ? '<span class="badge">DESTAQUE</span>' : ''}${p.isNew ? '<span class="badge">NOVO</span>' : ''}
        </td>
        <td><div class="acts">
          <button class="abtn abtn--ghost abtn--sm" data-toggle="${esc(p.id)}">${p.active !== false ? 'Desativar' : 'Ativar'}</button>
          <button class="abtn abtn--ghost abtn--sm" data-edit="${esc(p.id)}">Editar</button>
          <button class="abtn abtn--danger abtn--sm" data-del="${esc(p.id)}">Excluir</button>
        </div></td></tr>`).join('') || '<tr><td colspan="7">Nenhum produto.</td></tr>'}
      </tbody></table></div>`;
    $('#newProd').onclick = () => openForm(null);
    const aq = $('#aq'); aq.oninput = e => { search = e.target.value; const pos = e.target.selectionStart; viewProducts(); const n = $('#aq'); n.focus(); n.setSelectionRange(pos, pos); };
  }

  function viewCategories() {
    const cats = S.categories();
    root.innerHTML = `<div class="bar"><h1>Categorias (${cats.length})</h1></div>
      <form class="card" id="catForm"><h2>Nova categoria</h2><div class="row"><label style="position:absolute;left:-9999px" for="cn">Nome</label><input type="text" id="cn" placeholder="Nome da categoria" required maxlength="60"><button class="abtn" type="submit">Criar</button></div></form>
      <div class="list">${cats.map(c => {
        const n = S.products({ all: true }).filter(p => p.categoryId === c.id).length;
        return `<div class="item"><span><strong>${esc(c.name)}</strong> <small>· ${n} produto(s)</small></span><span class="acts"><button class="abtn abtn--ghost abtn--sm" data-rencat="${esc(c.id)}">Renomear</button><button class="abtn abtn--danger abtn--sm" data-delcat="${esc(c.id)}">Excluir</button></span></div>`;
      }).join('')}</div>`;
    $('#catForm').onsubmit = e => {
      e.preventDefault(); const v = $('#cn').value.trim(); if (!v) return;
      if (!S.saveCategory({ name: v })) return toast('Não foi possível salvar (armazenamento cheio?).');
      toast('Categoria criada'); viewCategories();
    };
  }

  function viewCreators() {
    const cr = S.creators();
    root.innerHTML = `<div class="bar"><h1>Criadores (${cr.length})</h1><button class="abtn" id="newCr" type="button">+ Novo criador</button></div>
      <div class="list">${cr.map(c => {
        const n = S.products({ all: true }).filter(p => p.creatorId === c.id).length;
        return `<div class="item"><span><strong>${esc(c.name)}</strong> <small>· ${n} produto(s)</small><br><small>${esc(c.bio)}</small></span><span class="acts"><button class="abtn abtn--ghost abtn--sm" data-edcr="${esc(c.id)}">Editar</button><button class="abtn abtn--danger abtn--sm" data-delcr="${esc(c.id)}">Excluir</button></span></div>`;
      }).join('')}</div>`;
    $('#newCr').onclick = () => openCreatorForm(null);
  }

  function viewData() {
    root.innerHTML = `<div class="bar"><h1>Dados</h1></div>
      <div class="card"><h2>Exportar / importar catálogo</h2><p>Faça backup do catálogo em JSON ou restaure um backup. Imagens enviadas ficam embutidas no arquivo.</p>
        <div class="row"><button class="abtn" id="exp" type="button">Exportar JSON</button>
        <label class="abtn abtn--ghost" style="cursor:pointer">Importar JSON<input id="imp" type="file" accept="application/json,.json" hidden></label></div></div>
      <div class="card"><h2>Restaurar demonstração</h2><p>Apaga as alterações locais e volta aos produtos fictícios originais.</p><button class="abtn abtn--danger" id="rst" type="button">Restaurar dados de demonstração</button></div>
      <div class="card"><h2>Rumo ao marketplace</h2><p>Autenticação, pedidos, comissões, painel do vendedor e downloads protegidos estão descritos em <code>docs/ARQUITETURA.md</code>.</p></div>`;
    $('#exp').onclick = () => {
      const blob = new Blob([JSON.stringify(S.snapshot(), null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'feito-da-marca-catalogo.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    };
    $('#imp').onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => { try { if (S.importAll(JSON.parse(r.result))) toast('Catálogo importado'); else toast('Arquivo inválido ou armazenamento cheio.'); } catch (err) { toast('Arquivo JSON inválido.'); } };
      r.readAsText(f);
    };
    $('#rst').onclick = () => { if (confirm('Restaurar os dados de demonstração? Suas alterações locais serão perdidas.')) { S.resetDemo(); toast('Demonstração restaurada'); } };
  }

  /* ---------- Formulário de produto ---------- */
  function openForm(id) {
    const p = id ? S.product(id) : null;
    formImages = p ? (p.images || []).slice() : [];
    const d = p || { name: '', categoryId: S.categories()[0] && S.categories()[0].id, creatorId: S.creators()[0] && S.creators()[0].id, price: 0, salePrice: 0, description: '', formats: [], software: [], includes: [], license: '', isFeatured: false, isNew: true, active: true, popularity: 0, sales: 0 };
    dlg.innerHTML = `<form id="pf" method="dialog" novalidate>
      <header><h2>${p ? 'Editar produto' : 'Novo produto'}</h2><button class="abtn abtn--ghost abtn--sm" type="button" data-close>Fechar</button></header>
      <div class="body">
        <div id="pferr"></div>
        <div class="f"><label for="f-name">Nome *</label><input id="f-name" required maxlength="90" value="${esc(d.name)}"></div>
        <div class="two">
          <div class="f"><label for="f-cat">Categoria *</label><select id="f-cat">${S.categories().map(c => `<option value="${esc(c.id)}" ${c.id === d.categoryId ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
          <div class="f"><label for="f-cr">Criador *</label><select id="f-cr">${S.creators().map(c => `<option value="${esc(c.id)}" ${c.id === d.creatorId ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
        </div>
        <div class="two">
          <div class="f"><label for="f-price">Preço (R$) — 0 = grátis</label><input id="f-price" type="number" min="0" step="0.01" inputmode="decimal" value="${d.price}"></div>
          <div class="f"><label for="f-sale">Preço promocional (R$)</label><input id="f-sale" type="number" min="0" step="0.01" inputmode="decimal" value="${d.salePrice || ''}"><small>Deixe vazio para sem promoção.</small></div>
        </div>
        <div class="f"><label for="f-desc">Descrição</label><textarea id="f-desc" rows="4" maxlength="1200">${esc(d.description)}</textarea></div>
        <div class="f"><label for="f-fmt">Formatos (separados por vírgula)</label><input id="f-fmt" value="${esc((d.formats || []).join(', '))}"></div>
        <div class="f"><label for="f-soft">Programas compatíveis (separados por vírgula)</label><input id="f-soft" value="${esc((d.software || []).join(', '))}"></div>
        <div class="f"><label for="f-inc">O que está incluído (um item por linha)</label><textarea id="f-inc" rows="3">${esc((d.includes || []).join('\n'))}</textarea></div>
        <div class="f"><label for="f-lic">Licença de uso</label><textarea id="f-lic" rows="2">${esc(d.license)}</textarea></div>
        <div class="two">
          <div class="f"><label for="f-pop">Popularidade (0–100)</label><input id="f-pop" type="number" min="0" max="100" value="${d.popularity || 0}"></div>
          <div class="f"><label for="f-sales">Vendas (demonstração)</label><input id="f-sales" type="number" min="0" value="${d.sales || 0}"></div>
        </div>
        <div class="checks">
          <label class="sw"><input type="checkbox" id="f-active" ${d.active !== false ? 'checked' : ''}> Ativo (visível na loja)</label>
          <label class="sw"><input type="checkbox" id="f-feat" ${d.isFeatured ? 'checked' : ''}> Destaque</label>
          <label class="sw"><input type="checkbox" id="f-new" ${d.isNew ? 'checked' : ''}> Novidade</label>
        </div>
        <div class="f"><label for="f-img">Imagens do produto</label><input id="f-img" type="file" accept="image/png,image/jpeg,image/webp" multiple>
          <small>Redimensionadas para até 900 px. Sem imagens, a loja usa uma capa gerada de demonstração. O armazenamento local é limitado (~5 MB); em produção use Supabase Storage.</small>
          <div class="imgs" id="imgs"></div></div>
      </div>
      <footer><button class="abtn abtn--ghost" type="button" data-close>Cancelar</button><button class="abtn" type="submit">Salvar produto</button></footer>
    </form>`;
    paintImgs();
    $('#f-img').onchange = async e => {
      for (const f of Array.from(e.target.files)) { try { formImages.push(await shrink(f)); } catch (err) { toast('Imagem inválida: ' + f.name); } }
      e.target.value = ''; paintImgs();
    };
    $('#pf').onsubmit = ev => {
      ev.preventDefault();
      const name = $('#f-name').value.trim(), price = parseFloat($('#f-price').value), saleRaw = $('#f-sale').value;
      const sale = saleRaw === '' ? 0 : parseFloat(saleRaw), errs = [];
      if (!name) errs.push('Informe o nome.');
      if (isNaN(price) || price < 0) errs.push('Preço inválido.');
      if (sale && (isNaN(sale) || sale < 0 || sale >= price)) errs.push('O preço promocional deve ser menor que o preço normal.');
      if (!$('#f-cat').value) errs.push('Crie uma categoria antes.');
      if (!$('#f-cr').value) errs.push('Cadastre um criador antes.');
      if (errs.length) { $('#pferr').innerHTML = `<div class="err" role="alert">${errs.map(esc).join('<br>')}</div>`; return; }
      const out = Object.assign({}, p || { art: { palette: Math.floor(Math.random() * 8), pattern: Math.floor(Math.random() * 6) }, createdAt: '' }, {
        id: p ? p.id : '', name, categoryId: $('#f-cat').value, creatorId: $('#f-cr').value,
        price: Math.round(price * 100) / 100, salePrice: Math.round(sale * 100) / 100,
        description: $('#f-desc').value.trim(), formats: commas($('#f-fmt').value), software: commas($('#f-soft').value),
        includes: lines($('#f-inc').value), license: $('#f-lic').value.trim() || 'Consulte o criador sobre a licença de uso.',
        popularity: Math.max(0, Math.min(100, parseInt($('#f-pop').value, 10) || 0)), sales: Math.max(0, parseInt($('#f-sales').value, 10) || 0),
        active: $('#f-active').checked, isFeatured: $('#f-feat').checked, isNew: $('#f-new').checked, images: formImages.slice()
      });
      if (!p) { out.createdAt = new Date().toISOString().slice(0, 10); delete out.demo; }
      if (!S.saveProduct(out)) { $('#pferr').innerHTML = '<div class="err" role="alert">Armazenamento local cheio. Remova imagens ou exporte o catálogo.</div>'; return; }
      dlg.close(); toast('Produto salvo'); render();
    };
    dlg.showModal();
    $('#f-name').focus();
  }
  function paintImgs() {
    $('#imgs').innerHTML = formImages.map((src, i) => `<figure><img src="${esc(src)}" alt="Imagem ${i + 1}"><button type="button" data-rmimg="${i}" aria-label="Remover imagem ${i + 1}">×</button></figure>`).join('');
  }
  function shrink(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onerror = rej;
      r.onload = () => {
        const im = new Image();
        im.onerror = rej;
        im.onload = () => {
          const k = Math.min(1, 900 / Math.max(im.width, im.height));
          const c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
          c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
          res(c.toDataURL('image/jpeg', 0.82));
        };
        im.src = r.result;
      };
      r.readAsDataURL(file);
    });
  }

  /* ---------- Formulário de criador ---------- */
  function openCreatorForm(id) {
    const c = id ? S.creators().find(x => x.id === id) : { name: '', bio: '', link: '' };
    dlg.innerHTML = `<form id="cf" method="dialog" novalidate>
      <header><h2>${id ? 'Editar criador' : 'Novo criador'}</h2><button class="abtn abtn--ghost abtn--sm" type="button" data-close>Fechar</button></header>
      <div class="body"><div id="cferr"></div>
        <div class="f"><label for="c-name">Nome *</label><input id="c-name" required maxlength="80" value="${esc(c.name)}"></div>
        <div class="f"><label for="c-bio">Bio</label><textarea id="c-bio" rows="3" maxlength="400">${esc(c.bio)}</textarea></div>
        <div class="f"><label for="c-link">Link (https://…)</label><input id="c-link" type="url" value="${esc(c.link || '')}"></div></div>
      <footer><button class="abtn abtn--ghost" type="button" data-close>Cancelar</button><button class="abtn" type="submit">Salvar</button></footer></form>`;
    $('#cf').onsubmit = ev => {
      ev.preventDefault();
      const name = $('#c-name').value.trim(), link = $('#c-link').value.trim();
      if (!name) { $('#cferr').innerHTML = '<div class="err" role="alert">Informe o nome.</div>'; return; }
      if (link && !/^https:\/\//i.test(link)) { $('#cferr').innerHTML = '<div class="err" role="alert">O link deve começar com https://</div>'; return; }
      if (!S.saveCreator(Object.assign({}, c, { id: id || '', name, bio: $('#c-bio').value.trim(), link }))) { $('#cferr').innerHTML = '<div class="err">Não foi possível salvar.</div>'; return; }
      dlg.close(); toast('Criador salvo'); render();
    };
    dlg.showModal(); $('#c-name').focus();
  }

  /* ---------- Eventos ---------- */
  $('#tabs').addEventListener('click', e => { const b = e.target.closest('button[data-tab]'); if (b) { tab = b.dataset.tab; render(); } });
  document.addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.hasAttribute('data-close')) { dlg.close(); return; }
    if (t.dataset.rmimg != null) { formImages.splice(Number(t.dataset.rmimg), 1); paintImgs(); return; }
    if (t.dataset.edit) return openForm(t.dataset.edit);
    if (t.dataset.toggle) { const p = S.product(t.dataset.toggle); p.active = p.active === false; S.saveProduct(p); toast(p.active ? 'Produto ativado' : 'Produto desativado'); return render(); }
    if (t.dataset.del) { const p = S.product(t.dataset.del); if (confirm(`Excluir "${p.name}"? Esta ação não pode ser desfeita.`)) { S.deleteProduct(p.id); toast('Produto excluído'); render(); } return; }
    if (t.dataset.rencat) { const c = S.categories().find(x => x.id === t.dataset.rencat); const n = prompt('Novo nome da categoria:', c.name); if (n && n.trim()) { S.saveCategory(Object.assign({}, c, { name: n.trim() })); render(); } return; }
    if (t.dataset.delcat) { if (!S.deleteCategory(t.dataset.delcat)) toast('Mova ou exclua os produtos desta categoria antes.'); else { toast('Categoria excluída'); render(); } return; }
    if (t.dataset.edcr) return openCreatorForm(t.dataset.edcr);
    if (t.dataset.delcr) { if (confirm('Excluir este criador?')) { if (!S.deleteCreator(t.dataset.delcr)) toast('Este criador ainda tem produtos.'); else { toast('Criador excluído'); render(); } } }
  });
  window.addEventListener('fdm:change', e => { if (!dlg.open && e.detail.type === 'catalog') render(); });
  render();
})();
