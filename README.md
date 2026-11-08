# FEITO DA MARCA — Marketplace de produtos digitais

Loja completa em HTML, CSS e JavaScript puro (sem build, sem dependências).
**Todos os produtos, criadores e preços são dados de demonstração fictícios.**

## Como executar

**Opção 1 — direto:** abra `index.html` no navegador (funciona via `file://`).

**Opção 2 — servidor local (recomendado):**

```bash
cd feito-da-marca
python3 -m http.server 8080
# ou: npx serve .
```

Acesse `http://localhost:8080`. A área administrativa fica em `http://localhost:8080/admin.html`.

## O que funciona

- Vitrine: banner comercial, busca em destaque, categorias, destaques, mais vendidos, recém-adicionados e seleção por criador
- Catálogo: busca por nome, filtro por categoria e preço, gratuitos, promoções, ordenação (novidades, menor/maior preço, popularidade)
- Página de produto: galeria, descrição, formatos, programas, conteúdo do download, licença, relacionados
- Favoritos e sacola (adicionar, remover, subtotal, total, continuar comprando) — salvos no navegador
- Checkout **sem pagamento simulado**: ao finalizar, informa que o gateway não está configurado (`js/payments.js`)
- Admin (`admin.html`): CRUD de produtos, upload de imagens, categorias, criadores, destaque/novidade, ativar/desativar, exportar/importar JSON
- Responsivo (celular, tablet, notebook, desktop), menu mobile, foco visível, SEO básico (meta, Open Graph, JSON-LD de produto)

## Estrutura

```
index.html        loja
admin.html        painel administrativo (separado, noindex)
css/styles.css    estilos da loja
css/admin.css     estilos do admin
js/data.js        dados de demonstração
js/cover.js       capas SVG geradas (placeholders)
js/store.js       repositório de dados (localStorage → trocar por Supabase)
js/payments.js    adaptador de pagamentos (Stripe / Mercado Pago, não configurado)
js/app.js         aplicação da loja
js/admin.js       aplicação do admin
docs/ARQUITETURA.md  plano de migração: Supabase, RLS, pedidos, comissões, downloads
```

## Avisos importantes

- **O admin não tem autenticação** (você pediu para não simular login). Ele só edita os dados do seu próprio navegador. Antes de publicar de verdade, proteja-o com Supabase Auth + RLS.
- Alterações do admin ficam no `localStorage` do navegador; não aparecem para outros visitantes até existir um backend.
- Para zerar tudo: Admin → Dados → *Restaurar dados de demonstração*.
- As fontes (Archivo Black e Inter) vêm do Google Fonts; offline, a loja usa fontes do sistema.

Próximos passos: ver `docs/ARQUITETURA.md`.
