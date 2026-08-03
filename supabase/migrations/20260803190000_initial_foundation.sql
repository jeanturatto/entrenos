begin;

create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create type public.space_status as enum (
  'active',
  'paused',
  'unlink_requested',
  'closed'
);

create type public.member_status as enum (
  'active',
  'paused',
  'left'
);

create type public.invitation_status as enum (
  'pending',
  'accepted',
  'declined',
  'cancelled',
  'expired'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_path text,
  locale text not null default 'pt-BR',
  timezone text not null default 'America/Sao_Paulo',
  currency_code text not null default 'BRL',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length check (char_length(display_name) between 1 and 80),
  constraint profiles_currency_code_format check (currency_code ~ '^[A-Z]{3}$')
);

comment on table public.profiles is
  'Dados públicos mínimos do usuário. E-mail e credenciais permanecem em auth.users.';

create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references public.profiles (id) on delete restrict,
  status public.space_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint spaces_name_length check (char_length(btrim(name)) between 1 and 80)
);

create table public.space_members (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete restrict,
  user_id uuid not null references public.profiles (id) on delete restrict,
  status public.member_status not null default 'active',
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint space_members_unique_user unique (space_id, user_id),
  constraint space_members_left_at_consistency check (
    (status = 'left' and left_at is not null)
    or (status <> 'left' and left_at is null)
  )
);

comment on table public.space_members is
  'O MVP não possui papel de proprietário: membros ativos têm os mesmos direitos básicos.';

create table public.space_invitations (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete restrict,
  invited_by uuid not null references public.profiles (id) on delete restrict,
  token_hash bytea not null unique,
  delivery_hint text,
  status public.invitation_status not null default 'pending',
  expires_at timestamptz not null,
  accepted_by uuid references public.profiles (id) on delete restrict,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  constraint space_invitations_expiry check (expires_at > created_at),
  constraint space_invitations_response_consistency check (
    (status = 'pending' and responded_at is null and accepted_by is null)
    or (status = 'accepted' and responded_at is not null and accepted_by is not null)
    or (
      status in ('declined', 'cancelled', 'expired')
      and responded_at is not null
      and accepted_by is null
    )
  )
);

comment on column public.space_invitations.token_hash is
  'Somente o hash do token é persistido. O token original existe apenas no link enviado.';

create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete restrict,
  space_id uuid references public.spaces (id) on delete restrict,
  consent_type text not null,
  granted boolean not null,
  recorded_at timestamptz not null default now(),
  source text not null default 'app',
  policy_version text not null,
  metadata jsonb not null default '{}'::jsonb,
  constraint consent_records_type_length check (char_length(consent_type) between 1 and 80),
  constraint consent_records_policy_version_length check (char_length(policy_version) between 1 and 40),
  constraint consent_records_metadata_object check (jsonb_typeof(metadata) = 'object')
);

comment on table public.consent_records is
  'Registro append-only de consentimentos e revogações. Um novo estado gera uma nova linha.';

create table public.audit_logs (
  id bigint generated always as identity primary key,
  space_id uuid references public.spaces (id) on delete restrict,
  actor_user_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  request_id uuid not null default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  constraint audit_logs_action_length check (char_length(action) between 1 and 100),
  constraint audit_logs_entity_type_length check (char_length(entity_type) between 1 and 80)
);

comment on table public.audit_logs is
  'Log append-only. Não é exposto diretamente ao cliente para evitar vazamento de campos privados.';

create unique index space_members_one_active_space_per_user_idx
  on public.space_members (user_id)
  where status = 'active';

create index space_members_active_space_idx
  on public.space_members (space_id, user_id)
  where status = 'active';

create index space_invitations_pending_space_idx
  on public.space_invitations (space_id, expires_at)
  where status = 'pending';

create index consent_records_user_type_recorded_idx
  on public.consent_records (user_id, consent_type, recorded_at desc);

create index audit_logs_space_occurred_idx
  on public.audit_logs (space_id, occurred_at desc);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger spaces_set_updated_at
before update on public.spaces
for each row execute function private.set_updated_at();

create trigger space_members_set_updated_at
before update on public.space_members
for each row execute function private.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  candidate_name text;
begin
  candidate_name := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(split_part(new.email, '@', 1), ''),
    'Pessoa'
  );

  insert into public.profiles (id, display_name)
  values (new.id, left(candidate_name, 80));

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function private.is_active_space_member(target_space_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.space_members as membership
    where membership.space_id = target_space_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
  );
$$;

create or replace function private.shares_active_space_with(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.space_members as mine
    join public.space_members as theirs
      on theirs.space_id = mine.space_id
    where mine.user_id = (select auth.uid())
      and mine.status = 'active'
      and theirs.user_id = target_user_id
      and theirs.status = 'active'
  );
$$;

revoke all on function private.is_active_space_member(uuid) from public, anon;
revoke all on function private.shares_active_space_with(uuid) from public, anon;
grant execute on function private.is_active_space_member(uuid) to authenticated;
grant execute on function private.shares_active_space_with(uuid) to authenticated;

create or replace function public.create_space(space_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  created_space_id uuid;
  normalized_name text := btrim(space_name);
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if normalized_name is null or char_length(normalized_name) not between 1 and 80 then
    raise exception 'Space name must contain between 1 and 80 characters' using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.space_members
    where user_id = current_user_id
      and status = 'active'
  ) then
    raise exception 'User already belongs to an active space' using errcode = 'P0001';
  end if;

  insert into public.spaces (name, created_by)
  values (normalized_name, current_user_id)
  returning id into created_space_id;

  insert into public.space_members (space_id, user_id)
  values (created_space_id, current_user_id);

  insert into public.audit_logs (
    space_id,
    actor_user_id,
    action,
    entity_type,
    entity_id,
    new_data
  )
  values (
    created_space_id,
    current_user_id,
    'space.created',
    'space',
    created_space_id,
    jsonb_build_object('name', normalized_name, 'status', 'active')
  );

  return created_space_id;
end;
$$;

revoke all on function public.create_space(text) from public, anon;
grant execute on function public.create_space(text) to authenticated;

alter table public.profiles enable row level security;
alter table public.spaces enable row level security;
alter table public.space_members enable row level security;
alter table public.space_invitations enable row level security;
alter table public.consent_records enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_select_self_or_active_partner
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or (select private.shares_active_space_with(id))
);

create policy profiles_update_self
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy spaces_select_active_member
on public.spaces
for select
to authenticated
using ((select private.is_active_space_member(id)));

create policy space_members_select_active_space
on public.space_members
for select
to authenticated
using ((select private.is_active_space_member(space_id)));

create policy consent_records_select_self
on public.consent_records
for select
to authenticated
using (user_id = (select auth.uid()));

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.spaces from anon, authenticated;
revoke all on table public.space_members from anon, authenticated;
revoke all on table public.space_invitations from anon, authenticated;
revoke all on table public.consent_records from anon, authenticated;
revoke all on table public.audit_logs from anon, authenticated;

grant select, update (display_name, avatar_path, locale, timezone, currency_code)
  on table public.profiles to authenticated;
grant select on table public.spaces to authenticated;
grant select on table public.space_members to authenticated;
grant select on table public.consent_records to authenticated;

commit;
