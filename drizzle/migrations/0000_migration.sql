create type public.app_role as enum ('citoyen','agent','admin');
create type public.request_status as enum ('recue','en_cours','resolue');

create table public.profiles (
  id uuid primary key,
  full_name text not null default '',
  email text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role app_role not null,
  unique(user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('agent','admin'))
$$;

create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.is_staff(auth.uid()));
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid());
create policy "own roles read" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admin manage roles insert" on public.user_roles for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin manage roles delete" on public.user_roles for delete to authenticated using (public.has_role(auth.uid(),'admin'));
grant insert, delete on public.user_roles to authenticated;

create table public.requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null default ('TN-' || upper(substr(md5(random()::text),1,6))),
  user_id uuid not null default auth.uid(),
  category text not null,
  title text not null,
  description text not null,
  status request_status not null default 'recue',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.requests to authenticated;
grant all on public.requests to service_role;
alter table public.requests enable row level security;
create policy "read own or staff" on public.requests for select to authenticated using (user_id = auth.uid() or public.is_staff(auth.uid()));
create policy "create own" on public.requests for insert to authenticated with check (user_id = auth.uid());
create policy "staff update" on public.requests for update to authenticated using (public.is_staff(auth.uid()));

create table public.request_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  status request_status not null,
  note text,
  created_at timestamptz not null default now()
);
grant select on public.request_events to authenticated;
grant all on public.request_events to service_role;
alter table public.request_events enable row level security;
create policy "read events" on public.request_events for select to authenticated using (
  exists (select 1 from public.requests r where r.id = request_id and (r.user_id = auth.uid() or public.is_staff(auth.uid())))
);

create or replace function public.log_request_event()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.request_events(request_id, status, note) values (new.id, new.status, 'Demande reçue');
  elsif new.status is distinct from old.status then
    new.updated_at := now();
    insert into public.request_events(request_id, status, note) values (new.id, new.status,
      case new.status when 'en_cours' then 'Prise en charge par un agent' when 'resolue' then 'Demande résolue' else 'Statut réinitialisé' end);
  end if;
  return new;
end $$;
create trigger requests_after_insert after insert on public.requests for each row execute function public.log_request_event();
create trigger requests_before_update before update on public.requests for each row execute function public.log_request_event();

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);
grant insert on public.contact_messages to anon, authenticated;
grant select on public.contact_messages to authenticated;
grant all on public.contact_messages to service_role;
alter table public.contact_messages enable row level security;
create policy "anyone send" on public.contact_messages for insert to anon, authenticated with check (char_length(message) between 1 and 2000);
create policy "staff read" on public.contact_messages for select to authenticated using (public.is_staff(auth.uid()));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, full_name, email) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), new.email);
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  end if;
  insert into public.user_roles(user_id, role) values (new.id, 'citoyen');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();