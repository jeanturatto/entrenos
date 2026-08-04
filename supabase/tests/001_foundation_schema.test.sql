begin;

create extension if not exists pgtap with schema extensions;

select plan(16);

select has_table('public', 'profiles', 'profiles existe');
select has_table('public', 'spaces', 'spaces existe');
select has_table('public', 'space_members', 'space_members existe');
select has_table('public', 'space_invitations', 'space_invitations existe');
select has_table('public', 'consent_records', 'consent_records existe');
select has_table('public', 'audit_logs', 'audit_logs existe');

select ok(
  (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass),
  'profiles está com RLS habilitado'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.spaces'::regclass),
  'spaces está com RLS habilitado'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.space_members'::regclass),
  'space_members está com RLS habilitado'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.space_invitations'::regclass),
  'space_invitations está com RLS habilitado'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.consent_records'::regclass),
  'consent_records está com RLS habilitado'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.audit_logs'::regclass),
  'audit_logs está com RLS habilitado'
);

select has_function('public', 'create_space', array['text'], 'create_space existe');
select has_function('public', 'handle_new_user', array[]::text[], 'handle_new_user existe');

select is(
  (select count(*)::integer from pg_policies where schemaname = 'public' and tablename = 'profiles'),
  2,
  'profiles possui duas políticas explícitas'
);

select is(
  (
    select count(*)::integer
    from pg_policies
    where schemaname = 'public'
      and tablename in ('audit_logs', 'space_invitations')
      and policyname in (
        'audit_logs_deny_direct_access',
        'space_invitations_deny_direct_access'
      )
  ),
  2,
  'tabelas internas possuem políticas explícitas de negação'
);

select is(
  has_table_privilege('anon', 'public.audit_logs', 'select'),
  false,
  'anon não pode consultar o log de auditoria'
);

select * from finish();
rollback;
