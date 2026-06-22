-- ============================================================
-- Met à jour le trigger de création automatique de profil
-- pour correspondre au nouveau schéma profiles MVP.
--
-- Colonnes peuplées :
--   id    → auth.users.id
--   email → auth.users.email
--   firstname / lastname → extraits de raw_user_meta_data (OAuth)
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, firstname, lastname)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'given_name',
    new.raw_user_meta_data ->> 'family_name'
  );
  return new;
end;
$$ language plpgsql security definer;
