'use client';

import React, { useMemo } from 'react';

type HueSliderProps = {
  hue: number;
  onHueChange: (newHue: number) => void;
};

const HueSlider: React.FC<HueSliderProps> = ({ hue, onHueChange }) => {
  const snappedHue = useMemo(() => {
    const snapped = Math.round(hue / 15) * 15;
    return snapped === 360 ? 0 : snapped;
  }, [hue]);

  const hueNumber = useMemo(() => (snappedHue / 15) % 24, [snappedHue]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onHueChange(parseInt(e.target.value, 10));
  };
  
  // Apply a gradient background to the slider track
  const sliderBackground = {
    background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
  };

  return (
    <div className="w-full">
      <input
        type="range"
        min={0}
        max={360}
        step={1}
        value={hue}
        onChange={handleSliderChange}
        className="range range-primary h-8"
        style={sliderBackground}
      />
      <div className="text-center mt-2 text-sm font-mono">
        H: {snappedHue}° (No. {hueNumber})
      </div>
    </div>
  );
};

export default HueSlider;
