# FEITO DA MARCA — Arquitetura e caminho para o marketplace

## Estado atual (v1 — demonstração)

| Camada | Arquivo | Observação |
|---|---|---|
| Dados de demonstração | `js/data.js` | Tudo fictício e marcado como demo |
| Repositório de dados | `js/store.js` | Usa `localStorage`. **É o único ponto a trocar** ao migrar para Supabase |
| Capas SVG geradas | `js/cover.js` | Placeholders; imagens reais têm prioridade |
| Pagamentos | `js/payments.js` | Adaptador sem gateway; nunca aprova pagamento |
| Loja | `index.html`, `js/app.js`, `css/styles.css` | Rotas por hash (`#/loja`, `#/produto/ID`…) |
| Admin | `admin.html`, `js/admin.js`, `css/admin.css` | **Sem autenticação** — só para uso local |

## Princípios de segurança para produção

1. **O navegador nunca decide o preço.** O servidor lê o preço no banco ao criar o checkout.
2. **Pagamento só é confirmado por webhook** do gateway (Stripe / Mercado Pago), verificado por assinatura.
3. **Downloads protegidos:** arquivos em bucket privado; links assinados de curta duração, gerados só para quem comprou.
4. **Admin real:** Supabase Auth + papel `admin` verificado por RLS. Remova o link de admin público se preferir um subdomínio separado.
5. Todo texto vindo de usuários é escapado no HTML (`esc()` já é usado em toda a interface).

## Modelo de dados sugerido (Supabase / Postgres)

```sql
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text, role text not null default 'buyer' check (role in ('buyer','creator','admin')),
  created_at timestamptz default now()
);

create table creators (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  slug text unique not null, name text not null, bio text, link text,
  commission_rate numeric(5,2) not null default 20.00,   -- % retido pela plataforma
  payout_account text, active boolean default true
);

create table categories (id text primary key, name text not null);

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  creator_id uuid not null references creators(id),
  category_id text not null references categories(id),
  name text not null, description text,
  price_cents int not null check (price_cents >= 0),
  sale_price_cents int check (sale_price_cents is null or sale_price_cents < price_cents),
  formats text[], software text[], includes text[], license text,
  is_featured boolean default false, is_new boolean default false,
  status text not null default 'draft' check (status in ('draft','review','active','inactive')),
  image_paths text[],        -- bucket público "product-images"
  file_path text,            -- bucket PRIVADO "product-files"
  created_at timestamptz default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references profiles(id), email text not null,
  total_cents int not null, status text not null default 'pending'
    check (status in ('pending','paid','refunded','failed')),
  gateway text, gateway_ref text, created_at timestamptz default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  creator_id uuid not null references creators(id),
  unit_price_cents int not null,
  platform_fee_cents int not null,     -- comissão calculada no servidor
  creator_earning_cents int not null
);

create table favorites (user_id uuid references profiles(id), product_id uuid references products(id), primary key (user_id, product_id));
```

## Políticas RLS (esboço)

- `products`: qualquer pessoa lê onde `status = 'active'`; criador escreve só onde `creator_id` é dele; admin escreve tudo.
- `orders` / `order_items`: comprador lê apenas os seus; criador lê apenas itens dos seus produtos; escrita só via função de servidor (service role).
- `storage`: `product-images` leitura pública; `product-files` sem acesso direto — apenas URLs assinadas geradas por Edge Function após verificar pedido `paid`.

## Mapa dos requisitos futuros

| Requisito | Como encaixar |
|---|---|
| Cadastro de usuários | Supabase Auth (e-mail/senha, Google) + `profiles` |
| Cadastro e perfil de criador | `creators` + página `#/criador/ID` (já existe) |
| Painel do vendedor | Nova página `vendedor.html` reutilizando `admin.js`, filtrada por `creator_id` via RLS |
| Publicação e upload de arquivos | Formulário do admin + Supabase Storage (bucket privado) + status `review` para moderação |
| Vendas e histórico de pedidos | `orders` / `order_items`, telas de listagem por comprador e criador |
| Comissões | `commission_rate` por criador; cálculo no servidor ao confirmar o webhook |
| Área do comprador / biblioteca | Página `#/conta` listando `order_items` pagos com botão de download assinado |

## Como migrar `store.js`

Mantenha a mesma interface (`products()`, `product(id)`, `saveProduct()`, `cartItems()`…) mas torne as leituras assíncronas
(`await supabase.from('products').select(...)`). Ajuste `app.js` e `admin.js` para `await` nas chamadas. Favoritos e
sacola podem continuar locais para visitantes e sincronizar com o banco quando o usuário estiver logado.

## Pagamentos

1. Edge Function `create-checkout` recebe `productIds` + `email`, busca preços, cria o pedido `pending` e a sessão no gateway.
2. Edge Function `payment-webhook` valida a assinatura, marca o pedido como `paid` e grava comissões.
3. No front: `FDM.payments.configure({ provider:'stripe', endpoint:'https://<projeto>.functions.supabase.co/create-checkout' })`.
