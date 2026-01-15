'use client';

import { createClient } from '@/lib/supabaseClient';
import { Scheme } from '@/types/palette';
import React, { useEffect, useState } from 'react';

type SchemeSelectorProps = {
  selectedSchemeId: number | null;
  onSchemeChange: (scheme: Scheme | null) => void;
  disabled?: boolean;
};

type GroupedSchemes = {
  [category: string]: Scheme[];
};

const SchemeSelector: React.FC<SchemeSelectorProps> = ({
  selectedSchemeId,
  onSchemeChange,
  disabled = false,
}) => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [groupedSchemes, setGroupedSchemes] = useState<GroupedSchemes>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchemes = async () => {
      const supabase = createClient();
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('schemes')
          .select('id, key, display_name, category, min_colors, max_colors')
          .order('category')
          .order('display_name');

        if (error) {
          throw error;
        }

        setSchemes(data || []);

        // Group schemes by category
        const groups = (data || []).reduce<GroupedSchemes>((acc, scheme) => {
          const category = scheme.category || 'uncategorized';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(scheme);
          return acc;
        }, {});
        setGroupedSchemes(groups);

      } catch (err: any) {
        setError(err.message || 'Failed to fetch schemes.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, []);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const schemeId = parseInt(e.target.value, 10);
    const selected = schemes.find(s => s.id === schemeId) || null;
    onSchemeChange(selected);
  };

  if (error) {
    return <div className="text-error">Error: {error}</div>;
  }

  const categoryNames = {
    hue: '色相ベース',
    tone: 'トーンベース',
    wheel: '色相環モデル',
  };

  return (
    <select
      className="select select-bordered w-full"
      value={selectedSchemeId ?? ''}
      onChange={handleSelectChange}
      disabled={loading || disabled}
    >
      <option disabled value="">
        {loading ? '技法を読み込み中...' : '技法を選択してください'}
      </option>
      {Object.entries(groupedSchemes).map(([category, schemesInCategory]) => (
        <optgroup key={category} label={categoryNames[category as keyof typeof categoryNames] || category}>
          {schemesInCategory.map(scheme => (
            <option key={scheme.id} value={scheme.id}>
              {scheme.display_name}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
};

export default SchemeSelector;
