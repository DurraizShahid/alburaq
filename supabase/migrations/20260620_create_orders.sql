create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_first_name text not null,
  customer_last_name text not null,
  customer_email text not null,
  customer_phone text,
  shipping_address_line_1 text not null,
  shipping_address_line_2 text,
  shipping_city text not null,
  shipping_postcode text not null,
  shipping_country text not null default 'United Kingdom',
  shipping_method text not null,
  shipping_amount numeric(10, 2) not null default 0,
  subtotal_amount numeric(10, 2) not null,
  total_amount numeric(10, 2) not null,
  currency_code text not null default 'GBP',
  item_count integer not null default 0,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  fragrance_id text not null,
  fragrance_slug text not null,
  fragrance_name text not null,
  fragrance_brand text not null,
  unit_price numeric(10, 2) not null,
  quantity integer not null,
  line_total numeric(10, 2) not null,
  created_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
