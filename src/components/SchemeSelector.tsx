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
    hue_based: '色相でまとめた配色',
    tone_based: 'トーンでまとめた配色',
    wheel_2: '色相環 2色配色',
    wheel_3: '色相環 3色配色',
    wheel_4: '色相環 4色配色',
    wheel_5: '色相環 5色配色',
    wheel_6: '色相環 6色配色',
  };

  const categoryOrder: SchemeCategory[] = [
    'hue_based',
    'tone_based',
    'wheel_2',
    'wheel_3',
    'wheel_4',
    'wheel_5',
    'wheel_6',
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
