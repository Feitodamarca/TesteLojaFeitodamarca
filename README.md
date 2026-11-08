# FEITO DA MARCA — Creative Marketplace

Protótipo front-end responsivo em HTML, CSS e JavaScript puro.

## Como executar
1. Extraia o ZIP.
2. Abra `index.html` no navegador. Para melhor compatibilidade, use um servidor local (ex.: extensão Live Server no VS Code).
3. O catálogo inicial está em `data.js`.
4. Use **ÁREA ADMIN** no rodapé para cadastrar, editar, ativar/desativar, destacar e excluir produtos. Os dados ficam em `localStorage` no navegador atual.

## O que está funcional
- Página inicial editorial e responsiva.
- Categorias que filtram o catálogo.
- Pesquisa por nome, categoria e descrição.
- Ordenação por preço e nome.
- Página/modal de produto com galeria, descrição, formatos e preço.
- Sacola demonstrativa persistida localmente.
- Painel administrativo local para CRUD de produtos.
- Dados do catálogo separados da interface (`data.js`).

## Limites importantes desta fase
- O painel não tem login: não publique nem exponha dados sensíveis.
- `localStorage` é local ao navegador/dispositivo e não é banco de dados compartilhado.
- Sacola e newsletter são demonstrações; não existe checkout, pagamento, conta de comprador nem entrega de downloads.
- Upload de arquivos digitais não está conectado; o painel aceita URLs públicas para imagens.
- Imagens externas dependem de disponibilidade dos respectivos provedores.
- Categorias estão fixas nesta primeira versão; a próxima etapa é movê-las para o banco.

## Próxima arquitetura sugerida (Supabase)
Tabelas:
- `profiles`: usuário e papel (`buyer`, `creator`, `admin`).
- `creators`: perfil público do vendedor.
- `categories`: nome, slug, ordem, ativo.
- `products`: `creator_id`, categoria, título, slug, descrição, preço em centavos, status, destaque.
- `product_media`: `product_id`, caminho no Storage, ordem, texto alternativo.
- `digital_assets`: `product_id`, caminho privado no Storage, nome, tipo MIME, tamanho.
- `orders` e `order_items`: pedidos e itens; só registrar como pagos após confirmação confiável do gateway.
- `entitlements`: direitos de download vinculados a itens pagos.

Storage:
- Bucket público apenas para imagens de catálogo.
- Bucket privado para arquivos digitais.
- Downloads com URLs assinadas de curta duração, após validação no servidor da compra e da autorização.

Segurança:
- Supabase Auth para identidade.
- Row Level Security em todas as tabelas.
- Apenas administradores podem gerir categorias globais.
- Criadores podem gerir somente seus próprios produtos.
- Compradores acessam somente seus pedidos e downloads autorizados.
- Nunca colocar `service_role` ou segredo de gateway no navegador.

Integração futura:
- Criar uma camada `catalogRepository` para trocar a fonte local por Supabase.
- Checkout deve ser criado no backend/Edge Function e confirmado por webhook assinado do gateway.
- Não liberar download com base apenas em retorno visual do navegador.

## Estrutura
- `index.html`: estrutura das páginas/seções e modais.
- `styles.css`: identidade visual, layout e responsividade.
- `data.js`: catálogo demonstrativo.
- `app.js`: renderização, filtros, detalhe, sacola e painel admin.
