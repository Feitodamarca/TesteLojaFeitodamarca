# FEITO DA MARCA — marketplace demonstrativo

## Executar
1. Extraia o ZIP.
2. Abra `index.html` no navegador. Para melhor compatibilidade, sirva a pasta com um servidor estático:
   - Python: `python -m http.server 8000`
   - Acesse `http://localhost:8000`
3. Não é necessário instalar dependências.

## O que funciona
- Vitrine responsiva, categorias e chips de filtro.
- Busca por nome, categoria, criador e descrição.
- Ordenação por destaque, novidade, preço e popularidade.
- Filtro de preço máximo, gratuitos e em promoção.
- Detalhes do produto, favoritos e sacola.
- Checkout demonstrativo sem cobrança ou aprovação falsa.
- Painel local para CRUD de produtos e cadastro/exclusão de criadores.
- Persistência do protótipo via `localStorage`.

## Dados de demonstração
O catálogo e os criadores iniciais são fictícios e estão identificados como conteúdo demonstrativo. Capas gráficas abstratas são geradas em CSS quando não há URL de imagem. É possível informar uma URL de imagem no painel.

## Acesso administrativo
Use o link discreto “Admin” no cabeçalho. **Este painel não possui autenticação**: é apenas uma demonstração local para validar a experiência. Não publique em produção nem armazene dados reais nele.

## Limitações e próximos passos para produção
Este projeto é um frontend funcional de protótipo, não uma plataforma transacional pronta para receber pagamentos. Para produção:
- Migrar catálogo, categorias, criadores, pedidos e favoritos para Supabase.
- Configurar Supabase Auth e políticas RLS; nunca confiar em permissões apenas no frontend.
- Guardar arquivos digitais em Storage privado com URLs assinadas e controle de acesso por pedido.
- Implementar backend/Edge Functions para pedidos, comissões, webhooks e liberação de downloads.
- Integrar Mercado Pago ou Stripe no servidor. Confirmar pagamentos exclusivamente por webhook verificado; nunca pelo retorno visual do checkout.
- Implementar autenticação e autorização real para admin e vendedores, validação de uploads, limites e moderação.
- Criar páginas de termos/licença, privacidade, suporte, política de reembolso e informações fiscais.
- Adicionar testes, monitoramento, logs, proteção contra abuso e backups.

## Estrutura
- `index.html` — estrutura da loja, modais e painel.
- `styles.css` — identidade visual e responsividade.
- `app.js` — catálogo, busca, filtros, sacola, favoritos e gestão local.
