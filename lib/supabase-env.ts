const VERCEL_HINT =
  'In Vercel → Project → Settings → Environment Variables, set the variable for Production, then redeploy (a new build is required for NEXT_PUBLIC_* values).';

function cleanEnvValue(value: string): string {
  return value.trim().replace(/^['"]|['"]$/g, '');
}

// IMPORTANT: values must be passed as static process.env.X references at the
// call site. Next.js only inlines NEXT_PUBLIC_* vars into the client bundle
// for static member access — process.env[name] is undefined in the browser.
function requireEnv(label: string, ...values: Array<string | undefined>): string {
  for (const raw of values) {
    if (!raw) continue;
    const value = cleanEnvValue(raw);
    if (value) return value;
  }
  throw new Error(`${label} is not configured. ${VERCEL_HINT}`);
}

function normalizeSupabaseUrl(url: string): string {
  const trimmed = url.replace(/\/+$/, '');

  if (trimmed.endsWith('/rest/v1')) {
    return trimmed.slice(0, -'/rest/v1'.length);
  }

  return trimmed;
}

function validateHttpUrl(url: string, label: string): string {
  if (url.startsWith('postgres://') || url.startsWith('postgresql://')) {
    throw new Error(
      `${label} must be your Supabase HTTP project URL (https://xxxxx.supabase.co), not a Postgres connection string. In Supabase: Project Settings → API → Project URL. ${VERCEL_HINT}`
    );
  }

  const normalized = normalizeSupabaseUrl(url);

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('invalid protocol');
    }

    if (!parsed.hostname.endsWith('.supabase.co')) {
      throw new Error('unexpected host');
    }

    if (parsed.pathname && parsed.pathname !== '/') {
      throw new Error(
        `${label} should not include a path. Use https://xxxxx.supabase.co — not the Data API URL ending in /rest/v1. ${VERCEL_HINT}`
      );
    }

    return normalized;
  } catch (error) {
    if (error instanceof Error && error.message.includes('should not include a path')) {
      throw error;
    }

    throw new Error(
      `${label} is invalid ("${url}"). In Supabase go to Project Settings → API and copy Project URL (https://xxxxx.supabase.co only — not Data API /rest/v1). ${VERCEL_HINT}`
    );
  }
}

export function getSupabaseUrl(): string {
  const url = requireEnv(
    'Supabase URL',
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_URL
  );
  return validateHttpUrl(url, 'Supabase URL');
}

export function getSupabasePublishableKey(): string {
  return requireEnv(
    'Supabase publishable key',
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.SUPABASE_ANON_KEY
  );
}

export function getSupabaseServiceRoleKey(): string {
  return requireEnv(
    'Supabase service role key',
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function getSupabaseConfigError(): string | null {
  try {
    getSupabaseUrl();
    getSupabasePublishableKey();
    getSupabaseServiceRoleKey();
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : 'Supabase is not configured.';
  }
}