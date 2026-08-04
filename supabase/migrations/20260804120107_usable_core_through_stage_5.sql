begin;

create type public.event_visibility as enum (
  'private',
  'busy_only',
  'title_only',
  'full'
);

create type public.event_status as enum (
  'proposed',
  'confirmed',
  'cancelled'
);

create type public.event_response_status as enum (
  'pending',
  'accepted',
  'declined',
  'maybe'
);

create type public.shared_list_kind as enum ('tasks', 'shopping');
create type public.shared_item_status as enum ('open', 'completed');
create type public.shared_recurrence as enum ('none', 'daily', 'weekly', 'monthly');

create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete restrict,
  owner_id uuid not null references public.profiles (id) on delete restrict,
  title text not null,
  description text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  visibility public.event_visibility not null default 'full',
  status public.event_status not null default 'proposed',
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint calendar_events_title_length check (char_length(btrim(title)) between 1 and 120),
  constraint calendar_events_description_length check (description is null or char_length(description) <= 2000),
  constraint calendar_events_location_length check (location is null or char_length(location) <= 200),
  constraint calendar_events_valid_period check (ends_at > starts_at),
  constraint calendar_events_positive_version check (version > 0)
);

create table public.event_responses (
  event_id uuid not null references public.calendar_events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete restrict,
  response public.event_response_status not null default 'pending',
  note text,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (event_id, user_id),
  constraint event_responses_note_length check (note is null or char_length(note) <= 500),
  constraint event_responses_time_consistency check (
    (response = 'pending' and responded_at is null)
    or (response <> 'pending' and responded_at is not null)
  )
);

create table public.shared_lists (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete restrict,
  name text not null,
  kind public.shared_list_kind not null,
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shared_lists_name_length check (char_length(btrim(name)) between 1 and 80),
  constraint shared_lists_one_kind_per_space unique (space_id, kind)
);

create table public.shared_items (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete restrict,
  list_id uuid not null references public.shared_lists (id) on delete restrict,
  title text not null,
  notes text,
  quantity text,
  assigned_to uuid references public.profiles (id) on delete restrict,
  due_at timestamptz,
  recurrence public.shared_recurrence not null default 'none',
  status public.shared_item_status not null default 'open',
  completed_by uuid references public.profiles (id) on delete restrict,
  completed_at timestamptz,
  created_by uuid not null references public.profiles (id) on delete restrict,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shared_items_title_length check (char_length(btrim(title)) between 1 and 160),
  constraint shared_items_notes_length check (notes is null or char_length(notes) <= 2000),
  constraint shared_items_quantity_length check (quantity is null or char_length(quantity) <= 80),
  constraint shared_items_positive_version check (version > 0),
  constraint shared_items_completion_consistency check (
    (status = 'open' and completed_by is null and completed_at is null)
    or (status = 'completed' and completed_by is not null and completed_at is not null)
  )
);

comment on table public.calendar_events is
  'Agenda do casal. O acesso do cliente ocorre por RPC para aplicar a visibilidade campo a campo.';
comment on table public.shared_items is
  'Itens de tarefas e compras com versão otimista para impedir sobrescritas silenciosas.';

create index calendar_events_space_period_idx
  on public.calendar_events (space_id, starts_at, ends_at)
  where status <> 'cancelled';
create index calendar_events_owner_idx on public.calendar_events (owner_id, starts_at desc);
create index event_responses_user_idx on public.event_responses (user_id, updated_at desc);
create index shared_lists_space_idx on public.shared_lists (space_id, kind);
create index shared_items_space_status_idx on public.shared_items (space_id, status, updated_at desc);
create index shared_items_list_status_idx on public.shared_items (list_id, status, updated_at desc);
create index shared_items_assigned_to_idx
  on public.shared_items (assigned_to, status)
  where assigned_to is not null;

create trigger calendar_events_set_updated_at
before update on public.calendar_events
for each row execute function private.set_updated_at();

create trigger event_responses_set_updated_at
before update on public.event_responses
for each row execute function private.set_updated_at();

create trigger shared_lists_set_updated_at
before update on public.shared_lists
for each row execute function private.set_updated_at();

create trigger shared_items_set_updated_at
before update on public.shared_items
for each row execute function private.set_updated_at();

create or replace function private.current_space_id()
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  selected_space_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select membership.space_id
  into selected_space_id
  from public.space_members as membership
  join public.spaces as space on space.id = membership.space_id
  where membership.user_id = (select auth.uid())
    and membership.status = 'active'
    and space.status = 'active'
  limit 1;

  if selected_space_id is null then
    raise exception 'Create or join a shared space first' using errcode = 'P0001';
  end if;

  return selected_space_id;
end;
$$;

revoke all on function private.current_space_id() from public, anon, authenticated;

create or replace function private.ensure_default_shared_lists(
  target_space_id uuid,
  actor_user_id uuid
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.shared_lists (space_id, name, kind, created_by)
  values
    (target_space_id, 'Tarefas', 'tasks', actor_user_id),
    (target_space_id, 'Compras', 'shopping', actor_user_id)
  on conflict (space_id, kind) do nothing;
$$;

revoke all on function private.ensure_default_shared_lists(uuid, uuid)
from public, anon, authenticated;

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
    select 1 from public.space_members
    where user_id = current_user_id and status = 'active'
  ) then
    raise exception 'User already belongs to an active space' using errcode = 'P0001';
  end if;

  insert into public.spaces (name, created_by)
  values (normalized_name, current_user_id)
  returning id into created_space_id;

  insert into public.space_members (space_id, user_id)
  values (created_space_id, current_user_id);

  perform private.ensure_default_shared_lists(created_space_id, current_user_id);

  insert into public.audit_logs (
    space_id, actor_user_id, action, entity_type, entity_id, new_data
  ) values (
    created_space_id, current_user_id, 'space.created', 'space', created_space_id,
    jsonb_build_object('name', normalized_name, 'status', 'active')
  );

  return created_space_id;
end;
$$;

create or replace function public.create_space_invitation(p_delivery_hint text default null)
returns table (invitation_id uuid, invite_code text, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_space_id uuid := private.current_space_id();
  generated_code text;
begin
  perform 1 from public.spaces where id = current_space_id for update;

  if (select count(*) from public.space_members where space_id = current_space_id and status = 'active') >= 2 then
    raise exception 'This shared space already has two active members' using errcode = 'P0001';
  end if;

  update public.space_invitations
  set status = 'cancelled', responded_at = now()
  where space_id = current_space_id and status = 'pending';

  generated_code := upper(substr(encode(extensions.gen_random_bytes(8), 'hex'), 1, 8));

  insert into public.space_invitations (
    space_id, invited_by, token_hash, delivery_hint, expires_at
  ) values (
    current_space_id,
    current_user_id,
    extensions.digest(generated_code, 'sha256'),
    nullif(btrim(p_delivery_hint), ''),
    now() + interval '7 days'
  )
  returning public.space_invitations.id, public.space_invitations.expires_at
  into invitation_id, expires_at;

  invite_code := generated_code;

  insert into public.audit_logs (
    space_id, actor_user_id, action, entity_type, entity_id,
    new_data
  ) values (
    current_space_id, current_user_id, 'invitation.created', 'space_invitation', invitation_id,
    jsonb_build_object('expires_at', expires_at, 'delivery_hint', nullif(btrim(p_delivery_hint), ''))
  );

  return next;
end;
$$;

create or replace function public.cancel_space_invitation()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_space_id uuid := private.current_space_id();
  affected_count integer;
begin
  update public.space_invitations
  set status = 'cancelled', responded_at = now()
  where space_id = current_space_id
    and invited_by = current_user_id
    and status = 'pending';

  get diagnostics affected_count = row_count;

  if affected_count > 0 then
    insert into public.audit_logs (space_id, actor_user_id, action, entity_type)
    values (current_space_id, current_user_id, 'invitation.cancelled', 'space_invitation');
  end if;

  return affected_count > 0;
end;
$$;

create or replace function public.join_space_by_code(p_invite_code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_code text := upper(btrim(p_invite_code));
  selected_invitation public.space_invitations%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if normalized_code !~ '^[0-9A-F]{8}$' then
    raise exception 'Invalid invitation code' using errcode = '22023';
  end if;

  if exists (
    select 1 from public.space_members
    where user_id = current_user_id and status = 'active'
  ) then
    raise exception 'User already belongs to an active space' using errcode = 'P0001';
  end if;

  select invitation.*
  into selected_invitation
  from public.space_invitations as invitation
  where invitation.token_hash = extensions.digest(normalized_code, 'sha256')
  for update;

  if not found then
    raise exception 'Invitation not found' using errcode = 'P0001';
  end if;

  if selected_invitation.status <> 'pending' then
    raise exception 'Invitation is no longer available' using errcode = 'P0001';
  end if;

  if selected_invitation.expires_at <= now() then
    update public.space_invitations
    set status = 'expired', responded_at = now()
    where id = selected_invitation.id;
    raise exception 'Invitation has expired' using errcode = 'P0001';
  end if;

  perform 1 from public.spaces where id = selected_invitation.space_id and status = 'active' for update;
  if not found then
    raise exception 'Shared space is not active' using errcode = 'P0001';
  end if;

  if (select count(*) from public.space_members where space_id = selected_invitation.space_id and status = 'active') >= 2 then
    raise exception 'This shared space already has two active members' using errcode = 'P0001';
  end if;

  insert into public.space_members (space_id, user_id)
  values (selected_invitation.space_id, current_user_id);

  update public.space_invitations
  set status = 'accepted', accepted_by = current_user_id, responded_at = now()
  where id = selected_invitation.id;

  perform private.ensure_default_shared_lists(selected_invitation.space_id, current_user_id);

  insert into public.audit_logs (
    space_id, actor_user_id, action, entity_type, entity_id, new_data
  ) values (
    selected_invitation.space_id, current_user_id, 'invitation.accepted',
    'space_invitation', selected_invitation.id,
    jsonb_build_object('accepted_by', current_user_id)
  );

  return selected_invitation.space_id;
end;
$$;

create or replace function public.list_calendar_events(
  p_from timestamptz,
  p_to timestamptz
)
returns table (
  event_id uuid,
  event_title text,
  event_description text,
  event_location text,
  starts_at timestamptz,
  ends_at timestamptz,
  visibility public.event_visibility,
  status public.event_status,
  version integer,
  owner_id uuid,
  owner_name text,
  owned_by_me boolean,
  my_response public.event_response_status,
  partner_response public.event_response_status
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_space_id uuid := private.current_space_id();
begin
  if p_from is null or p_to is null or p_to <= p_from then
    raise exception 'Invalid calendar period' using errcode = '22023';
  end if;

  return query
  select
    event.id,
    case
      when event.owner_id = current_user_id or event.visibility in ('title_only', 'full') then event.title
      else 'Ocupado'
    end,
    case
      when event.owner_id = current_user_id or event.visibility = 'full' then event.description
      else null
    end,
    case
      when event.owner_id = current_user_id or event.visibility = 'full' then event.location
      else null
    end,
    event.starts_at,
    event.ends_at,
    event.visibility,
    event.status,
    event.version,
    event.owner_id,
    owner_profile.display_name,
    event.owner_id = current_user_id,
    coalesce(my_answer.response, 'pending'::public.event_response_status),
    coalesce(partner_answer.response, 'pending'::public.event_response_status)
  from public.calendar_events as event
  join public.profiles as owner_profile on owner_profile.id = event.owner_id
  left join public.event_responses as my_answer
    on my_answer.event_id = event.id and my_answer.user_id = current_user_id
  left join public.event_responses as partner_answer
    on partner_answer.event_id = event.id and partner_answer.user_id <> current_user_id
  where event.space_id = current_space_id
    and event.status <> 'cancelled'
    and event.starts_at < p_to
    and event.ends_at > p_from
    and (event.owner_id = current_user_id or event.visibility <> 'private')
  order by event.starts_at asc;
end;
$$;

create or replace function public.create_calendar_event(
  p_title text,
  p_description text,
  p_location text,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_visibility public.event_visibility
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_space_id uuid := private.current_space_id();
  created_event_id uuid;
  normalized_title text := btrim(p_title);
  initial_status public.event_status;
begin
  if normalized_title is null or char_length(normalized_title) not between 1 and 120 then
    raise exception 'Event title must contain between 1 and 120 characters' using errcode = '22023';
  end if;
  if p_starts_at is null or p_ends_at is null or p_ends_at <= p_starts_at then
    raise exception 'Event end must be after its start' using errcode = '22023';
  end if;

  initial_status := case when p_visibility = 'full' then 'proposed' else 'confirmed' end;

  insert into public.calendar_events (
    space_id, owner_id, title, description, location, starts_at, ends_at, visibility, status
  ) values (
    current_space_id, current_user_id, normalized_title,
    nullif(btrim(p_description), ''), nullif(btrim(p_location), ''),
    p_starts_at, p_ends_at, p_visibility, initial_status
  ) returning id into created_event_id;

  if p_visibility = 'full' then
    insert into public.event_responses (event_id, user_id, response, responded_at)
    select
      created_event_id,
      member.user_id,
      case when member.user_id = current_user_id then 'accepted'::public.event_response_status
           else 'pending'::public.event_response_status end,
      case when member.user_id = current_user_id then now() else null end
    from public.space_members as member
    where member.space_id = current_space_id and member.status = 'active';
  end if;

  insert into public.audit_logs (
    space_id, actor_user_id, action, entity_type, entity_id, new_data
  ) values (
    current_space_id, current_user_id, 'calendar_event.created', 'calendar_event', created_event_id,
    jsonb_build_object('title', normalized_title, 'starts_at', p_starts_at, 'ends_at', p_ends_at,
      'visibility', p_visibility, 'status', initial_status)
  );

  return created_event_id;
end;
$$;

create or replace function public.respond_calendar_event(
  p_event_id uuid,
  p_response public.event_response_status,
  p_note text default null
)
returns public.event_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_space_id uuid := private.current_space_id();
  selected_event public.calendar_events%rowtype;
  resulting_status public.event_status;
begin
  if p_response = 'pending' then
    raise exception 'Choose accepted, declined or maybe' using errcode = '22023';
  end if;

  select event.* into selected_event
  from public.calendar_events as event
  where event.id = p_event_id and event.space_id = current_space_id
  for update;

  if not found or selected_event.status = 'cancelled' or selected_event.visibility <> 'full' then
    raise exception 'Shared event not found' using errcode = 'P0001';
  end if;

  insert into public.event_responses (event_id, user_id, response, note, responded_at)
  values (p_event_id, current_user_id, p_response, nullif(btrim(p_note), ''), now())
  on conflict (event_id, user_id) do update
  set response = excluded.response, note = excluded.note, responded_at = excluded.responded_at;

  if not exists (
    select 1
    from public.space_members as member
    left join public.event_responses as answer
      on answer.event_id = p_event_id and answer.user_id = member.user_id
    where member.space_id = current_space_id
      and member.status = 'active'
      and coalesce(answer.response, 'pending'::public.event_response_status) <> 'accepted'
  ) then
    resulting_status := 'confirmed';
  else
    resulting_status := 'proposed';
  end if;

  update public.calendar_events
  set status = resulting_status, version = version + 1
  where id = p_event_id;

  insert into public.audit_logs (
    space_id, actor_user_id, action, entity_type, entity_id, new_data
  ) values (
    current_space_id, current_user_id, 'calendar_event.responded', 'calendar_event', p_event_id,
    jsonb_build_object('response', p_response, 'status', resulting_status)
  );

  return resulting_status;
end;
$$;

create or replace function public.cancel_calendar_event(
  p_event_id uuid,
  p_expected_version integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_space_id uuid := private.current_space_id();
begin
  update public.calendar_events
  set status = 'cancelled', version = version + 1
  where id = p_event_id
    and space_id = current_space_id
    and owner_id = current_user_id
    and version = p_expected_version
    and status <> 'cancelled';

  if not found then
    raise exception 'Event changed or cannot be cancelled' using errcode = '40001';
  end if;

  insert into public.audit_logs (space_id, actor_user_id, action, entity_type, entity_id)
  values (current_space_id, current_user_id, 'calendar_event.cancelled', 'calendar_event', p_event_id);

  return true;
end;
$$;

create or replace function public.list_shared_items()
returns table (
  item_id uuid,
  list_kind public.shared_list_kind,
  item_title text,
  item_notes text,
  quantity text,
  assigned_to uuid,
  assigned_name text,
  due_at timestamptz,
  recurrence public.shared_recurrence,
  status public.shared_item_status,
  version integer,
  created_by uuid,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  current_space_id uuid := private.current_space_id();
begin
  return query
  select
    item.id,
    list.kind,
    item.title,
    item.notes,
    item.quantity,
    item.assigned_to,
    assignee.display_name,
    item.due_at,
    item.recurrence,
    item.status,
    item.version,
    item.created_by,
    item.updated_at
  from public.shared_items as item
  join public.shared_lists as list on list.id = item.list_id
  left join public.profiles as assignee on assignee.id = item.assigned_to
  where item.space_id = current_space_id
  order by (item.status = 'completed') asc, item.updated_at desc;
end;
$$;

create or replace function public.create_shared_item(
  p_kind public.shared_list_kind,
  p_title text,
  p_notes text,
  p_quantity text,
  p_assigned_to uuid,
  p_due_at timestamptz,
  p_recurrence public.shared_recurrence
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_space_id uuid := private.current_space_id();
  selected_list_id uuid;
  created_item_id uuid;
  normalized_title text := btrim(p_title);
begin
  if normalized_title is null or char_length(normalized_title) not between 1 and 160 then
    raise exception 'Item title must contain between 1 and 160 characters' using errcode = '22023';
  end if;

  if p_assigned_to is not null and not exists (
    select 1 from public.space_members
    where space_id = current_space_id and user_id = p_assigned_to and status = 'active'
  ) then
    raise exception 'Assignee must be an active member of this space' using errcode = '22023';
  end if;

  perform private.ensure_default_shared_lists(current_space_id, current_user_id);
  select id into selected_list_id
  from public.shared_lists
  where space_id = current_space_id and kind = p_kind;

  insert into public.shared_items (
    space_id, list_id, title, notes, quantity, assigned_to, due_at, recurrence, created_by
  ) values (
    current_space_id, selected_list_id, normalized_title,
    nullif(btrim(p_notes), ''), nullif(btrim(p_quantity), ''),
    p_assigned_to, p_due_at, p_recurrence, current_user_id
  ) returning id into created_item_id;

  insert into public.audit_logs (
    space_id, actor_user_id, action, entity_type, entity_id, new_data
  ) values (
    current_space_id, current_user_id, 'shared_item.created', 'shared_item', created_item_id,
    jsonb_build_object('kind', p_kind, 'title', normalized_title)
  );

  return created_item_id;
end;
$$;

create or replace function public.toggle_shared_item(
  p_item_id uuid,
  p_expected_version integer,
  p_completed boolean
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_space_id uuid := private.current_space_id();
  resulting_version integer;
begin
  update public.shared_items
  set
    status = case when p_completed then 'completed'::public.shared_item_status else 'open'::public.shared_item_status end,
    completed_by = case when p_completed then current_user_id else null end,
    completed_at = case when p_completed then now() else null end,
    version = version + 1
  where id = p_item_id
    and space_id = current_space_id
    and version = p_expected_version
  returning version into resulting_version;

  if resulting_version is null then
    raise exception 'Item changed on another device; reload and try again' using errcode = '40001';
  end if;

  insert into public.audit_logs (
    space_id, actor_user_id, action, entity_type, entity_id, new_data
  ) values (
    current_space_id, current_user_id, 'shared_item.toggled', 'shared_item', p_item_id,
    jsonb_build_object('completed', p_completed, 'version', resulting_version)
  );

  return resulting_version;
end;
$$;

create or replace function public.delete_shared_item(
  p_item_id uuid,
  p_expected_version integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_space_id uuid := private.current_space_id();
  deleted_item jsonb;
begin
  delete from public.shared_items
  where id = p_item_id
    and space_id = current_space_id
    and version = p_expected_version
  returning jsonb_build_object(
    'id', id,
    'title', title,
    'status', status,
    'version', version
  ) into deleted_item;

  if deleted_item is null then
    raise exception 'Item changed on another device; reload and try again' using errcode = '40001';
  end if;

  insert into public.audit_logs (
    space_id, actor_user_id, action, entity_type, entity_id, old_data
  ) values (
    current_space_id, current_user_id, 'shared_item.deleted', 'shared_item', p_item_id, deleted_item
  );

  return true;
end;
$$;

insert into public.shared_lists (space_id, name, kind, created_by)
select space.id, defaults.name, defaults.kind::public.shared_list_kind, space.created_by
from public.spaces as space
cross join (values ('Tarefas', 'tasks'), ('Compras', 'shopping')) as defaults(name, kind)
where space.status = 'active'
on conflict (space_id, kind) do nothing;

alter table public.calendar_events enable row level security;
alter table public.event_responses enable row level security;
alter table public.shared_lists enable row level security;
alter table public.shared_items enable row level security;

create policy calendar_events_deny_direct_access
on public.calendar_events for all to authenticated using (false) with check (false);
create policy event_responses_deny_direct_access
on public.event_responses for all to authenticated using (false) with check (false);
create policy shared_lists_deny_direct_access
on public.shared_lists for all to authenticated using (false) with check (false);
create policy shared_items_deny_direct_access
on public.shared_items for all to authenticated using (false) with check (false);

revoke all on table public.calendar_events from anon, authenticated;
revoke all on table public.event_responses from anon, authenticated;
revoke all on table public.shared_lists from anon, authenticated;
revoke all on table public.shared_items from anon, authenticated;

revoke all on function public.create_space(text) from public, anon, authenticated;
revoke all on function public.create_space_invitation(text) from public, anon, authenticated;
revoke all on function public.cancel_space_invitation() from public, anon, authenticated;
revoke all on function public.join_space_by_code(text) from public, anon, authenticated;
revoke all on function public.list_calendar_events(timestamptz, timestamptz) from public, anon, authenticated;
revoke all on function public.create_calendar_event(text, text, text, timestamptz, timestamptz, public.event_visibility) from public, anon, authenticated;
revoke all on function public.respond_calendar_event(uuid, public.event_response_status, text) from public, anon, authenticated;
revoke all on function public.cancel_calendar_event(uuid, integer) from public, anon, authenticated;
revoke all on function public.list_shared_items() from public, anon, authenticated;
revoke all on function public.create_shared_item(public.shared_list_kind, text, text, text, uuid, timestamptz, public.shared_recurrence) from public, anon, authenticated;
revoke all on function public.toggle_shared_item(uuid, integer, boolean) from public, anon, authenticated;
revoke all on function public.delete_shared_item(uuid, integer) from public, anon, authenticated;

grant execute on function public.create_space(text) to authenticated;
grant execute on function public.create_space_invitation(text) to authenticated;
grant execute on function public.cancel_space_invitation() to authenticated;
grant execute on function public.join_space_by_code(text) to authenticated;
grant execute on function public.list_calendar_events(timestamptz, timestamptz) to authenticated;
grant execute on function public.create_calendar_event(text, text, text, timestamptz, timestamptz, public.event_visibility) to authenticated;
grant execute on function public.respond_calendar_event(uuid, public.event_response_status, text) to authenticated;
grant execute on function public.cancel_calendar_event(uuid, integer) to authenticated;
grant execute on function public.list_shared_items() to authenticated;
grant execute on function public.create_shared_item(public.shared_list_kind, text, text, text, uuid, timestamptz, public.shared_recurrence) to authenticated;
grant execute on function public.toggle_shared_item(uuid, integer, boolean) to authenticated;
grant execute on function public.delete_shared_item(uuid, integer) to authenticated;

commit;
