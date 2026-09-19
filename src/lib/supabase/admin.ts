import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

// Uses the SERVICE ROLE key. Bypasses Row Level Security entirely.
//
// Only import this in server-only code (API routes / Server Actions)
// for privileged operations an admin performs, such as creating a
// trainer or client auth account. Never import this from any file
// that could end up in a Client Component bundle.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
