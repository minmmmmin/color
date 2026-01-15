import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(_name: string, _value: string, _options: CookieOptions) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          try {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          } catch (_error) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(_name: string, _options: CookieOptions) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          try {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          } catch (_error) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
