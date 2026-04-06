-- Adiciona coluna website em providers (URL do site ou Instagram)
alter table providers
  add column if not exists website text;
