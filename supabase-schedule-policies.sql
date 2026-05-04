alter table public.profiles enable row level security;
alter table public.teacher_availability enable row level security;

create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Everyone can view teacher availability"
on public.teacher_availability
for select
to anon, authenticated
using (true);

create policy "Teachers can insert availability"
on public.teacher_availability
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles
    where id = (select auth.uid())
    and role = 'teacher'
  )
);

create policy "Teachers can update availability"
on public.teacher_availability
for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where id = (select auth.uid())
    and role = 'teacher'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where id = (select auth.uid())
    and role = 'teacher'
  )
);

create policy "Teachers can delete availability"
on public.teacher_availability
for delete
to authenticated
using (
  exists (
    select 1 from public.profiles
    where id = (select auth.uid())
    and role = 'teacher'
  )
);
