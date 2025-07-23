# Charlotte UDO Theme Design Specification

## Overview
This document outlines the design for a custom Fumadocs theme based on the Charlotte UDO color scheme from https://read.charlotteudo.org.

## Color Palette

### Primary Colors
- **Primary Blue**: `#0693e3` (Vivid Cyan Blue) - Main brand color
- **Secondary Purple**: `#9b51e0` (Vivid Purple) - Accent color
- **Teal**: `#0b7f8c` (from existing CSS) - Supporting color

### Accent Colors
- **Green**: `#00d084` (Vivid Green Cyan) - Success states
- **Orange**: `#ff6900` (Luminous Vivid Orange) - Warning states
- **Light Blue**: `#8ed1fc` (Pale Cyan Blue) - Info states

### Neutral Colors
- **White**: `#ffffff` - Primary background
- **Black**: `#000000` - Primary text
- **Dark Gray**: `#32373c` - Secondary text
- **Light Gray**: `#f0f0f1` - Borders and backgrounds
- **Blue Gray**: `#abb8c3` - Muted elements

## CSS Variable Mapping

### Light Theme
```css
:root {
  /* Fumadocs core colors */
  --fd-background: 0 0% 100%; /* white */
  --fd-foreground: 0 0% 0%; /* black */
  
  --fd-card: 0 0% 100%;
  --fd-card-foreground: 0 0% 0%;
  
  --fd-popover: 0 0% 100%;
  --fd-popover-foreground: 0 0% 0%;
  
  --fd-primary: 203 89% 47%; /* #0693e3 */
  --fd-primary-foreground: 0 0% 100%;
  
  --fd-secondary: 240 16% 94%; /* #f0f0f1 */
  --fd-secondary-foreground: 208 7% 24%; /* #32373c */
  
  --fd-muted: 213 13% 77%; /* #abb8c3 */
  --fd-muted-foreground: 208 7% 24%;
  
  --fd-accent: 270 67% 60%; /* #9b51e0 */
  --fd-accent-foreground: 0 0% 100%;
  
  --fd-destructive: 22 100% 50%; /* #ff6900 */
  --fd-destructive-foreground: 0 0% 100%;
  
  --fd-border: 240 16% 94%;
  --fd-input: 240 16% 94%;
  --fd-ring: 203 89% 47%;
  
  /* Charlotte UDO specific colors */
  --udo-teal: 186 88% 30%; /* #0b7f8c */
  --udo-green: 168 100% 42%; /* #00d084 */
  --udo-light-blue: 198 88% 78%; /* #8ed1fc */
}
```

### Dark Theme
```css
.dark {
  --fd-background: 208 7% 14%; /* dark variant of #32373c */
  --fd-foreground: 0 0% 95%;
  
  --fd-card: 208 7% 18%;
  --fd-card-foreground: 0 0% 95%;
  
  --fd-popover: 208 7% 18%;
  --fd-popover-foreground: 0 0% 95%;
  
  --fd-primary: 203 89% 57%; /* lighter #0693e3 */
  --fd-primary-foreground: 208 7% 14%;
  
  --fd-secondary: 208 7% 24%;
  --fd-secondary-foreground: 0 0% 95%;
  
  --fd-muted: 213 13% 30%;
  --fd-muted-foreground: 213 13% 77%;
  
  --fd-accent: 270 67% 70%; /* lighter purple */
  --fd-accent-foreground: 208 7% 14%;
  
  --fd-destructive: 22 100% 60%; /* lighter orange */
  --fd-destructive-foreground: 208 7% 14%;
  
  --fd-border: 208 7% 24%;
  --fd-input: 208 7% 24%;
  --fd-ring: 203 89% 57%;
}
```

## Implementation Strategy

### 1. CSS Structure
```css
/* app/charlotte-udo-theme.css */
@import 'tailwindcss';

/* Define Charlotte UDO color variables */
:root { /* light theme variables */ }
.dark { /* dark theme variables */ }

/* Import Fumadocs preset last to ensure proper overrides */
@import 'fumadocs-ui/css/preset.css';
```

### 2. Global CSS Updates
```css
/* app/global.css */
@import 'tailwindcss';
@import './charlotte-udo-theme.css';
@import 'fumadocs-ui/css/preset.css';
```

### 3. Tailwind Configuration
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Map Fumadocs color names to CSS variables
        background: 'hsl(var(--fd-background))',
        foreground: 'hsl(var(--fd-foreground))',
        primary: {
          DEFAULT: 'hsl(var(--fd-primary))',
          foreground: 'hsl(var(--fd-primary-foreground))',
        },
        // Add Charlotte UDO specific colors
        udo: {
          blue: '#0693e3',
          purple: '#9b51e0',
          teal: '#0b7f8c',
          green: '#00d084',
          orange: '#ff6900',
          'light-blue': '#8ed1fc',
        },
      },
    },
  },
}
```

## Component Styling

### Navigation
- Use primary blue (#0693e3) for active states
- Light gray borders for separation
- Dark gray text for better readability

### Buttons
- Primary: Blue background with white text
- Secondary: Light gray background with dark gray text
- Accent: Purple for special actions

### Code Blocks
- Light theme: Light gray background (#f0f0f1)
- Dark theme: Darker variant of card background
- Syntax highlighting using accent colors

### Cards & Panels
- Subtle borders using light gray
- Hover states with primary blue accent
- Shadow effects for depth

## Accessibility Considerations

1. **Color Contrast**: Ensure all text meets WCAG AA standards
   - Black on white: 21:1 (AAA)
   - Dark gray on light gray: 7.5:1 (AA)
   - White on primary blue: 4.7:1 (AA)

2. **Focus States**: Use primary blue with proper outline offset

3. **Dark Mode**: Maintain similar contrast ratios in dark theme

## Usage Instructions

1. Create the theme CSS file with the color definitions
2. Import it in global.css before Fumadocs preset
3. Update Tailwind config to include custom colors
4. Test both light and dark modes
5. Verify color contrast for accessibility

## Future Enhancements

1. **Theme Switcher**: Allow users to toggle between Charlotte UDO theme and default themes
2. **Custom Properties**: Add CSS custom properties for spacing and typography
3. **Component Library**: Create themed versions of common UI components
4. **Gradient Support**: Add gradient backgrounds inspired by the original site