'use client';

import { createClient } from '@/lib/supabase/client';
import { Scheme } from '@/types/palette';
import React, { useEffect, useState } from 'react';

type SchemeSelectorProps = {
  selectedSchemeId: string | null;
  onSchemeChange: (scheme: Scheme | null) => void;
  disabled?: boolean;
};

type GroupedSchemes = Record<string, Scheme[]>;

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
      setLoading(true);
      setError(null);

      const supabase = createClient();

      try {
        const { data, error: dbError } = await supabase
          .from('schemes')
          .select('id, key, display_name, category, min_colors, max_colors')
          .order('category')
          .order('display_name');

        if (dbError) throw dbError;

        if (!data || data.length === 0) {
          setError("技法のデータが見つかりませんでした。'schemes' テーブルにデータが存在するか、RLSの設定を確認してください。");
          return;
        }

        setSchemes(data as Scheme[]);

        const groups = (data as Scheme[]).reduce<GroupedSchemes>((acc, scheme) => {
          const category = scheme.category || 'uncategorized';
          (acc[category] ??= []).push(scheme);
          return acc;
        }, {});
        setGroupedSchemes(groups);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : '不明なエラー';
        setError(`技法の読み込みに失敗しました: ${errorMessage}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, []);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const schemeId = e.target.value;             // ✅ parseIntしない
    const selected = schemes.find((s) => s.id === schemeId) || null;
    onSchemeChange(selected);
  };

  if (loading) {
    return (
      <select className="select select-bordered w-full" disabled>
        <option>技法を読み込み中...</option>
      </select>
    );
  }

  if (error) {
    return <div className="alert alert-error text-sm">{error}</div>;
  }

  const categoryNames: Record<string, string> = {
    hue: '色相ベース',
    tone: 'トーンベース',
    wheel: '色相環モデル',
  };

  return (
    <select
      className="select select-bordered w-full"
      value={selectedSchemeId ?? ''}
      onChange={handleSelectChange}
      disabled={disabled}
    >
      <option disabled value="">
        技法を選択してください
      </option>

      {Object.entries(groupedSchemes).map(([category, schemesInCategory]) => (
        <optgroup key={category} label={categoryNames[category] || category}>
          {schemesInCategory.map((scheme) => (
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
