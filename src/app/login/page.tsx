'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@/lib/supabase/client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AuthPage() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const hasError = searchParams.get('error') === 'auth';

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        window.location.href = '/';
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const redirectUrl =
    typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="w-full max-w-md p-8 space-y-3 rounded-xl bg-white shadow-lg">
      <h1 className="text-2xl font-bold text-center">Login / Register</h1>
      {hasError && (
        <div className="alert alert-error text-sm">
          認証に失敗しました。もう一度お試しください。
        </div>
      )}
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={['google']}
        redirectTo={redirectUrl ? `${redirectUrl}/auth/callback` : undefined}
      />
    </div>
  );
}
