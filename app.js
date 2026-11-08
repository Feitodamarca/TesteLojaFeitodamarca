/* FEITO DA MARCA — protótipo front-end.
   Dados persistidos em localStorage somente neste navegador.
   Não representa autenticação, checkout, pagamento ou entrega segura de arquivos. */
(() => {
 const KEY="fdm_products_v1", BAG="fdm_bag_v1";
 const categories=["Vetores e ilustrações","Arquivos de bordado","Logos e identidades visuais","Templates e apresentações","Papelaria e materiais gráficos","Recursos para empreendedores"];
 const $=s=>document.querySelector(s);
 const money=v=>Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
 let products=loadProducts(), bag=JSON.parse(localStorage.getItem(BAG)||"[]"), editingId=null, adminTab="products";
 function loadProducts(){try{const v=JSON.parse(localStorage.getItem(KEY));return Array.isArray(v)?v:structuredClone(window.FDM_SEED_PRODUCTS)}catch{return structuredClone(window.FDM_SEED_PRODUCTS)}}
 function saveProducts(){localStorage.setItem(KEY,JSON.stringify(products))}
 function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove("show"),2600)}
 function activeProducts(){return products.filter(p=>p.active!==false)}
 function initFilters(){const s=$("#categoryFilter");s.innerHTML='<option value="">TODAS AS CATEGORIAS</option>'+categories.map(c=>`<option>${c}</option>`).join("")}
 function renderProducts(){
  const query=$("#searchInput").value.trim().toLowerCase(),cat=$("#categoryFilter").value,sort=$("#sortSelect").value;
  let list=activeProducts().filter(p=>(!cat||p.category===cat)&&(!query||(p.name+" "+p.category+" "+p.description).toLowerCase().includes(query)));
  if(sort==="low")list.sort((a,b)=>a.price-b.price);if(sort==="high")list.sort((a,b)=>b.price-a.price);if(sort==="name")list.sort((a,b)=>a.name.localeCompare(b.name));if(sort==="featured")list.sort((a,b)=>Number(b.featured)-Number(a.featured));
  $("#resultCount").textContent=String(list.length).padStart(2,"0")+" RECURSOS";
  $("#productGrid").innerHTML=list.length?list.map(p=>`<article class="product-card" data-product="${p.id}" tabindex="0"><div class="product-image"><img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">${p.badge?`<span class="product-badge ${p.badge==="NOVO"?"pink":""}">${esc(p.badge)}</span>`:""}<button class="product-open" aria-label="Ver ${esc(p.name)}">↗</button></div><div class="product-info"><span class="product-category">${esc(p.category)}</span><strong class="product-name">${esc(p.name)}</strong><span class="product-price">${money(p.price)}</span><span class="product-format">${(p.formats||[]).join(" · ")}</span></div></article>`).join(""):'<div class="empty-state">NENHUM RECURSO ENCONTRADO.<br><br>QUE TAL TENTAR OUTRA BUSCA?</div>';
 }
 function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
 function openProduct(id){
  const p=products.find(x=>x.id===id);if(!p)return;
  const gallery=p.gallery?.length?p.gallery:[p.image];
  $("#productDetail").innerHTML=`<div class="detail-layout"><div class="detail-gallery"><img class="detail-main-image" id="detailMainImage" src="${esc(gallery[0])}" alt="${esc(p.name)}"><div class="detail-thumbs">${gallery.map((src,i)=>`<button class="${i===0?"active":""}" data-image="${esc(src)}"><img src="${esc(src)}" alt="Visualização ${i+1}"></button>`).join("")}</div></div><div class="detail-copy"><span class="section-kicker">[ ${esc(p.category.toUpperCase())} ]</span><h2>${esc(p.name)}</h2><p>${esc(p.description)}</p><div class="detail-price">${money(p.price)}</div><div class="detail-specs">FORMATOS: ${(p.formats||[]).join(" / ")}<br>${esc(p.fileInfo||"Arquivo digital para download.")}<br>TIPO: RECURSO DIGITAL</div><button class="buy-button" id="addToBag">ADICIONAR À SACOLA — ${money(p.price)}</button><div class="buy-note">PROTÓTIPO: CHECKOUT E PAGAMENTO AINDA NÃO IMPLEMENTADOS.</div></div></div>`;
  $("#productModal").classList.add("open");$("#productModal").setAttribute("aria-hidden","false");
  $("#productDetail").querySelectorAll("[data-image]").forEach(b=>b.addEventListener("click",()=>{$("#detailMainImage").src=b.dataset.image;$("#productDetail").querySelectorAll("[data-image]").forEach(x=>x.classList.remove("active"));b.classList.add("active")}));
  $("#addToBag").addEventListener("click",()=>{bag.push(id);localStorage.setItem(BAG,JSON.stringify(bag));updateBag();toast("Adicionado à sacola demonstrativa.")});
 }
 function updateBag(){$("#bagCount").textContent=bag.length}
 function closeModal(id){$("#"+id).classList.remove("open");$("#"+id).setAttribute("aria-hidden","true")}
 function openAdmin(){adminTab="products";editingId=null;renderAdmin();$("#adminModal").classList.add("open");$("#adminModal").setAttribute("aria-hidden","false")}
 function renderAdmin(){
  const root=$("#adminContent");
  root.innerHTML=`<div class="admin-head"><div><span class="section-kicker">[ BACKSTAGE / FDM ]</span><h2>PAINEL DA LOJA.</h2><p>GERENCIAMENTO LOCAL DO CATÁLOGO · PROTÓTIPO</p></div><span class="section-kicker">v0.1</span></div><div class="admin-tabs"><button data-tab="products" class="${adminTab==="products"?"active":""}">PRODUTOS</button><button data-tab="form" class="${adminTab==="form"?"active":""}">+ CADASTRAR</button><button data-tab="categories" class="${adminTab==="categories"?"active":""}">CATEGORIAS</button></div><div id="adminPanel"></div>`;
  root.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{adminTab=b.dataset.tab;editingId=null;renderAdmin()});
  const panel=$("#adminPanel");
  if(adminTab==="products"){panel.innerHTML=`<div class="admin-list">${products.map(p=>`<div class="admin-row"><img src="${esc(p.image)}" alt=""><div><strong>${esc(p.name)}</strong><small>${esc(p.category)} · ${money(p.price)} · ${p.active===false?"INATIVO":"ATIVO"}</small></div><button data-edit="${p.id}">EDITAR</button><button data-delete="${p.id}">EXCLUIR</button></div>`).join("")||"SEM PRODUTOS"}</div>`;panel.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>{editingId=b.dataset.edit;adminTab="form";renderAdmin()});panel.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>{if(confirm("Excluir este produto do catálogo local?")){products=products.filter(p=>p.id!==b.dataset.delete);saveProducts();renderAdmin();renderProducts();toast("Produto excluído.")}})}
  else if(adminTab==="form") renderProductForm(panel);
  else panel.innerHTML=`<p style="font:12px/1.7 var(--body)">As categorias iniciais fazem parte da estrutura do protótipo. Para esta versão, a lista é fixa no código. Na integração com Supabase, categorias serão registros independentes e editáveis.</p><div class="admin-list">${categories.map((c,i)=>`<div class="admin-row"><div style="font:12px var(--mono">${String(i+1).padStart(2,"0")}</div><div><strong>${esc(c)}</strong></div><small>ATIVA</small></div>`).join("")}</div>`;
 }
 function renderProductForm(panel){
  const p=products.find(x=>x.id===editingId)||{name:"",category:categories[0],price:"",formats:[],badge:"",featured:false,active:true,description:"",image:"",gallery:[],fileInfo:""};
  panel.innerHTML=`<form id="productForm" class="admin-form">
   <label>NOME DO PRODUTO<input name="name" required value="${esc(p.name)}"></label>
   <label>CATEGORIA<select name="category">${categories.map(c=>`<option ${p.category===c?"selected":""}>${esc(c)}</option>`).join("")}</select></label>
   <label>PREÇO (R$)<input name="price" type="number" min="0" step=".01" required value="${p.price}"></label>
   <label>FORMATOS (separados por vírgula)<input name="formats" value="${esc((p.formats||[]).join(", "))}" placeholder="SVG, PDF, PNG"></label>
   <label class="wide">DESCRIÇÃO<textarea name="description">${esc(p.description)}</textarea></label>
   <label class="wide">URL DA IMAGEM PRINCIPAL<input name="image" type="url" required value="${esc(p.image)}" placeholder="https://..."></label>
   <label class="wide">GALERIA (URLs separadas por vírgula)<input name="gallery" value="${esc((p.gallery||[]).join(", "))}"></label>
   <label class="wide">INFORMAÇÕES DO ARQUIVO<input name="fileInfo" value="${esc(p.fileInfo||"")}"></label>
   <label>SELO<select name="badge"><option value="">SEM SELO</option>${["NOVO","DESTAQUE","MAIS BAIXADO"].map(x=>`<option ${p.badge===x?"selected":""}>${x}</option>`).join("")}</select></label>
   <div class="admin-checks"><label><input type="checkbox" name="featured" ${p.featured?"checked":""}> DESTAQUE</label><label><input type="checkbox" name="active" ${p.active!==false?"checked":""}> ATIVO</label></div>
   <div class="wide"><button class="admin-submit" type="submit">${editingId?"SALVAR ALTERAÇÕES":"CADASTRAR PRODUTO"} ↗</button> <button type="button" class="admin-secondary" id="cancelForm">CANCELAR</button></div>
   <p class="wide" style="font:9px/1.6 var(--mono);color:#777">ARQUIVOS DIGITAIS: o upload seguro ainda não está conectado. Nesta fase, informe uma URL pública de imagem. Não use este painel para armazenar arquivos de compradores.</p>
  </form>`;
  $("#cancelForm").onclick=()=>{adminTab="products";editingId=null;renderAdmin()};
  $("#productForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.currentTarget),name=f.get("name").trim(),id=editingId||slug(name);const item={id,name,category:f.get("category"),price:Number(f.get("price")),formats:f.get("formats").split(",").map(x=>x.trim()).filter(Boolean),badge:f.get("badge"),featured:f.has("featured"),active:f.has("active"),description:f.get("description"),image:f.get("image"),gallery:f.get("gallery").split(",").map(x=>x.trim()).filter(Boolean),fileInfo:f.get("fileInfo")};const idx=products.findIndex(x=>x.id===id);if(idx>=0)products[idx]=item;else products.unshift(item);saveProducts();renderProducts();adminTab="products";editingId=null;renderAdmin();toast("Produto salvo no armazenamento local.")};
 }
 function slug(s){return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")+"-"+Date.now().toString().slice(-4)}
 $("#productGrid").addEventListener("click",e=>{const card=e.target.closest("[data-product]");if(card)openProduct(card.dataset.product)});
 $("#productGrid").addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.matches("[data-product]"))openProduct(e.target.dataset.product)});
 $("#searchInput").addEventListener("input",renderProducts);$("#categoryFilter").addEventListener("change",renderProducts);$("#sortSelect").addEventListener("change",renderProducts);
 document.querySelectorAll("[data-category]").forEach(b=>b.addEventListener("click",()=>{$("#categoryFilter").value=b.dataset.category;renderProducts;$("#catalogo").scrollIntoView({behavior:"smooth"});setTimeout(renderProducts,100)}));
 $("#focusSearch").onclick=()=>{$("#catalogo").scrollIntoView({behavior:"smooth"});setTimeout(()=>$("#searchInput").focus(),450)};
 $("#bagButton").onclick=()=>toast(bag.length?`Sacola demonstrativa: ${bag.length} item(ns). Checkout ainda não disponível.`:"Sua sacola está vazia.");
 $("#adminOpen").onclick=openAdmin;
 document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>closeModal(b.dataset.close));
 document.querySelectorAll(".modal-backdrop").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)closeModal(m.id)}));
 $("#newsletterForm").onsubmit=e=>{e.preventDefault();toast("Obrigado! Cadastro demonstrativo recebido.");e.target.reset()};
 $("#menuToggle").onclick=()=>$(".main-nav").classList.toggle("open");
 document.addEventListener("keydown",e=>{if(e.key==="Escape")document.querySelectorAll(".modal-backdrop.open").forEach(m=>closeModal(m.id))});
 initFilters();renderProducts();updateBag();
})();