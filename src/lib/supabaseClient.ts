// src/lib/supabaseClient.ts
import { createBrowserClient } from '@supabase/ssr';

// NOTE: The environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
// need to be set in your .env.local file.
// Example:
// NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
// NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

/**
 * Creates a Supabase client for use in client-side components.
 */
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
