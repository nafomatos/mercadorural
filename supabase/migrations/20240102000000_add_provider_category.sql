-- Adiciona coluna category_slug em providers com FK para service_categories
alter table providers
  add column if not exists category_slug text references service_categories(slug) on update cascade on delete set null;

create index if not exists providers_category_slug_idx on providers(category_slug);
create index if not exists providers_city_idx on providers(city);
