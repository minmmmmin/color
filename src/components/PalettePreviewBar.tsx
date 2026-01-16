import React from 'react';

type PaletteColor = {
  hex: string;
  role: string;
  ratio: number | null;
};

type PalettePreviewBarProps = {
  colors: PaletteColor[];
};

const PalettePreviewBar: React.FC<PalettePreviewBarProps> = ({ colors }) => {
  if (!colors || colors.length === 0) {
    return null;
  }

  // Determine if all colors have a specific ratio. If not, divide them evenly.
  const areAllRatiosDefined = colors.every(
    (color) => color.ratio !== null && color.ratio !== undefined,
  );

  return (
    <div
      className="flex h-16 w-full overflow-hidden rounded-lg border border-base-300"
      title="Color Palette Preview"
    >
      {colors.map((color, index) => {
        const width =
          areAllRatiosDefined && color.ratio
            ? `${color.ratio}%`
            : `${100 / colors.length}%`;

        return (
          <div
            key={`${color.hex}-${index}`}
            className="h-full transition-all duration-300"
            style={{
              backgroundColor: color.hex,
              width: width,
            }}
            title={`${color.role}: ${color.hex} (${width})`}
          />
        );
      })}
    </div>
  );
};

export default PalettePreviewBar;
