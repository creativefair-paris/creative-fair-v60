-- Sprint 36.C.2 — Trigger handle_new_user + backfill orphans.
--
-- Restaure le trigger pg_trigger 'on_auth_user_created' qui était absent
-- de la base (3 users auth.users sans profile à l'arrivée du sprint).
-- Auto-provisionne un tenant + un profile à chaque signup auth.users.
--
-- Doctrine v60 :
--   * tenants.plan défaut 'b2b_custom' (B2C self-service désactivé en V1)
--   * profiles.role forcé à 'owner' (le default DDL 'member' ne convient
--     pas au premier user du tenant)
--   * slug dérivé de la partie locale de l'email + retry sur collision

-- Numérotation : suit la convention 3-digit existante (001 → 010) plutôt
-- qu'un timestamp ; cohérence > suggestion du brief.

set search_path = public, auth, pg_temp;

-- ─────────────────────────────────────────────────────────────────────────
-- Fonction : public.handle_new_user
-- ─────────────────────────────────────────────────────────────────────────
-- SECURITY DEFINER est nécessaire car le trigger s'exécute dans le contexte
-- du rôle qui INSERT dans auth.users (typiquement supabase_auth_admin) ;
-- sans DEFINER, le INSERT dans public.tenants / public.profiles échouerait
-- par défaut de privilèges.
-- search_path explicite empêche un attaquant qui aurait posé un schéma
-- malveillant de détourner la résolution des objets.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  base_slug   text;
  cand_slug   text;
  new_tenant  uuid;
  attempt     int := 0;
  user_email  text;
begin
  -- Email systématique (NEW.email peut être null si auth provider exotique).
  user_email := coalesce(NEW.email, NEW.id::text || '@local.unknown');

  -- Slug : partie locale email, lowercase, non-alphanum → '-', trim dashes.
  base_slug := regexp_replace(lower(split_part(user_email, '@', 1)), '[^a-z0-9]+', '-', 'g');
  base_slug := regexp_replace(base_slug, '^-+|-+$', '', 'g');
  if length(base_slug) = 0 then
    base_slug := 'user';
  end if;

  cand_slug := base_slug;

  -- Boucle de retry sur collision slug (max 5 tentatives avec suffix random).
  loop
    begin
      insert into public.tenants (slug, name, plan)
      values (cand_slug, user_email, 'b2b_custom')
      returning id into new_tenant;
      exit;
    exception when unique_violation then
      attempt := attempt + 1;
      if attempt >= 5 then
        exit;
      end if;
      cand_slug := base_slug || '-' || substring(md5(random()::text || clock_timestamp()::text), 1, 4);
    end;
  end loop;

  -- Fallback : si 5 retries n'ont rien donné, slug UUID-only.
  if new_tenant is null then
    cand_slug := 'user-' || replace(gen_random_uuid()::text, '-', '');
    insert into public.tenants (slug, name, plan)
    values (cand_slug, user_email, 'b2b_custom')
    returning id into new_tenant;
  end if;

  -- Profile : role 'owner' (forcé, le default DDL 'member' ne convient pas
  -- au premier user du tenant qu'il vient de créer).
  -- ON CONFLICT idempotent au cas où un autre chemin aurait déjà créé
  -- le profile (course de timing avec ensureProfile côté serveur).
  insert into public.profiles (id, tenant_id, email, role)
  values (NEW.id, new_tenant, user_email, 'owner')
  on conflict (id) do nothing;

  return NEW;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- Grants : la fonction doit être exécutable par le rôle qui déclenche le
-- INSERT sur auth.users. supabase_auth_admin couvre les signups via API.
-- ─────────────────────────────────────────────────────────────────────────
grant execute on function public.handle_new_user() to postgres;
grant execute on function public.handle_new_user() to service_role;
grant execute on function public.handle_new_user() to supabase_auth_admin;

-- ─────────────────────────────────────────────────────────────────────────
-- Trigger : after insert on auth.users.
-- ─────────────────────────────────────────────────────────────────────────
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────
-- Backfill : pour chaque user auth.users sans profile (LEFT JOIN), appliquer
-- la même logique. Idempotent grâce au on conflict.
-- Le compte canonical Lead (creativefair@1922.studio, profile manuel déjà
-- en place) est protégé par on conflict (id) do nothing.
-- ─────────────────────────────────────────────────────────────────────────
do $backfill$
declare
  orphan      record;
  base_slug   text;
  cand_slug   text;
  new_tenant  uuid;
  attempt     int;
  user_email  text;
begin
  for orphan in
    select u.id, u.email
    from auth.users u
    left join public.profiles p on p.id = u.id
    where p.id is null
  loop
    user_email := coalesce(orphan.email, orphan.id::text || '@local.unknown');
    base_slug := regexp_replace(lower(split_part(user_email, '@', 1)), '[^a-z0-9]+', '-', 'g');
    base_slug := regexp_replace(base_slug, '^-+|-+$', '', 'g');
    if length(base_slug) = 0 then
      base_slug := 'user';
    end if;
    cand_slug := base_slug;
    new_tenant := null;
    attempt := 0;

    loop
      begin
        insert into public.tenants (slug, name, plan)
        values (cand_slug, user_email, 'b2b_custom')
        returning id into new_tenant;
        exit;
      exception when unique_violation then
        attempt := attempt + 1;
        if attempt >= 5 then
          exit;
        end if;
        cand_slug := base_slug || '-' || substring(md5(random()::text || clock_timestamp()::text), 1, 4);
      end;
    end loop;

    if new_tenant is null then
      cand_slug := 'user-' || replace(gen_random_uuid()::text, '-', '');
      insert into public.tenants (slug, name, plan)
      values (cand_slug, user_email, 'b2b_custom')
      returning id into new_tenant;
    end if;

    insert into public.profiles (id, tenant_id, email, role)
    values (orphan.id, new_tenant, user_email, 'owner')
    on conflict (id) do nothing;
  end loop;
end
$backfill$;
