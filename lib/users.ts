import { createAdminClient } from '@/utils/supabase/admin';

// The app-wide user directory used by the assignee / share pickers. It must NOT
// carry raw email addresses: any authenticated user can list it, so exposing
// every colleague's email here let the whole directory be harvested. A
// server-computed `displayName` (full name, falling back to email only when a
// user has no name) is all the pickers need.
export interface AppUser {
  id: string;
  fullName: string | null;
  displayName: string;
}

export function getUserDisplayName(user: {
  fullName?: string | null;
  email?: string | null;
  displayName?: string | null;
}): string {
  const display = user.displayName?.trim();
  if (display) return display;
  const name = user.fullName?.trim();
  if (name) return name;
  return user.email?.trim() || '';
}

export function getAuthUserDisplayName(
  metadata: Record<string, unknown> | undefined,
  email: string | undefined
): string {
  const fullName =
    (metadata?.full_name as string | undefined) ??
    (metadata?.name as string | undefined) ??
    null;
  return getUserDisplayName({ fullName, email: email ?? '' });
}

export function resolveResponsibleDisplayName(
  responsible: string,
  users: AppUser[]
): string {
  if (!responsible) return 'Unassigned';
  const byId = users.find((u) => u.id === responsible);
  if (byId) return getUserDisplayName(byId);
  const byName = users.find(
    (u) => getUserDisplayName(u).toLowerCase() === responsible.toLowerCase()
  );
  if (byName) return getUserDisplayName(byName);
  return responsible;
}

export async function listAppUsers(options?: {
  excludeUserId?: string;
}): Promise<AppUser[]> {
  const admin = createAdminClient();
  const users: AppUser[] = [];
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });

    if (error) {
      throw new Error(error.message);
    }

    for (const authUser of data.users) {
      if (!authUser.email) continue;
      if (options?.excludeUserId && authUser.id === options.excludeUserId) continue;
      const fullName =
        (authUser.user_metadata?.full_name as string | undefined) ??
        (authUser.user_metadata?.name as string | undefined) ??
        null;
      users.push({
        id: authUser.id,
        fullName,
        // Compute the label server-side so the raw email never leaves the server
        // unless the user has no name at all (kept only as a last-resort label).
        displayName: getUserDisplayName({ fullName, email: authUser.email }),
      });
    }

    if (data.users.length < perPage) break;
    page += 1;
  }

  return users.sort((a, b) =>
    getUserDisplayName(a).localeCompare(getUserDisplayName(b))
  );
}