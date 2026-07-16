/**
 * Approval-gate backfill for existing Supabase auth users.
 *
 * - Confirms any unconfirmed emails (signup no longer uses email confirmation)
 * - Creates missing profiles rows (grandfather existing users as APPROVED)
 * - Ensures bootstrap admins are ADMIN + APPROVED
 *
 * Usage: node --env-file=.env.local scripts/backfill-profiles.mjs
 * Safe to re-run.
 */

import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

const ADMIN_BOOTSTRAP_EMAILS = new Set([
  'daniel.hebert@lucina.com',
  'heberts.tkd@gmail.com',
]);

function clean(value) {
  return (value ?? '').trim().replace(/^['"]|['"]$/g, '');
}

const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL);
const serviceRoleKey = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);

if (!url || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function listAllUsers() {
  const users = [];
  let page = 1;
  const perPage = 200;

  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`listUsers: ${error.message}`);
    users.push(...(data.users ?? []));
    if (!data.users?.length || data.users.length < perPage) break;
    page += 1;
  }

  return users;
}

async function main() {
  console.log('Backfilling profiles for approval gate...');
  const users = await listAllUsers();
  console.log(`Found ${users.length} auth user(s)`);

  let confirmed = 0;
  let created = 0;
  let promoted = 0;
  let skipped = 0;
  let errors = 0;

  for (const user of users) {
    const email = (user.email ?? '').trim().toLowerCase();
    if (!email) {
      skipped += 1;
      continue;
    }

    // 1. Confirm email so pre-approval-gate signups can sign in.
    if (!user.email_confirmed_at) {
      const { error } = await admin.auth.admin.updateUserById(user.id, {
        email_confirm: true,
      });
      if (error) {
        console.error(`  confirm failed ${email}: ${error.message}`);
        errors += 1;
      } else {
        confirmed += 1;
      }
    }

    const bootstrap = ADMIN_BOOTSTRAP_EMAILS.has(email);
    const desiredRole = bootstrap ? 'ADMIN' : 'USER';
    const desiredStatus = 'APPROVED'; // grandfather everyone with an existing auth row

    const { data: existing, error: readError } = await admin
      .from('profiles')
      .select('id, role, status')
      .eq('userId', user.id)
      .maybeSingle();

    if (readError) {
      console.error(`  read profile failed ${email}: ${readError.message}`);
      errors += 1;
      continue;
    }

    if (!existing) {
      const fullName =
        user.user_metadata?.full_name || user.user_metadata?.name || null;
      const now = new Date().toISOString();
      const { error: insertError } = await admin.from('profiles').insert({
        id: randomUUID(),
        userId: user.id,
        email,
        fullName,
        role: desiredRole,
        status: desiredStatus,
        createdAt: now,
        updatedAt: now,
      });
      if (insertError) {
        console.error(`  create profile failed ${email}: ${insertError.message}`);
        errors += 1;
      } else {
        created += 1;
        console.log(`  + profile ${email} (${desiredRole}/${desiredStatus})`);
      }
      continue;
    }

    // 2. Bootstrap admins always keep admin + approved.
    if (
      bootstrap &&
      (existing.role !== 'ADMIN' || existing.status !== 'APPROVED')
    ) {
      const { error: updateError } = await admin
        .from('profiles')
        .update({
          role: 'ADMIN',
          status: 'APPROVED',
          updatedAt: new Date().toISOString(),
        })
        .eq('id', existing.id);
      if (updateError) {
        console.error(`  promote failed ${email}: ${updateError.message}`);
        errors += 1;
      } else {
        promoted += 1;
        console.log(`  ^ promoted ${email} to ADMIN/APPROVED`);
      }
    } else {
      skipped += 1;
    }
  }

  const { data: profiles, error: listError } = await admin
    .from('profiles')
    .select('email, role, status')
    .order('createdAt', { ascending: true });

  if (listError) {
    console.error(`Could not list profiles: ${listError.message}`);
  } else {
    console.log('\nProfiles:');
    for (const p of profiles ?? []) {
      console.log(`  ${p.email.padEnd(40)} ${p.role.padEnd(6)} ${p.status}`);
    }
  }

  console.log(
    `\nDone. confirmed=${confirmed} created=${created} promoted=${promoted} skipped=${skipped} errors=${errors}`
  );
  if (errors > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
