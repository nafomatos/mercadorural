-- MercadoRural – Schema inicial
-- Marketplace de serviços rurais do Brasil

-- -------------------------------------------------------
-- Tabela: service_categories
-- Categorias de serviços e produtos disponíveis
-- -------------------------------------------------------
create table if not exists service_categories (
  id          serial primary key,
  order_index integer      not null default 0,
  emoji       text         not null,
  name_pt     text         not null,
  slug        text         not null unique
);

-- Dados iniciais das categorias
insert into service_categories (order_index, emoji, name_pt, slug) values
  (1,  '🌱', 'Insumos Agrícolas',       'insumos'),
  (2,  '🚜', 'Máquinas e Equipamentos', 'maquinas'),
  (3,  '🐄', 'Pecuária',                'pecuaria'),
  (4,  '🌾', 'Grãos e Cereais',         'graos'),
  (5,  '🪚', 'Serviços Rurais',         'servicos'),
  (6,  '🏡', 'Imóveis Rurais',          'imoveis'),
  (7,  '🌿', 'Orgânicos',               'organicos'),
  (8,  '🐓', 'Aves e Suínos',           'aves-suinos');

-- -------------------------------------------------------
-- Tabela: providers
-- Prestadores de serviços e vendedores cadastrados
-- -------------------------------------------------------
create table if not exists providers (
  id           uuid         primary key default gen_random_uuid(),
  name         text         not null,
  whatsapp     text         not null,
  bio          text,
  city         text         not null,
  avg_rating   numeric(2,1) not null default 0.0 check (avg_rating >= 0 and avg_rating <= 5),
  review_count integer      not null default 0 check (review_count >= 0),
  verified     boolean      not null default false,
  created_at   timestamptz  not null default now()
);

-- -------------------------------------------------------
-- Tabela: reviews
-- Avaliações de prestadores feitas por clientes
-- -------------------------------------------------------
create table if not exists reviews (
  id          uuid        primary key default gen_random_uuid(),
  provider_id uuid        not null references providers(id) on delete cascade,
  author_name text        not null,
  rating      integer     not null check (rating >= 1 and rating <= 5),
  comment     text,
  created_at  timestamptz not null default now()
);

-- Índice para buscas de avaliações por prestador
create index if not exists reviews_provider_id_idx on reviews(provider_id);

-- -------------------------------------------------------
-- Função: atualiza avg_rating e review_count automaticamente
-- -------------------------------------------------------
create or replace function update_provider_rating()
returns trigger language plpgsql as $$
begin
  update providers
  set
    avg_rating   = (select round(avg(rating)::numeric, 1) from reviews where provider_id = coalesce(new.provider_id, old.provider_id)),
    review_count = (select count(*) from reviews where provider_id = coalesce(new.provider_id, old.provider_id))
  where id = coalesce(new.provider_id, old.provider_id);
  return new;
end;
$$;

create or replace trigger trg_update_provider_rating
after insert or update or delete on reviews
for each row execute function update_provider_rating();
