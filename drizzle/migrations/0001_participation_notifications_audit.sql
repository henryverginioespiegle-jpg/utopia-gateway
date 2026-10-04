create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  title text not null check (char_length(title) between 3 and 120),
  body text not null check (char_length(body) between 10 and 2000),
  created_at timestamptz not null default now()
);
grant select on public.ideas to anon;
grant select, insert, delete on public.ideas to authenticated;
grant all on public.ideas to service_role;
alter table public.ideas enable row level security;
create policy "ideas public read" on public.ideas for select to anon, authenticated using (true);
create policy "ideas create own" on public.ideas for insert to authenticated with check (user_id = auth.uid());
create policy "ideas delete own or staff" on public.ideas for delete to authenticated using (user_id = auth.uid() or public.is_staff(auth.uid()));

create table public.idea_supports (
  idea_id uuid not null references public.ideas(id) on delete cascade,
  user_id uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  primary key (idea_id, user_id)
);
grant select on public.idea_supports to anon;
grant select, insert, delete on public.idea_supports to authenticated;
grant all on public.idea_supports to service_role;
alter table public.idea_supports enable row level security;
create policy "supports public read" on public.idea_supports for select to anon, authenticated using (true);
create policy "supports own insert" on public.idea_supports for insert to authenticated with check (user_id = auth.uid());
create policy "supports own delete" on public.idea_supports for delete to authenticated using (user_id = auth.uid());

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  body text,
  kind text not null default 'info',
  read_at timestamptz,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, update on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "notif own read" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "notif own update" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid default auth.uid(),
  action text not null,
  entity text not null,
  entity_id text,
  details jsonb,
  created_at timestamptz not null default now()
);
grant select, insert on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;
alter table public.audit_logs enable row level security;
create policy "audit staff read" on public.audit_logs for select to authenticated using (public.is_staff(auth.uid()));
create policy "audit self insert auth events" on public.audit_logs for insert to authenticated
  with check (actor_id = auth.uid() and action in ('connexion','deconnexion'));

create or replace function public.audit_and_notify_request()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into audit_logs(actor_id, action, entity, entity_id, details) values (auth.uid(), 'creation', 'demande', new.reference, jsonb_build_object('titre', new.title));
    insert into notifications(user_id, title, body, kind) values (new.user_id, 'Demande ' || new.reference || ' reçue', new.title, 'demande');
  elsif new.status is distinct from old.status then
    insert into audit_logs(actor_id, action, entity, entity_id, details) values (auth.uid(), 'modification', 'demande', new.reference, jsonb_build_object('de', old.status, 'vers', new.status));
    insert into notifications(user_id, title, body, kind) values (new.user_id, 'Demande ' || new.reference || ' mise à jour',
      case new.status when 'en_cours' then 'Prise en charge par un agent' when 'resolue' then 'Votre demande est résolue' else 'Statut réinitialisé' end, 'demande');
  end if;
  return new;
end $$;
create trigger requests_audit after insert or update on public.requests for each row execute function public.audit_and_notify_request();

create or replace function public.audit_roles()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into audit_logs(actor_id, action, entity, entity_id, details)
  values (auth.uid(), 'changement_role', 'utilisateur', coalesce(new.user_id, old.user_id)::text,
    jsonb_build_object('role', coalesce(new.role, old.role), 'operation', lower(tg_op)));
  if tg_op = 'INSERT' and auth.uid() is not null then
    insert into notifications(user_id, title, body, kind) values (new.user_id, 'Rôle modifié', 'Nouveau rôle : ' || new.role, 'securite');
  end if;
  return coalesce(new, old);
end $$;
create trigger user_roles_audit after insert or delete on public.user_roles for each row execute function public.audit_roles();

create or replace function public.audit_ideas()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into audit_logs(actor_id, action, entity, entity_id, details)
  values (auth.uid(), case tg_op when 'INSERT' then 'creation' else 'suppression' end, 'idee', coalesce(new.id, old.id)::text,
    jsonb_build_object('titre', coalesce(new.title, old.title)));
  return coalesce(new, old);
end $$;
create trigger ideas_audit after insert or delete on public.ideas for each row execute function public.audit_ideas();

alter publication supabase_realtime add table public.notifications;