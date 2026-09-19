-- Phase 1: core schema, roles, and Row Level Security.
-- Run this in Supabase SQL Editor (or via `supabase db push`) once the project exists.

-- ============================================================
-- ENUMS
-- ============================================================
create type user_role as enum ('admin', 'trainer', 'client');
create type checkin_workout_status as enum ('completed', 'skipped');
create type checkin_diet_status as enum ('followed', 'partial', 'not_followed');
create type checkin_energy as enum ('low', 'normal', 'good');
create type session_status as enum ('scheduled', 'completed', 'cancelled', 'no_show');
create type fitness_goal as enum ('fat_loss', 'muscle_gain', 'maintenance', 'general_fitness');
create type activity_level as enum ('sedentary', 'light', 'moderate', 'active', 'very_active');
create type sex as enum ('male', 'female');

-- ============================================================
-- CORE IDENTITY
-- ============================================================

-- One row per auth.users id. Role lives here, set only by trusted
-- server code (never writable by the user themselves after signup).
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null,
  full_name text not null,
  email text not null,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Role-specific extension tables keep role-only fields out of `profiles`.
create table trainers (
  id uuid primary key references profiles(id) on delete cascade,
  bio text,
  specialties text[]
);

create table clients (
  id uuid primary key references profiles(id) on delete cascade,
  date_of_birth date,
  sex sex,
  height_cm numeric,
  goal fitness_goal,
  activity_level activity_level,
  starting_weight_kg numeric,
  created_by uuid references profiles(id)
);

-- History of which trainer is assigned to which client. Append-only:
-- reassigning closes the current row (sets ended_at) and inserts a
-- new one. Nothing is ever deleted, so history survives reassignment.
create table trainer_client_assignments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  trainer_id uuid not null references trainers(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  ended_at timestamptz,
  assigned_by uuid not null references profiles(id)
);

-- Only one active (ended_at is null) assignment per client at a time.
create unique index one_active_assignment_per_client
  on trainer_client_assignments (client_id)
  where ended_at is null;

-- ============================================================
-- WORKOUTS
-- ============================================================

create table workout_plans (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  trainer_id uuid not null references trainers(id),
  title text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table workout_days (
  id uuid primary key default gen_random_uuid(),
  workout_plan_id uuid not null references workout_plans(id) on delete cascade,
  title text not null, -- e.g. "Push Day"
  day_order int not null default 0
);

create table workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_day_id uuid not null references workout_days(id) on delete cascade,
  name text not null,
  target_sets int not null,
  target_reps text not null, -- e.g. "8-10" (kept as text to allow ranges)
  target_weight_kg numeric,
  exercise_order int not null default 0
);

-- One row per time the client performs a given exercise (a "session log").
create table workout_logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  workout_exercise_id uuid not null references workout_exercises(id),
  logged_at timestamptz not null default now()
);

create table workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_log_id uuid not null references workout_logs(id) on delete cascade,
  set_number int not null,
  weight_kg numeric not null,
  reps int not null
);

-- Derived/cached PRs so the client UI doesn't need to recompute on every load.
create table personal_records (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  workout_exercise_id uuid not null references workout_exercises(id),
  workout_set_id uuid not null references workout_sets(id),
  estimated_one_rm numeric not null,
  achieved_at timestamptz not null default now()
);

-- ============================================================
-- DIET
-- ============================================================

create table diet_plans (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  trainer_id uuid not null references trainers(id),
  title text not null,
  pdf_storage_path text, -- Level 1: PDF upload is acceptable
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table diet_meals (
  id uuid primary key default gen_random_uuid(),
  diet_plan_id uuid not null references diet_plans(id) on delete cascade,
  name text not null, -- e.g. "Breakfast"
  time_of_day time
);

create table diet_items (
  id uuid primary key default gen_random_uuid(),
  diet_meal_id uuid not null references diet_meals(id) on delete cascade,
  food text not null,
  quantity text not null,
  calories numeric,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric
);

-- ============================================================
-- PROGRESS & ACTIVITY
-- ============================================================

create table measurements (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  recorded_at timestamptz not null default now(),
  weight_kg numeric,
  waist_cm numeric,
  chest_cm numeric,
  arm_cm numeric,
  thigh_cm numeric
);

create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  recorded_at timestamptz not null default now(),
  walking_km numeric,
  running_km numeric,
  steps int,
  is_active_day boolean not null default true
);

create table daily_checkins (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  checkin_date date not null default current_date,
  workout_status checkin_workout_status,
  diet_status checkin_diet_status,
  steps int,
  sleep_hours numeric,
  energy checkin_energy,
  notes text,
  created_at timestamptz not null default now(),
  unique (client_id, checkin_date)
);

-- ============================================================
-- SESSIONS, MESSAGING, NOTIFICATIONS, AUDIT
-- ============================================================

create table sessions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  trainer_id uuid not null references trainers(id),
  title text not null,
  scheduled_at timestamptz not null,
  status session_status not null default 'scheduled',
  meet_link text, -- manual Google Meet link for Level 1
  notes text
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  trainer_id uuid not null references trainers(id),
  sender_id uuid not null references profiles(id),
  body text,
  created_at timestamptz not null default now()
);

create table message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references messages(id) on delete cascade,
  storage_path text not null,
  file_type text
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  action text not null,
  target_table text,
  target_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- HELPER FUNCTIONS (used by RLS policies)
-- ============================================================

create or replace function current_role_is(r user_role)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = r and is_active = true
  );
$$;

-- Is the given client currently assigned to the calling trainer?
create or replace function is_assigned_trainer(p_client_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from trainer_client_assignments
    where client_id = p_client_id
      and trainer_id = auth.uid()
      and ended_at is null
  );
$$;

-- ============================================================
-- ENABLE RLS
-- ============================================================

alter table profiles enable row level security;
alter table trainers enable row level security;
alter table clients enable row level security;
alter table trainer_client_assignments enable row level security;
alter table workout_plans enable row level security;
alter table workout_days enable row level security;
alter table workout_exercises enable row level security;
alter table workout_logs enable row level security;
alter table workout_sets enable row level security;
alter table personal_records enable row level security;
alter table diet_plans enable row level security;
alter table diet_meals enable row level security;
alter table diet_items enable row level security;
alter table measurements enable row level security;
alter table activity_logs enable row level security;
alter table daily_checkins enable row level security;
alter table sessions enable row level security;
alter table messages enable row level security;
alter table message_attachments enable row level security;
alter table notifications enable row level security;
alter table audit_logs enable row level security;

-- ============================================================
-- POLICIES: profiles
-- ============================================================

create policy "profiles_select_own_or_admin"
  on profiles for select
  using (id = auth.uid() or current_role_is('admin'));

create policy "profiles_update_own_limited"
  on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());
  -- Note: `role` changes must go through a server-side admin action
  -- (service-role client), not through this policy, so a user can
  -- never promote themselves. Enforce that in application code.

create policy "profiles_admin_all"
  on profiles for all
  using (current_role_is('admin'))
  with check (current_role_is('admin'));

-- ============================================================
-- POLICIES: trainers / clients
-- ============================================================

create policy "trainers_select"
  on trainers for select
  using (
    id = auth.uid()
    or current_role_is('admin')
    or exists (
      select 1 from trainer_client_assignments a
      where a.trainer_id = trainers.id
        and a.client_id in (select id from clients where id = auth.uid())
        and a.ended_at is null
    )
  );

create policy "trainers_admin_write"
  on trainers for all
  using (current_role_is('admin'))
  with check (current_role_is('admin'));

create policy "clients_select"
  on clients for select
  using (
    id = auth.uid()
    or current_role_is('admin')
    or is_assigned_trainer(id)
  );

create policy "clients_admin_write"
  on clients for all
  using (current_role_is('admin'))
  with check (current_role_is('admin'));

create policy "clients_self_update"
  on clients for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ============================================================
-- POLICIES: trainer_client_assignments
-- ============================================================

create policy "assignments_select"
  on trainer_client_assignments for select
  using (
    current_role_is('admin')
    or trainer_id = auth.uid()
    or client_id = auth.uid()
  );

create policy "assignments_admin_write"
  on trainer_client_assignments for all
  using (current_role_is('admin'))
  with check (current_role_is('admin'));

-- ============================================================
-- POLICIES: workout_plans / days / exercises
-- ============================================================

create policy "workout_plans_select"
  on workout_plans for select
  using (
    current_role_is('admin')
    or client_id = auth.uid()
    or is_assigned_trainer(client_id)
  );

create policy "workout_plans_trainer_write"
  on workout_plans for all
  using (current_role_is('admin') or is_assigned_trainer(client_id))
  with check (current_role_is('admin') or is_assigned_trainer(client_id));

create policy "workout_days_select"
  on workout_days for select
  using (
    exists (
      select 1 from workout_plans p
      where p.id = workout_days.workout_plan_id
        and (current_role_is('admin') or p.client_id = auth.uid() or is_assigned_trainer(p.client_id))
    )
  );

create policy "workout_days_trainer_write"
  on workout_days for all
  using (
    exists (
      select 1 from workout_plans p
      where p.id = workout_days.workout_plan_id
        and (current_role_is('admin') or is_assigned_trainer(p.client_id))
    )
  )
  with check (
    exists (
      select 1 from workout_plans p
      where p.id = workout_days.workout_plan_id
        and (current_role_is('admin') or is_assigned_trainer(p.client_id))
    )
  );

create policy "workout_exercises_select"
  on workout_exercises for select
  using (
    exists (
      select 1 from workout_days d join workout_plans p on p.id = d.workout_plan_id
      where d.id = workout_exercises.workout_day_id
        and (current_role_is('admin') or p.client_id = auth.uid() or is_assigned_trainer(p.client_id))
    )
  );

create policy "workout_exercises_trainer_write"
  on workout_exercises for all
  using (
    exists (
      select 1 from workout_days d join workout_plans p on p.id = d.workout_plan_id
      where d.id = workout_exercises.workout_day_id
        and (current_role_is('admin') or is_assigned_trainer(p.client_id))
    )
  )
  with check (
    exists (
      select 1 from workout_days d join workout_plans p on p.id = d.workout_plan_id
      where d.id = workout_exercises.workout_day_id
        and (current_role_is('admin') or is_assigned_trainer(p.client_id))
    )
  );

-- ============================================================
-- POLICIES: workout_logs / sets / personal_records
-- ============================================================

create policy "workout_logs_select"
  on workout_logs for select
  using (current_role_is('admin') or client_id = auth.uid() or is_assigned_trainer(client_id));

create policy "workout_logs_client_write"
  on workout_logs for insert
  with check (client_id = auth.uid());

create policy "workout_logs_client_update_own"
  on workout_logs for update
  using (client_id = auth.uid())
  with check (client_id = auth.uid());

create policy "workout_sets_select"
  on workout_sets for select
  using (
    exists (
      select 1 from workout_logs l
      where l.id = workout_sets.workout_log_id
        and (current_role_is('admin') or l.client_id = auth.uid() or is_assigned_trainer(l.client_id))
    )
  );

create policy "workout_sets_client_write"
  on workout_sets for insert
  with check (
    exists (
      select 1 from workout_logs l
      where l.id = workout_sets.workout_log_id and l.client_id = auth.uid()
    )
  );

create policy "personal_records_select"
  on personal_records for select
  using (current_role_is('admin') or client_id = auth.uid() or is_assigned_trainer(client_id));

-- Personal records are derived server-side (never client-writable directly).
create policy "personal_records_server_write"
  on personal_records for insert
  with check (current_role_is('admin') or is_assigned_trainer(client_id));

-- ============================================================
-- POLICIES: diet_plans / meals / items
-- ============================================================

create policy "diet_plans_select"
  on diet_plans for select
  using (current_role_is('admin') or client_id = auth.uid() or is_assigned_trainer(client_id));

create policy "diet_plans_trainer_write"
  on diet_plans for all
  using (current_role_is('admin') or is_assigned_trainer(client_id))
  with check (current_role_is('admin') or is_assigned_trainer(client_id));

create policy "diet_meals_select"
  on diet_meals for select
  using (
    exists (
      select 1 from diet_plans p
      where p.id = diet_meals.diet_plan_id
        and (current_role_is('admin') or p.client_id = auth.uid() or is_assigned_trainer(p.client_id))
    )
  );

create policy "diet_meals_trainer_write"
  on diet_meals for all
  using (
    exists (
      select 1 from diet_plans p
      where p.id = diet_meals.diet_plan_id
        and (current_role_is('admin') or is_assigned_trainer(p.client_id))
    )
  )
  with check (
    exists (
      select 1 from diet_plans p
      where p.id = diet_meals.diet_plan_id
        and (current_role_is('admin') or is_assigned_trainer(p.client_id))
    )
  );

create policy "diet_items_select"
  on diet_items for select
  using (
    exists (
      select 1 from diet_meals m join diet_plans p on p.id = m.diet_plan_id
      where m.id = diet_items.diet_meal_id
        and (current_role_is('admin') or p.client_id = auth.uid() or is_assigned_trainer(p.client_id))
    )
  );

create policy "diet_items_trainer_write"
  on diet_items for all
  using (
    exists (
      select 1 from diet_meals m join diet_plans p on p.id = m.diet_plan_id
      where m.id = diet_items.diet_meal_id
        and (current_role_is('admin') or is_assigned_trainer(p.client_id))
    )
  )
  with check (
    exists (
      select 1 from diet_meals m join diet_plans p on p.id = m.diet_plan_id
      where m.id = diet_items.diet_meal_id
        and (current_role_is('admin') or is_assigned_trainer(p.client_id))
    )
  );

-- ============================================================
-- POLICIES: measurements / activity_logs / daily_checkins
-- ============================================================

create policy "measurements_select"
  on measurements for select
  using (current_role_is('admin') or client_id = auth.uid() or is_assigned_trainer(client_id));

create policy "measurements_client_write"
  on measurements for insert
  with check (client_id = auth.uid() or current_role_is('admin') or is_assigned_trainer(client_id));

create policy "activity_logs_select"
  on activity_logs for select
  using (current_role_is('admin') or client_id = auth.uid() or is_assigned_trainer(client_id));

create policy "activity_logs_client_write"
  on activity_logs for insert
  with check (client_id = auth.uid());

create policy "daily_checkins_select"
  on daily_checkins for select
  using (current_role_is('admin') or client_id = auth.uid() or is_assigned_trainer(client_id));

create policy "daily_checkins_client_write"
  on daily_checkins for insert
  with check (client_id = auth.uid());

create policy "daily_checkins_client_update_own"
  on daily_checkins for update
  using (client_id = auth.uid())
  with check (client_id = auth.uid());

-- ============================================================
-- POLICIES: sessions
-- ============================================================

create policy "sessions_select"
  on sessions for select
  using (current_role_is('admin') or client_id = auth.uid() or is_assigned_trainer(client_id));

create policy "sessions_trainer_write"
  on sessions for all
  using (current_role_is('admin') or is_assigned_trainer(client_id))
  with check (current_role_is('admin') or is_assigned_trainer(client_id));

-- ============================================================
-- POLICIES: messages / attachments
-- Only the assigned trainer and client on that pairing can read/write.
-- ============================================================

create policy "messages_select"
  on messages for select
  using (
    current_role_is('admin')
    or client_id = auth.uid()
    or trainer_id = auth.uid()
  );

create policy "messages_write"
  on messages for insert
  with check (
    sender_id = auth.uid()
    and (client_id = auth.uid() or trainer_id = auth.uid())
  );

create policy "message_attachments_select"
  on message_attachments for select
  using (
    exists (
      select 1 from messages m
      where m.id = message_attachments.message_id
        and (current_role_is('admin') or m.client_id = auth.uid() or m.trainer_id = auth.uid())
    )
  );

create policy "message_attachments_write"
  on message_attachments for insert
  with check (
    exists (
      select 1 from messages m
      where m.id = message_attachments.message_id
        and (m.client_id = auth.uid() or m.trainer_id = auth.uid())
    )
  );

-- ============================================================
-- POLICIES: notifications / audit_logs
-- ============================================================

create policy "notifications_select_own"
  on notifications for select
  using (profile_id = auth.uid());

create policy "notifications_update_own"
  on notifications for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "audit_logs_admin_select"
  on audit_logs for select
  using (current_role_is('admin'));

-- audit_logs are written only by server-side (service-role) code, never by
-- direct client insert, so intentionally no insert policy for regular roles.
