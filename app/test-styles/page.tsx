export default function TestStylesPage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-4">Tailwind CSS Test</h1>
      
      <div className="space-y-4">
        <div className="bg-blue-500 text-white p-4 rounded">
          Blue background with white text (Tailwind utility classes)
        </div>
        
        <div className="bg-[var(--color-fd-primary)] text-[var(--color-fd-primary-foreground)] p-4 rounded">
          Primary color using CSS variables
        </div>
        
        <div style={{ backgroundColor: 'var(--color-fd-primary)', color: 'var(--color-fd-primary-foreground)', padding: '1rem', borderRadius: '0.25rem' }}>
          Primary color using inline styles
        </div>
        
        <div className="border-2 border-red-500 p-4">
          Red border
        </div>
        
        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
          Green Button
        </button>
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-2">CSS Variable Values:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {`--color-fd-primary: ${getComputedStyle(document.documentElement).getPropertyValue('--color-fd-primary')}
--color-fd-background: ${getComputedStyle(document.documentElement).getPropertyValue('--color-fd-background')}
--color-fd-foreground: ${getComputedStyle(document.documentElement).getPropertyValue('--color-fd-foreground')}`}
        </pre>
      </div>
    </div>
  );
}