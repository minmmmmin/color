import PaletteCard, { PaletteCardProps } from "@/components/PaletteCard";

// Dummy data for showcasing the PaletteCard component
const dummyPalettes: PaletteCardProps[] = [
  {
    title: "2 Colors (Equal Ratio)",
    schemeName: 'Minimal Duo',
    isOfficial: true,
    colors: [
      { hex: '#1d232a', role: 'dominant', ratio: null },
      { hex: '#ffffff', role: 'sub', ratio: null },
    ],
  },
  {
    title: "3 Colors (Equal Ratio)",
    schemeName: 'Classic Trio',
    isOfficial: false,
    colors: [
      { hex: '#3d4451', role: 'dominant', ratio: null },
      { hex: '#f9fafb', role: 'main', ratio: null },
      { hex: '#641ae6', role: 'accent', ratio: null },
    ],
  },
  {
    title: "6 Colors (Equal Ratio)",
    schemeName: 'Full Spectrum',
    isOfficial: true,
    colors: [
      { hex: '#f87272', role: 'c1', ratio: null },
      { hex: '#fbbd23', role: 'c2', ratio: null },
      { hex: '#36d399', role: 'c3', ratio: null },
      { hex: '#3abff8', role: 'c4', ratio: null },
      { hex: '#a56bf2', role: 'c5', ratio: null },
      { hex: '#f8a5c2', role: 'c6', ratio: null },
    ],
  },
  {
    title: "4 Colors (With Ratio)",
    schemeName: 'Golden Ratio',
    isOfficial: false,
    colors: [
      { hex: '#004643', role: 'dominant', ratio: 60 },
      { hex: '#abd1c6', role: 'main', ratio: 25 },
      { hex: '#e8e4e6', role: 'sub', ratio: 10 },
      { hex: '#f9bc60', role: 'accent', ratio: 5 },
    ],
  },
];


export default function Home() {
  return (
    <main className="min-h-screen bg-base-200 p-4 sm:p-8 md:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">Palette Showcase</h1>
          <p className="text-lg text-base-content/70">A collection of color palettes.</p>
        </header>

        {/* Palette Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyPalettes.map((palette, index) => (
            <PaletteCard key={index} {...palette} />
          ))}
        </div>

        <footer className="text-center mt-12 text-base-content/50">
          <p>This is a demo page. The actual data will be fetched from a database.</p>
        </footer>
      </div>
    </main>
  );
}