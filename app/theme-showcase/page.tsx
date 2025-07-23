import React from 'react';
import ThemeManager from '@/components/theme-manager';

export default function ThemeShowcasePage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-fd-layout">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-fd-4xl font-bold charlotte-text-gradient">
          Charlotte UDO Theme Showcase
        </h1>
        <ThemeManager />
      </div>
      
      <div className="space-y-12">
        
        {/* Theme Information Section */}
        <section className="fd-card bg-accent/10 border-accent/20">
          <h2 className="text-fd-2xl font-semibold mb-fd-lg">Available Themes</h2>
          <div className="grid md:grid-cols-2 gap-fd-lg">
            <div>
              <h3 className="text-fd-lg font-medium mb-fd-sm">Color Themes</h3>
              <ul className="text-fd-sm space-y-1 text-muted-foreground">
                <li>• <strong>Light:</strong> Standard light mode</li>
                <li>• <strong>Dark:</strong> Standard dark mode</li>
                <li>• <strong>System:</strong> Follows system preference</li>
                <li>• <strong>Charlotte Blue:</strong> Blue-themed variant</li>
                <li>• <strong>Charlotte Purple:</strong> Purple-themed variant</li>
                <li>• <strong>Charlotte Green:</strong> Green-themed variant</li>
              </ul>
            </div>
            <div>
              <h3 className="text-fd-lg font-medium mb-fd-sm">Size Themes</h3>
              <ul className="text-fd-sm space-y-1 text-muted-foreground">
                <li>• <strong>Comfortable:</strong> Spacious layout with larger text</li>
                <li>• <strong>Compact:</strong> Dense layout with smaller text</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Color Palette Section */}
        <section>
          <h2 className="text-fd-2xl font-semibold mb-fd-lg">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <ColorSwatch name="Primary" color="bg-primary text-primary-foreground" hex="var(--fd-primary)" />
            <ColorSwatch name="Secondary" color="bg-secondary text-secondary-foreground" hex="var(--fd-secondary)" />
            <ColorSwatch name="Accent" color="bg-accent text-accent-foreground" hex="var(--fd-accent)" />
            <ColorSwatch name="Muted" color="bg-muted text-muted-foreground" hex="var(--fd-muted)" />
            <ColorSwatch name="Background" color="bg-background text-foreground border" hex="var(--fd-background)" />
            <ColorSwatch name="Card" color="bg-card text-card-foreground border" hex="var(--fd-card)" />
            <ColorSwatch name="Border" color="border-4 border-border bg-background" hex="var(--fd-border)" />
            <ColorSwatch name="Destructive" color="bg-destructive text-destructive-foreground" hex="var(--fd-destructive)" />
            <ColorSwatch name="Charlotte Blue" color="bg-charlotte-blue text-white" hex="var(--charlotte-blue)" />
            <ColorSwatch name="Charlotte Purple" color="bg-charlotte-purple text-white" hex="var(--charlotte-purple)" />
            <ColorSwatch name="Charlotte Teal" color="bg-charlotte-teal text-white" hex="var(--charlotte-teal)" />
            <ColorSwatch name="Charlotte Green" color="bg-charlotte-green text-white" hex="var(--charlotte-green)" />
            <ColorSwatch name="Charlotte Orange" color="bg-charlotte-orange text-white" hex="var(--charlotte-orange)" />
          </div>
        </section>

        {/* Typography Section */}
        <section>
          <h2 className="text-fd-2xl font-semibold mb-fd-lg">Typography Scale</h2>
          <div className="space-y-fd-md">
            <div className="grid md:grid-cols-2 gap-fd-lg">
              <div>
                <h3 className="text-fd-lg font-medium mb-fd-sm">Headings</h3>
                <div className="space-y-fd-sm">
                  <h1 className="text-fd-4xl font-bold">Heading 1 (4xl)</h1>
                  <h2 className="text-fd-3xl font-semibold">Heading 2 (3xl)</h2>
                  <h3 className="text-fd-2xl font-medium">Heading 3 (2xl)</h3>
                  <h4 className="text-fd-xl font-medium">Heading 4 (xl)</h4>
                  <h5 className="text-fd-lg font-medium">Heading 5 (lg)</h5>
                  <h6 className="text-fd-base font-medium">Heading 6 (base)</h6>
                </div>
              </div>
              <div>
                <h3 className="text-fd-lg font-medium mb-fd-sm">Body Text</h3>
                <div className="space-y-fd-sm">
                  <p className="text-fd-lg">Large text (lg) - Important content</p>
                  <p className="text-fd-base">Base text (base) - Standard body content</p>
                  <p className="text-fd-sm">Small text (sm) - Secondary information</p>
                  <p className="text-fd-xs">Extra small text (xs) - Captions and metadata</p>
                  <p className="text-fd-sm text-muted-foreground">Muted text - Subtle information</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Spacing System */}
        <section>
          <h2 className="text-fd-2xl font-semibold mb-fd-lg">Spacing System</h2>
          <div className="grid md:grid-cols-2 gap-fd-lg">
            <div className="fd-card">
              <h3 className="text-fd-lg font-medium mb-fd-sm">Fumadocs Spacing</h3>
              <div className="space-y-fd-sm">
                <div className="flex items-center gap-fd-sm">
                  <div className="w-4 h-4 bg-primary rounded" style={{ width: 'var(--fd-spacing-xs, 0.5rem)' }} />
                  <span className="text-fd-sm">fd-xs</span>
                </div>
                <div className="flex items-center gap-fd-sm">
                  <div className="w-4 h-4 bg-primary rounded" style={{ width: 'var(--fd-spacing-sm, 0.75rem)' }} />
                  <span className="text-fd-sm">fd-sm</span>
                </div>
                <div className="flex items-center gap-fd-sm">
                  <div className="w-4 h-4 bg-primary rounded" style={{ width: 'var(--fd-spacing-md, 1rem)' }} />
                  <span className="text-fd-sm">fd-md</span>
                </div>
                <div className="flex items-center gap-fd-sm">
                  <div className="w-4 h-4 bg-primary rounded" style={{ width: 'var(--fd-spacing-lg, 1.5rem)' }} />
                  <span className="text-fd-sm">fd-lg</span>
                </div>
                <div className="flex items-center gap-fd-sm">
                  <div className="w-4 h-4 bg-primary rounded" style={{ width: 'var(--fd-spacing-xl, 2rem)' }} />
                  <span className="text-fd-sm">fd-xl</span>
                </div>
              </div>
            </div>
            <div className="fd-card">
              <h3 className="text-fd-lg font-medium mb-fd-sm">Layout Variables</h3>
              <div className="text-fd-sm space-y-1 text-muted-foreground">
                <div>Layout Width: <span className="text-foreground">var(--fd-layout-width)</span></div>
                <div>Nav Height: <span className="text-foreground">var(--fd-nav-height)</span></div>
                <div>Sidebar Width: <span className="text-foreground">var(--fd-sidebar-width)</span></div>
                <div>Content Padding: <span className="text-foreground">var(--fd-content-padding)</span></div>
                <div>Border Radius: <span className="text-foreground">var(--fd-radius)</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Elements */}
        <section>
          <h2 className="text-fd-2xl font-semibold mb-fd-lg">Interactive Elements</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-fd-lg">
            
            {/* Buttons */}
            <div className="fd-card">
              <h3 className="text-fd-lg font-medium mb-fd-sm">Buttons</h3>
              <div className="space-y-fd-sm">
                <button className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  Primary Button
                </button>
                <button className="w-full py-2 px-4 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors">
                  Secondary Button
                </button>
                <button className="w-full py-2 px-4 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors">
                  Accent Button
                </button>
                <button className="w-full py-2 px-4 border border-border bg-background text-foreground rounded-md hover:bg-secondary transition-colors">
                  Outline Button
                </button>
              </div>
            </div>

            {/* Form Elements */}
            <div className="fd-card">
              <h3 className="text-fd-lg font-medium mb-fd-sm">Form Elements</h3>
              <div className="space-y-fd-sm">
                <input 
                  type="text" 
                  placeholder="Text input" 
                  className="w-full py-2 px-3 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                />
                <select className="w-full py-2 px-3 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                  <option>Select option</option>
                  <option>Option 1</option>
                  <option>Option 2</option>
                </select>
                <textarea 
                  placeholder="Textarea" 
                  rows={3}
                  className="w-full py-2 px-3 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                />
              </div>
            </div>

            {/* Links */}
            <div className="fd-card">
              <h3 className="text-fd-lg font-medium mb-fd-sm">Links</h3>
              <div className="space-y-fd-sm text-fd-sm">
                <p>
                  <a href="#" className="text-primary hover:text-primary/80 transition-colors underline">
                    Primary Link
                  </a>
                </p>
                <p>
                  <a href="#" className="text-foreground hover:text-primary transition-colors">
                    Default Link
                  </a>
                </p>
                <p>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Muted Link
                  </a>
                </p>
                <p>
                  <a href="#" className="text-destructive hover:text-destructive/80 transition-colors">
                    Destructive Link
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cards and Containers */}
        <section>
          <h2 className="text-fd-2xl font-semibold mb-fd-lg">Cards & Containers</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-fd-lg">
            
            <div className="fd-card">
              <h3 className="text-fd-lg font-semibold mb-fd-sm">Standard Card</h3>
              <p className="text-fd-sm text-muted-foreground">
                This is a standard card with default styling using the current theme colors.
              </p>
            </div>

            <div className="fd-card bg-primary text-primary-foreground">
              <h3 className="text-fd-lg font-semibold mb-fd-sm">Primary Card</h3>
              <p className="text-fd-sm opacity-90">
                This card uses the primary color scheme with contrasting text.
              </p>
            </div>

            <div className="fd-card bg-secondary text-secondary-foreground">
              <h3 className="text-fd-lg font-semibold mb-fd-sm">Secondary Card</h3>
              <p className="text-fd-sm opacity-90">
                This card uses the secondary color scheme.
              </p>
            </div>

            <div className="fd-card bg-accent text-accent-foreground">
              <h3 className="text-fd-lg font-semibold mb-fd-sm">Accent Card</h3>
              <p className="text-fd-sm opacity-90">
                This card uses the accent color for emphasis.
              </p>
            </div>

            <div className="fd-card bg-muted text-muted-foreground">
              <h3 className="text-fd-lg font-semibold mb-fd-sm">Muted Card</h3>
              <p className="text-fd-sm">
                This card uses muted colors for subtle information.
              </p>
            </div>

            <div className="fd-card border-destructive bg-destructive/10 text-destructive-foreground">
              <h3 className="text-fd-lg font-semibold mb-fd-sm">Alert Card</h3>
              <p className="text-fd-sm">
                This card uses destructive colors for warnings or errors.
              </p>
            </div>
          </div>
        </section>

        {/* Code Examples */}
        <section>
          <h2 className="text-fd-2xl font-semibold mb-fd-lg">Code Examples</h2>
          <div className="space-y-fd-md">
            <div className="fd-card">
              <h3 className="text-fd-lg font-medium mb-fd-sm">Inline Code</h3>
              <p className="text-fd-sm">
                Use the <code className="px-1 py-0.5 bg-muted text-muted-foreground rounded text-xs">useState</code> hook 
                to manage state in React components.
              </p>
            </div>
            
            <div className="fd-card">
              <h3 className="text-fd-lg font-medium mb-fd-sm">Code Block</h3>
              <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                <code className="text-fd-sm text-muted-foreground">{`// Charlotte UDO Theme Example
const useTheme = () => {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return { theme, toggleTheme };
};`}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* Theme Usage Guide */}
        <section>
          <h2 className="text-fd-2xl font-semibold mb-fd-lg">Theme Usage Guide</h2>
          <div className="grid md:grid-cols-2 gap-fd-lg">
            <div className="fd-card">
              <h3 className="text-fd-lg font-medium mb-fd-sm">CSS Variables</h3>
              <div className="text-fd-sm space-y-1 text-muted-foreground">
                <div>Use <code className="text-foreground">var(--fd-primary)</code> for primary colors</div>
                <div>Use <code className="text-foreground">var(--fd-background)</code> for backgrounds</div>
                <div>Use <code className="text-foreground">var(--fd-foreground)</code> for text</div>
                <div>Use <code className="text-foreground">var(--fd-border)</code> for borders</div>
              </div>
            </div>
            
            <div className="fd-card">
              <h3 className="text-fd-lg font-medium mb-fd-sm">Utility Classes</h3>
              <div className="text-fd-sm space-y-1 text-muted-foreground">
                <div>Use <code className="text-foreground">text-fd-lg</code> for font sizes</div>
                <div>Use <code className="text-foreground">gap-fd-md</code> for spacing</div>
                <div>Use <code className="text-foreground">bg-primary</code> for backgrounds</div>
                <div>Use <code className="text-foreground">text-primary</code> for text colors</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="fd-card bg-muted/50 text-center">
          <p className="text-fd-sm text-muted-foreground">
            Charlotte UDO Theme System - Switch themes using the controls above to see all variants in action.
          </p>
        </footer>
      </div>
    </div>
  );
}

function ColorSwatch({ name, color, hex }: { name: string; color: string; hex: string }) {
  return (
    <div className="space-y-fd-sm">
      <div className={`${color} h-20 rounded-lg shadow-sm border flex items-center justify-center`}>
        <span className="text-fd-xs font-medium opacity-75">{name}</span>
      </div>
      <div>
        <p className="font-medium text-fd-sm">{name}</p>
        <p className="text-fd-xs text-muted-foreground font-mono">{hex}</p>
      </div>
    </div>
  );
}