begin;

create index shared_lists_created_by_idx on public.shared_lists (created_by);
create index shared_items_created_by_idx on public.shared_items (created_by);
create index shared_items_completed_by_idx
  on public.shared_items (completed_by)
  where completed_by is not null;

commit;
