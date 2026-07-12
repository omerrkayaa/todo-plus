-- ToDo+ Gorev Takip Sistemi
-- Supabase / PostgreSQL veritabani semasi

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name varchar(120) not null,
  email varchar(160) not null unique,
  role varchar(20) not null default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone not null default now()
);

-- Daha eski kurulumlar icin rol kolonunu guvenli bicimde ekler.
alter table public.users add column if not exists role varchar(20) not null default 'user';
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_role_check'
  ) then
    alter table public.users add constraint users_role_check check (role in ('user', 'admin'));
  end if;
end $$;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  category_id uuid,
  name varchar(120) not null,
  description text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.projects add column if not exists category_id uuid;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name varchar(80) not null,
  color varchar(20) not null default '#2563eb',
  created_at timestamp with time zone not null default now()
);

alter table public.projects drop constraint if exists projects_category_id_fkey;
alter table public.projects add constraint projects_category_id_fkey
  foreign key (category_id) references public.categories(id) on delete restrict;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  created_by uuid not null references public.users(id) on delete cascade,
  title varchar(160) not null,
  description text,
  priority varchar(20) not null default 'orta',
  status varchar(30) not null default 'bekliyor',
  estimated_minutes integer not null default 60,
  due_date date,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint tasks_priority_check check (priority in ('dusuk', 'orta', 'yuksek')),
  constraint tasks_status_check check (status in ('bekliyor', 'devam_ediyor', 'tamamlandi')),
  constraint tasks_estimated_minutes_check check (estimated_minutes > 0)
);

create table if not exists public.task_assignments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  is_completed boolean not null default false,
  completed_at timestamp with time zone,
  earned_score integer not null default 0,
  assigned_at timestamp with time zone not null default now(),
  unique (task_id, user_id)
);

create table if not exists public.task_givers (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  assigned_at timestamp with time zone not null default now(),
  unique (task_id, user_id)
);

create table if not exists public.task_history (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  changed_by uuid not null references public.users(id) on delete cascade,
  old_status varchar(30),
  new_status varchar(30) not null,
  note text,
  changed_at timestamp with time zone not null default now(),
  constraint task_history_old_status_check check (
    old_status is null or old_status in ('bekliyor', 'devam_ediyor', 'tamamlandi')
  ),
  constraint task_history_new_status_check check (
    new_status in ('bekliyor', 'devam_ediyor', 'tamamlandi')
  )
);

create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  body text not null,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  member_role varchar(20) not null default 'member' check (member_role in ('manager', 'member')),
  joined_at timestamp with time zone not null default now(),
  unique (project_id, user_id)
);

create table if not exists public.project_invitations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  email varchar(160) not null,
  member_role varchar(20) not null default 'member' check (member_role in ('manager', 'member')),
  invited_by uuid not null references public.users(id) on delete cascade,
  status varchar(20) not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  created_at timestamp with time zone not null default now(),
  responded_at timestamp with time zone,
  unique (project_id, email)
);

create index if not exists idx_projects_user_id on public.projects(user_id);
create index if not exists idx_categories_user_id on public.categories(user_id);
create index if not exists idx_projects_category_id on public.projects(category_id);
create index if not exists idx_tasks_project_id on public.tasks(project_id);
create index if not exists idx_tasks_category_id on public.tasks(category_id);
create index if not exists idx_tasks_created_by on public.tasks(created_by);
create index if not exists idx_task_assignments_task_id on public.task_assignments(task_id);
create index if not exists idx_task_assignments_user_id on public.task_assignments(user_id);
create index if not exists idx_task_givers_task_id on public.task_givers(task_id);
create index if not exists idx_task_givers_user_id on public.task_givers(user_id);
create index if not exists idx_task_history_task_id on public.task_history(task_id);
create index if not exists idx_task_comments_task_id on public.task_comments(task_id);
create index if not exists idx_task_comments_user_id on public.task_comments(user_id);
create index if not exists idx_project_members_project_id on public.project_members(project_id);
create index if not exists idx_project_members_user_id on public.project_members(user_id);
create index if not exists idx_project_invitations_email on public.project_invitations(lower(email));

-- Gorev onceligine gore puan hesaplama.
create or replace function public.priority_score(task_priority varchar)
returns integer
language sql
immutable
as $$
  select case task_priority
    when 'yuksek' then 3
    when 'orta' then 2
    else 1
  end;
$$;

-- Kullanici bazli agirlikli basari oranini hesaplayan view.
create or replace view public.user_success_stats
with (security_invoker = true) as
select
  u.id as user_id,
  u.full_name,
  count(ta.id) as assigned_task_count,
  count(ta.id) filter (where ta.is_completed = true) as completed_task_count,
  coalesce(sum(public.priority_score(t.priority)), 0) as total_score,
  coalesce(sum(public.priority_score(t.priority)) filter (where ta.is_completed = true), 0) as completed_score,
  case
    when coalesce(sum(public.priority_score(t.priority)), 0) = 0 then 0
    else round(
      (
        coalesce(sum(public.priority_score(t.priority)) filter (where ta.is_completed = true), 0)::numeric
        / sum(public.priority_score(t.priority))::numeric
      ) * 100,
      2
    )
  end as success_rate
from public.users u
left join public.task_assignments ta on ta.user_id = u.id
left join public.tasks t on t.id = ta.task_id
group by u.id, u.full_name;

-- Goreve erisim yetkisini merkezi olarak kontrol eder.
create or replace function public.is_admin(user_uuid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = user_uuid and role = 'admin'
  );
$$;

create or replace function public.can_access_task(task_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
  or exists (
    select 1 from public.tasks t
    where t.id = task_uuid
    and t.created_by = auth.uid()
  )
  or exists (
    select 1 from public.task_assignments ta
    where ta.task_id = task_uuid
    and ta.user_id = auth.uid()
  )
  or exists (
    select 1 from public.task_givers tg
    where tg.task_id = task_uuid
    and tg.user_id = auth.uid()
  );
$$;

create or replace function public.ensure_task_category_matches_project()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.category_id is not null and not exists (
    select 1 from public.projects p
    where p.id = new.project_id and p.category_id = new.category_id
  ) then
    raise exception 'Kategori gorevin projesine bagli olmalidir.';
  end if;
  return new;
end;
$$;

drop trigger if exists ensure_task_category_matches_project_trigger on public.tasks;
create trigger ensure_task_category_matches_project_trigger
before insert or update of project_id, category_id on public.tasks
for each row execute function public.ensure_task_category_matches_project();

-- Profil ve e-posta bilgisini yalnizca ayni gorev uzerinden iliskili kisilere acar.
create or replace function public.can_view_user_profile(target_user_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() = target_user_uuid
  or public.is_admin()
  or exists (
    select 1
    from public.tasks t
    left join public.task_assignments ta on ta.task_id = t.id
    left join public.task_givers tg on tg.task_id = t.id
    where (t.created_by = target_user_uuid or ta.user_id = target_user_uuid or tg.user_id = target_user_uuid)
      and (
        t.created_by = auth.uid()
        or exists (select 1 from public.task_assignments own_ta where own_ta.task_id = t.id and own_ta.user_id = auth.uid())
        or exists (select 1 from public.task_givers own_tg where own_tg.task_id = t.id and own_tg.user_id = auth.uid())
      )
  );
$$;

-- Normal kullanicinin kendisini yonetici yapmasini engeller.
create or replace function public.protect_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
    and not public.is_admin(auth.uid())
    and coalesce(auth.role(), '') <> 'service_role'
    and session_user not in ('postgres', 'supabase_admin') then
    raise exception 'Rol degistirme islemi yalnizca yoneticilere aciktir.';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_user_role_trigger on public.users;
create trigger protect_user_role_trigger
before update on public.users
for each row execute function public.protect_user_role();

-- Calisan yalnizca kendisine atanan gorevin durumunu degistirebilir.
create or replace function public.protect_task_management_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin(auth.uid())
    or coalesce(auth.role(), '') = 'service_role'
    or session_user in ('postgres', 'supabase_admin') then return new; end if;

  if not exists (
    select 1 from public.task_assignments
    where task_id = old.id and user_id = auth.uid()
  ) then
    raise exception 'Bu gorev kullaniciya atanmamistir.';
  end if;

  if new.project_id is distinct from old.project_id
    or new.category_id is distinct from old.category_id
    or new.created_by is distinct from old.created_by
    or new.title is distinct from old.title
    or new.description is distinct from old.description
    or new.priority is distinct from old.priority
    or new.estimated_minutes is distinct from old.estimated_minutes
    or new.due_date is distinct from old.due_date
    or new.created_at is distinct from old.created_at then
    raise exception 'Calisan yalnizca gorev durumunu degistirebilir.';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_task_management_fields_trigger on public.tasks;
create trigger protect_task_management_fields_trigger
before update on public.tasks
for each row execute function public.protect_task_management_fields();

create or replace function public.protect_assignment_management_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin(auth.uid())
    or coalesce(auth.role(), '') = 'service_role'
    or session_user in ('postgres', 'supabase_admin') then return new; end if;

  if old.user_id <> auth.uid()
    or new.id is distinct from old.id
    or new.task_id is distinct from old.task_id
    or new.user_id is distinct from old.user_id
    or new.assigned_at is distinct from old.assigned_at then
    raise exception 'Calisan gorev atamasini degistiremez.';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_assignment_management_fields_trigger on public.task_assignments;
create trigger protect_assignment_management_fields_trigger
before update on public.task_assignments
for each row execute function public.protect_assignment_management_fields();

-- Supabase Row Level Security temel ayarlari.
alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.categories enable row level security;
alter table public.tasks enable row level security;
alter table public.task_assignments enable row level security;
alter table public.task_givers enable row level security;
alter table public.task_history enable row level security;
alter table public.task_comments enable row level security;
alter table public.project_members enable row level security;
alter table public.project_invitations enable row level security;

drop policy if exists "users_select_authenticated" on public.users;
drop policy if exists "users_select_related" on public.users;
drop policy if exists "users_insert_own" on public.users;
drop policy if exists "users_update_own" on public.users;
drop policy if exists "projects_owner_all" on public.projects;
drop policy if exists "projects_related_select" on public.projects;
drop policy if exists "categories_owner_all" on public.categories;
drop policy if exists "categories_related_select" on public.categories;
drop policy if exists "tasks_creator_all" on public.tasks;
drop policy if exists "tasks_related_select" on public.tasks;
drop policy if exists "tasks_related_update" on public.tasks;
drop policy if exists "task_assignments_related_select" on public.task_assignments;
drop policy if exists "task_assignments_owner_insert" on public.task_assignments;
drop policy if exists "task_assignments_owner_update" on public.task_assignments;
drop policy if exists "task_givers_related_select" on public.task_givers;
drop policy if exists "task_givers_owner_insert" on public.task_givers;
drop policy if exists "task_givers_owner_update" on public.task_givers;
drop policy if exists "task_givers_related_delete" on public.task_givers;
drop policy if exists "task_history_actor_select" on public.task_history;
drop policy if exists "task_history_actor_insert" on public.task_history;
drop policy if exists "task_comments_related_select" on public.task_comments;
drop policy if exists "task_comments_related_insert" on public.task_comments;
drop policy if exists "project_members_select" on public.project_members;
drop policy if exists "project_members_manage" on public.project_members;
drop policy if exists "project_invitations_select" on public.project_invitations;
drop policy if exists "project_invitations_manage" on public.project_invitations;
drop policy if exists "project_invitations_respond" on public.project_invitations;

create policy "project_members_select" on public.project_members
  for select using (public.is_admin() or auth.uid() = user_id);

create policy "project_members_manage" on public.project_members
  for all using (public.is_admin())
  with check (public.is_admin());

create policy "project_invitations_select" on public.project_invitations
  for select using (
    public.is_admin()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

create policy "project_invitations_manage" on public.project_invitations
  for all using (public.is_admin())
  with check (public.is_admin() and auth.uid() = invited_by);

create policy "project_invitations_respond" on public.project_invitations
  for update using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  with check (
    lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    and status in ('accepted', 'declined')
  );

create policy "users_select_related" on public.users
  for select using (public.can_view_user_profile(id));

create policy "users_insert_own" on public.users
  for insert with check (auth.uid() = id and role = 'user');

create policy "users_update_own" on public.users
  for update using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

create policy "projects_owner_all" on public.projects
  for all using (public.is_admin())
  with check (public.is_admin());

create policy "projects_related_select" on public.projects
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.tasks
      where tasks.project_id = projects.id
      and public.can_access_task(tasks.id)
    )
  );

create policy "categories_owner_all" on public.categories
  for all using (public.is_admin())
  with check (public.is_admin());

create policy "categories_related_select" on public.categories
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.tasks
      where tasks.category_id = categories.id
      and public.can_access_task(tasks.id)
    )
  );

create policy "tasks_creator_all" on public.tasks
  for all using (public.is_admin())
  with check (public.is_admin() and auth.uid() = created_by);

create policy "tasks_related_select" on public.tasks
  for select using (public.can_access_task(id));

create policy "tasks_related_update" on public.tasks
  for update using (public.can_access_task(id))
  with check (public.can_access_task(id));

create policy "task_assignments_related_select" on public.task_assignments
  for select using (public.can_access_task(task_id));

create policy "task_assignments_owner_insert" on public.task_assignments
  for insert with check (public.is_admin());

create policy "task_assignments_owner_update" on public.task_assignments
  for update using (public.is_admin() or auth.uid() = user_id)
  with check (public.is_admin() or auth.uid() = user_id);

create policy "task_givers_related_select" on public.task_givers
  for select using (public.can_access_task(task_id));

create policy "task_givers_owner_insert" on public.task_givers
  for insert with check (public.is_admin());

create policy "task_givers_owner_update" on public.task_givers
  for update using (public.is_admin())
  with check (public.is_admin());

create policy "task_givers_related_delete" on public.task_givers
  for delete using (public.is_admin());

create policy "task_history_actor_select" on public.task_history
  for select using (auth.uid() = changed_by or public.can_access_task(task_id));

create policy "task_history_actor_insert" on public.task_history
  for insert with check (auth.uid() = changed_by and public.can_access_task(task_id));

create policy "task_comments_related_select" on public.task_comments
  for select using (auth.uid() = user_id or public.can_access_task(task_id));

create policy "task_comments_related_insert" on public.task_comments
  for insert with check (
    auth.uid() = user_id
    and public.can_access_task(task_id)
  );

-- Canli ekran guncellemeleri icin gerekli tablolar Realtime yayınına eklenir.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'projects', 'categories', 'tasks', 'task_assignments', 'task_givers',
    'task_history', 'task_comments', 'project_members', 'project_invitations'
  ] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = table_name
    ) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end $$;
