'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Palette, PaletteColorDB } from '@/types/palette';
import PaletteCard from '@/components/PaletteCard';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';

const PaletteDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const supabase = createClient();

  const [palette, setPalette] = useState<Palette | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch both palette and user session in parallel
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        const { data, error: fetchError } = await supabase
          .from('palettes')
          .select(`
            *,
            schemes (display_name),
            palette_colors (*)
          `)
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error('Palette not found.');

        setPalette(data as Palette);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to fetch data.';
        setError(errorMessage);
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, supabase]);

  const handleDelete = async () => {
    // Guard: If not logged in, redirect to login page
    if (!user) {
      router.push('/login');
      return;
    }

    if (!window.confirm('このパレットを本当に削除しますか？この操作は取り消せません。')) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('palettes')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      router.push('/');
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : '削除中にエラーが発生しました。';
      setError(errorMessage);
      console.error(e);
    } finally {
      setIsDeleting(false); // Ensure this is always called
    }
  };

  if (loading) {
    return <div className="text-center p-12">Loading Palette...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-12">
        <div className="alert alert-error mb-4">{error}</div>
        <Link href="/" className="btn btn-secondary">ホームに戻る</Link>
      </div>
    );
  }

  if (!palette) {
    return <div className="text-center p-12">Palette not found.</div>;
  }

  const cardProps = {
    id: palette.id,
    title: palette.title,
    schemeName: palette.schemes?.display_name,
    isOfficial: palette.is_official,
    colors: (palette.palette_colors || []).sort((a, b) => a.role.localeCompare(b.role)),
    createdAt: palette.created_at,
  };

  return (
    <div className="container mx-auto max-w-lg p-4 pt-12">
      <h1 className="text-2xl font-bold mb-2 text-center">{palette.title || 'Unnamed Palette'}</h1>
      <p className="text-center text-base-content/70 mb-8">{palette.description || ''}</p>

      <PaletteCard {...cardProps} />

      <div className="text-center mt-8 flex justify-center items-center gap-4">
        <Link href="/" className="btn btn-ghost">ホームに戻る</Link>
        {user && user.id === palette.user_id && (
          <button
            className="btn btn-error btn-outline"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? '削除中...' : '削除'}
          </button>
        )}
      </div>
    </div>
  );
};

export default PaletteDetailPage;
