-- Schema for Family Credit Card Hub.
-- Run in the Supabase SQL editor once (Project → SQL → New query).

create extension if not exists "pgcrypto";

create table if not exists families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists family_members (
  family_id uuid not null references families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text,
  joined_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

create table if not exists family_state (
  family_id uuid primary key references families(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table families        enable row level security;
alter table family_members  enable row level security;
alter table family_state    enable row level security;

drop policy if exists "members read family"        on families;
drop policy if exists "members read membership"    on family_members;
drop policy if exists "self can insert membership" on family_members;
drop policy if exists "members read state"         on family_state;
drop policy if exists "members write state"        on family_state;
drop policy if exists "members upsert state"       on family_state;

create policy "members read family" on families
  for select using (
    id in (select family_id from family_members where user_id = auth.uid())
  );

create policy "members read membership" on family_members
  for select using (
    family_id in (select family_id from family_members where user_id = auth.uid())
  );

create policy "self can insert membership" on family_members
  for insert with check (user_id = auth.uid());

create policy "members read state" on family_state
  for select using (
    family_id in (select family_id from family_members where user_id = auth.uid())
  );

create policy "members upsert state" on family_state
  for insert with check (
    family_id in (select family_id from family_members where user_id = auth.uid())
  );

create policy "members write state" on family_state
  for update using (
    family_id in (select family_id from family_members where user_id = auth.uid())
  ) with check (
    family_id in (select family_id from family_members where user_id = auth.uid())
  );

-- Create a new family and add the calling user as a member.
create or replace function create_family(family_name text, member_display_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_family_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  insert into families (name) values (family_name) returning id into new_family_id;
  insert into family_members (family_id, user_id, display_name)
    values (new_family_id, auth.uid(), member_display_name);
  insert into family_state (family_id, state) values (new_family_id, '{}'::jsonb);
  return new_family_id;
end;
$$;

-- Join an existing family by its UUID (shared as an invite code).
create or replace function join_family(family_uuid uuid, member_display_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if not exists (select 1 from families where id = family_uuid) then
    raise exception 'Family not found';
  end if;
  insert into family_members (family_id, user_id, display_name)
    values (family_uuid, auth.uid(), member_display_name)
    on conflict do nothing;
  return family_uuid;
end;
$$;

-- Make sure realtime is enabled for the state table.
alter publication supabase_realtime add table family_state;
