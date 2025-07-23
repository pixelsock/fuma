# Charlotte UDO Theme Implementation Plan

## Phase 1: Simple CSS Override Approach (Recommended)

### Step 1: Create Theme CSS File
Create a new CSS file that overrides Fumadocs default colors with Charlotte UDO colors.

```css
/* app/charlotte-theme.css */

/* Charlotte UDO Theme for Fumadocs */
:root {
  /* Override default Fumadocs colors with Charlotte UDO palette */
  --background: 0 0% 100%; /* white */
  --foreground: 0 0% 0%; /* black */
  
  --card: 0 0% 100%;
  --card-foreground: 0 0% 0%;
  
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 0%;
  
  --primary: 203 89% 47%; /* #0693e3 - Charlotte UDO Blue */
  --primary-foreground: 0 0% 100%;
  
  --secondary: 240 16% 94%; /* #f0f0f1 - Light Gray */
  --secondary-foreground: 208 7% 24%; /* #32373c - Dark Gray */
  
  --muted: 240 16% 94%;
  --muted-foreground: 208 7% 46%;
  
  --accent: 270 67% 60%; /* #9b51e0 - Purple */
  --accent-foreground: 0 0% 100%;
  
  --destructive: 22 100% 50%; /* #ff6900 - Orange */
  --destructive-foreground: 0 0% 100%;
  
  --border: 240 16% 91%;
  --input: 240 16% 91%;
  --ring: 203 89% 47%;
  
  /* Custom Charlotte UDO colors */
  --charlotte-teal: #0b7f8c;
  --charlotte-green: #00d084;
  --charlotte-light-blue: #8ed1fc;
  --charlotte-blue-gray: #abb8c3;
}

.dark {
  --background: 208 7% 14%;
  --foreground: 0 0% 95%;
  
  --card: 208 7% 18%;
  --card-foreground: 0 0% 95%;
  
  --popover: 208 7% 18%;
  --popover-foreground: 0 0% 95%;
  
  --primary: 203 89% 57%;
  --primary-foreground: 208 7% 14%;
  
  --secondary: 208 7% 24%;
  --secondary-foreground: 0 0% 95%;
  
  --muted: 208 7% 24%;
  --muted-foreground: 213 13% 65%;
  
  --accent: 270 67% 70%;
  --accent-foreground: 208 7% 14%;
  
  --destructive: 22 100% 60%;
  --destructive-foreground: 208 7% 14%;
  
  --border: 208 7% 24%;
  --input: 208 7% 24%;
  --ring: 203 89% 57%;
}

/* Additional Charlotte UDO specific styles */
.fumadocs-nav {
  border-color: hsl(var(--border));
}

.fumadocs-nav-link:hover {
  color: hsl(var(--primary));
}

.fumadocs-nav-link[data-active='true'] {
  color: hsl(var(--primary));
  background-color: hsl(var(--primary) / 0.1);
}

/* Custom button styles */
.charlotte-button {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: opacity 0.2s;
}

.charlotte-button:hover {
  opacity: 0.9;
}

/* Code block styling */
pre {
  background-color: hsl(var(--secondary)) !important;
  border: 1px solid hsl(var(--border));
}

.dark pre {
  background-color: hsl(var(--card)) !important;
}
```

### Step 2: Update Global CSS
Modify your existing `app/global.css` to include the theme:

```css
@import 'tailwindcss';
@import './charlotte-theme.css'; /* Add this line */
@import 'fumadocs-ui/css/neutral.css';
@import 'fumadocs-ui/css/preset.css';

/* Keep your existing custom styles below */
```

### Step 3: Update Tailwind Config (Optional)
Add Charlotte UDO colors to Tailwind for utility classes:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Add Charlotte UDO specific colors
        charlotte: {
          blue: '#0693e3',
          purple: '#9b51e0',
          teal: '#0b7f8c',
          green: '#00d084',
          orange: '#ff6900',
          'light-blue': '#8ed1fc',
          'blue-gray': '#abb8c3',
          'dark-gray': '#32373c',
          'light-gray': '#f0f0f1',
        },
      },
    },
  },
}
```

## Phase 2: Advanced Integration (Optional)

### Custom Components
Create Charlotte UDO branded components:

```tsx
// components/charlotte-card.tsx
export function CharlotteCard({ children, className }) {
  return (
    <div className={cn(
      "border border-charlotte-light-gray rounded-lg p-6",
      "hover:border-charlotte-blue transition-colors",
      className
    )}>
      {children}
    </div>
  );
}
```

### Theme Toggle
If you want to allow switching between default and Charlotte theme:

```tsx
// components/theme-toggle.tsx
export function ThemeToggle() {
  const [theme, setTheme] = useState('charlotte');
  
  const toggleTheme = () => {
    const newTheme = theme === 'charlotte' ? 'default' : 'charlotte';
    setTheme(newTheme);
    document.documentElement.classList.toggle('charlotte-theme');
  };
  
  return (
    <button onClick={toggleTheme}>
      Switch to {theme === 'charlotte' ? 'Default' : 'Charlotte'} Theme
    </button>
  );
}
```

## Testing Checklist

1. [ ] Colors display correctly in light mode
2. [ ] Colors display correctly in dark mode
3. [ ] Text contrast meets WCAG AA standards
4. [ ] Navigation active states are visible
5. [ ] Code blocks are styled appropriately
6. [ ] Buttons and interactive elements have proper hover states
7. [ ] Theme works across all pages
8. [ ] No CSS conflicts with existing styles

## Rollback Plan

If issues arise, simply remove the import line from `global.css`:
```css
/* @import './charlotte-theme.css'; */ /* Comment out or remove */
```

## Benefits of This Approach

1. **Non-invasive**: Doesn't modify core Fumadocs files
2. **Easy to maintain**: All theme code in one file
3. **Simple to remove**: Just remove one import
4. **Performance**: No JavaScript overhead
5. **Compatibility**: Works with Fumadocs updates

## Next Steps

1. Implement Phase 1 (CSS override)
2. Test thoroughly
3. Consider Phase 2 enhancements if needed
4. Document any custom utility classes for team