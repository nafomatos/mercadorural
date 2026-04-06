-- Adiciona coluna status em providers
-- Valores: 'active' (padrão), 'pending' (aguardando aprovação), 'rejected'
alter table providers
  add column if not exists status text not null default 'active'
    check (status in ('active', 'pending', 'rejected'));

create index if not exists providers_status_idx on providers(status);
