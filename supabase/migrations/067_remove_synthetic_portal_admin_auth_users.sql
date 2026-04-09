-- Remove legacy fake-domain portal admin auth users (@bestvip77.admin.local).
-- bestvip77_admins referencing them is removed by ON DELETE CASCADE.

delete from auth.users
where email is not null
  and split_part(lower(trim(email)), '@', 2) = 'bestvip77.admin.local';
