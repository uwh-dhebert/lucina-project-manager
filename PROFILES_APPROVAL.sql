-- Approval-gated access: backfill for existing accounts.
--
-- Registration no longer sends confirmation emails. Accounts are created with
-- the email pre-confirmed and a PENDING profile row; an admin approves them on
-- /admin/users. This script brings pre-existing auth users into that model.
--
-- Safe to re-run.
--
-- Run in: Supabase Dashboard -> SQL Editor -> New Query

BEGIN;

-- 1. Accounts created under the old email-confirmation flow may never have
--    confirmed. Email confirmation is retired, so confirm them all.
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;

-- 2. Backfill a profile row for every auth user that lacks one. Accounts that
--    predate the approval gate are grandfathered in as APPROVED.
--    Values are plain text so this works whether role/status are enums or varchar.
INSERT INTO profiles (id, "userId", email, "fullName", role, status, "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  u.id,
  lower(u.email),
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
  CASE
    WHEN lower(u.email) IN ('daniel.hebert@lucina.com', 'heberts.tkd@gmail.com')
      THEN 'ADMIN'
    ELSE 'USER'
  END,
  'APPROVED',
  now(),
  now()
FROM auth.users u
WHERE u.email IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p."userId" = u.id);

-- 3. Bootstrap admins keep admin access even if a profile already existed.
UPDATE profiles
SET role = 'ADMIN', status = 'APPROVED', "updatedAt" = now()
WHERE lower(email) IN ('daniel.hebert@lucina.com', 'heberts.tkd@gmail.com');

COMMIT;

-- Verify
SELECT email, role, status FROM profiles ORDER BY "createdAt";
