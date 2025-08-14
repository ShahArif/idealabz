-- Create table to store AI-generated PRD documents per idea
create table if not exists public.prd_documents (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas(id) on delete cascade,
  one_pager text,
  full_prd text,
  generated_by uuid references auth.users(id),
  generated_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(idea_id)
);

alter table public.prd_documents enable row level security;

-- Policies
create policy "prd_docs_select_authenticated" on public.prd_documents
  for select using (auth.role() = 'authenticated');

create policy "prd_docs_insert_self" on public.prd_documents
  for insert with check (auth.uid() = generated_by);

create policy "prd_docs_update_self_or_admin" on public.prd_documents
  for update using (
    auth.uid() = generated_by or coalesce(public.get_user_role(auth.uid()) = 'super_admin', false)
  );

-- Trigger to maintain updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger prd_documents_update_updated_at
  before update on public.prd_documents
  for each row execute function public.update_updated_at_column();
