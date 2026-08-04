begin;

-- A ausência de policy já nega o acesso, mas políticas explícitas documentam e
-- preservam a intenção caso privilégios de tabela sejam alterados no futuro.
create policy audit_logs_deny_direct_access
on public.audit_logs
for all
to authenticated
using (false)
with check (false);

create policy space_invitations_deny_direct_access
on public.space_invitations
for all
to authenticated
using (false)
with check (false);

create index audit_logs_actor_user_id_idx
  on public.audit_logs (actor_user_id);

create index consent_records_space_id_idx
  on public.consent_records (space_id);

create index space_invitations_accepted_by_idx
  on public.space_invitations (accepted_by)
  where accepted_by is not null;

create index space_invitations_invited_by_idx
  on public.space_invitations (invited_by);

create index spaces_created_by_idx
  on public.spaces (created_by);

commit;
