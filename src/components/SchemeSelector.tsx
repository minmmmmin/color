'use client';

import { Scheme, SchemeCategory } from '@/types/palette';
import React, { useMemo } from 'react';

type SchemeSelectorProps = {
  schemes: Scheme[];
  selectedSchemeId: string | null;
  onSchemeChange: (scheme: Scheme | null) => void;
  disabled?: boolean;
};

type GroupedSchemes = Record<string, Scheme[]>;

const SchemeSelector: React.FC<SchemeSelectorProps> = ({
  schemes,
  selectedSchemeId,
  onSchemeChange,
  disabled = false,
}) => {
  const groupedSchemes = useMemo(() => {
    return schemes.reduce<GroupedSchemes>((acc, scheme) => {
      const category = scheme.category || 'uncategorized';
      (acc[category] ??= []).push(scheme);
      return acc;
    }, {});
  }, [schemes]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const schemeId = e.target.value;
    const selected = schemes.find((s) => s.id === schemeId) || null;
    onSchemeChange(selected);
  };

  const categoryLabels: Record<SchemeCategory, string> = {
    hue_diff: '色相差ベース',
    tone_diff: 'トーン差ベース',
    dominant: 'ドミナント配色',
    tone_combo: 'トーン組み合わせ',
    nuance: '微差配色(カマイユ系)',
    harmony: 'ハーモニー',
    n_colors: 'ビコロール/トリコロール',
    wheel_division: '色相環n等分配色',
    adjustment: '調整技法',
  };

  const categoryOrder: SchemeCategory[] = [
    'hue_diff',
    'tone_diff',
    'dominant',
    'tone_combo',
    'nuance',
    'harmony',
    'n_colors',
    'wheel_division',
    'adjustment',
  ];

  return (
    <select
      className="select select-bordered w-full"
      value={selectedSchemeId ?? ''}
      onChange={handleSelectChange}
      disabled={disabled || schemes.length === 0}
    >
      <option disabled value="">
        {schemes.length === 0 ? '読み込み中...' : '技法を選択してください'}
      </option>

      {categoryOrder.map(
        (category) =>
          groupedSchemes[category] && (
            <optgroup key={category} label={categoryLabels[category]}>
              {groupedSchemes[category].map((scheme) => (
                <option key={scheme.id} value={scheme.id}>
                  {scheme.display_name}
                </option>
              ))}
            </optgroup>
          ),
      )}
    </select>
  );
};

export default SchemeSelector;
