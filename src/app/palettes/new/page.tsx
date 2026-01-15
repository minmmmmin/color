import React, { Suspense } from 'react';
import NewPaletteForm from './NewPaletteForm';

const NewPalettePage = () => {
  return (
    <Suspense fallback={<div className="text-center p-12">読み込み中...</div>}>
      <NewPaletteForm />
    </Suspense>
  );
};

export default NewPalettePage;
