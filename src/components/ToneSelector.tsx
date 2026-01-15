'use client';

import { createClient } from '@/lib/supabaseClient';
import { Tone } from '@/types/palette';
import React, { useEffect, useState } from 'react';

type ToneSelectorProps = {
  selectedToneId: string | null;
  onToneSelect: (tone: Tone | null) => void;
};

const ToneSelector: React.FC<ToneSelectorProps> = ({ selectedToneId, onToneSelect }) => {
  const [tones, setTones] = useState<Tone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTones = async () => {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setError('Supabase connection info is missing.');
        setLoading(false);
        return;
      }
      
      const supabase = createClient();
      setLoading(true);
      try {
        const { data, error: dbError } = await supabase
          .from('tones')
          .select('id, key, code, display_name, category, s_min, s_max, l_min, l_max, sort_order')
          .eq('category', 'pccs')
          .order('sort_order');

        if (dbError) throw dbError;

        if (!data || data.length === 0) {
          setError('No tones found in the database for category "pccs".');
        } else {
          setTones(data);
        }
      } catch (err: any) {
        setError(`Failed to fetch tones: ${err.message}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTones();
  }, []);

  const handleSelect = (tone: Tone) => {
    onToneSelect(tone);
  };

  if (loading) {
    return <div className="text-center p-4">Loading tones...</div>;
  }

  if (error) {
    return <div className="alert alert-error text-sm">{error}</div>;
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
      {tones.map((tone) => (
        <button
          key={tone.id}
          onClick={() => handleSelect(tone)}
          className={`btn btn-block h-16 ${selectedToneId === tone.id ? 'btn-primary' : 'btn-outline'}`}
        >
          <div className="flex flex-col">
            <span className="text-xs font-mono">{tone.code}</span>
            <span className="text-sm normal-case">{tone.display_name}</span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ToneSelector;
