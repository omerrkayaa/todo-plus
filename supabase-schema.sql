-- ToDo+ Gorev Takip Sistemi
-- Supabase / PostgreSQL veritabani semasi

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name varchar(120) not null,
  email varchar(160) not null unique,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name varchar(120) not null,
  description text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name varchar(80) not null,
  color varchar(20) not null default '#2563eb',
  created_at timestamp with time zone not null default now()
);

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

create index if not exists idx_projects_user_id on public.projects(user_id);
create index if not exists idx_categories_user_id on public.categories(user_id);
create index if not exists idx_tasks_project_id on public.tasks(project_id);
create index if not exists idx_tasks_category_id on public.tasks(category_id);
create index if not exists idx_tasks_created_by on public.tasks(created_by);
create index if not exists idx_task_assignments_task_id on public.task_assignments(task_id);
create index if not exists idx_task_assignments_user_id on public.task_assignments(user_id);
create index if not exists idx_task_givers_task_id on public.task_givers(task_id);
create index if not exists idx_task_givers_user_id on public.task_givers(user_id);
create index if not exists idx_task_history_task_id on public.task_history(task_id);

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
create or replace view public.user_success_stats as
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

-- Supabase Row Level Security temel ayarlari.
alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.categories enable row level security;
alter table public.tasks enable row level security;
alter table public.task_assignments enable row level security;
alter table public.task_givers enable row level security;
alter table public.task_history enable row level security;

create policy "users_select_authenticated" on public.users
  for select using (auth.uid() is not null);

create policy "users_insert_own" on public.users
  for insert with check (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

create policy "projects_owner_all" on public.projects
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "categories_owner_all" on public.categories
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "tasks_creator_all" on public.tasks
  for all using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

create policy "task_assignments_related_select" on public.task_assignments
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.tasks
      where tasks.id = task_assignments.task_id
      and tasks.created_by = auth.uid()
    )
  );

create policy "task_assignments_owner_insert" on public.task_assignments
  for insert with check (
    auth.uid() = user_id
    or exists (
      select 1 from public.tasks
      where tasks.id = task_assignments.task_id
      and tasks.created_by = auth.uid()
    )
  );

create policy "task_assignments_owner_update" on public.task_assignments
  for update using (
    auth.uid() = user_id
    or exists (
      select 1 from public.tasks
      where tasks.id = task_assignments.task_id
      and tasks.created_by = auth.uid()
    )
  );

create policy "task_givers_related_select" on public.task_givers
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.tasks
      where tasks.id = task_givers.task_id
      and tasks.created_by = auth.uid()
    )
  );

create policy "task_givers_owner_insert" on public.task_givers
  for insert with check (
    auth.uid() = user_id
    or exists (
      select 1 from public.tasks
      where tasks.id = task_givers.task_id
      and tasks.created_by = auth.uid()
    )
  );

create policy "task_givers_owner_update" on public.task_givers
  for update using (
    auth.uid() = user_id
    or exists (
      select 1 from public.tasks
      where tasks.id = task_givers.task_id
      and tasks.created_by = auth.uid()
    )
  );

create policy "task_history_actor_select" on public.task_history
  for select using (auth.uid() = changed_by);

create policy "task_history_actor_insert" on public.task_history
  for insert with check (auth.uid() = changed_by);
