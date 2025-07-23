# Charlotte UDO Theme Usage Guide

## Overview

The Charlotte UDO theme is built on top of Fumadocs UI and follows the proper theme structure instead of overriding styles in global CSS files. This approach provides better maintainability, theme switching capabilities, and consistent styling across the application.

## Theme Structure

The theme is organized into separate CSS files for better maintainability:

```
styles/
├── charlotte-theme.css    # Core theme colors and variables
├── layout.css            # Layout utilities and legacy compatibility
└── udo-tables.css        # UDO-specific table styles
```

## Key Features

### 1. Proper CSS Variable Usage
- Uses Fumadocs UI convention: `--color-fd-*` variables
- Supports both light and dark modes
- Maintains color consistency across components

### 2. Charlotte UDO Brand Colors
- **Primary**: Charlotte Blue (`--charlotte-blue`)
- **Accent**: Charlotte Purple (`--charlotte-purple`)
- **Secondary**: Charlotte Teal (`--charlotte-teal`)
- **Success**: Charlotte Green (`--charlotte-green`)
- **Warning**: Charlotte Orange (`--charlotte-orange`)

### 3. Theme Switching
- Native Fumadocs theme switching support
- Automatic dark/light mode detection
- Smooth transitions between themes

## Usage Examples

### Using Charlotte Colors in Components

```tsx
// In TSX/JSX
<div className="bg-charlotte-blue text-white">
  Charlotte Blue Background
</div>

<p className="text-charlotte-purple">
  Charlotte Purple Text
</p>
```

### Using Charlotte Components

```tsx
// Charlotte-specific buttons
<button className="charlotte-button">Primary Button</button>
<button className="charlotte-button-secondary">Secondary Button</button>

// Charlotte info boxes
<div className="charlotte-info">
  <strong>Info:</strong> Important information
</div>

<div className="charlotte-warning">
  <strong>Warning:</strong> Attention required
</div>

<div className="charlotte-success">
  <strong>Success:</strong> Operation completed
</div>
```

### Using Gradients

```tsx
// Background gradient
<div className="charlotte-gradient">
  Content with Charlotte gradient background
</div>

// Text gradient
<h1 className="charlotte-text-gradient">
  Charlotte Gradient Text
</h1>
```

## Available Theme Files

### 1. Fumadocs UI Base Themes
You can import different base themes from Fumadocs UI:

- `fumadocs-ui/css/neutral.css` (current)
- `fumadocs-ui/css/black.css`
- `fumadocs-ui/css/catppuccin.css`
- `fumadocs-ui/css/dusk.css`
- `fumadocs-ui/css/ocean.css`
- `fumadocs-ui/css/purple.css`
- `fumadocs-ui/css/shadcn.css`
- `fumadocs-ui/css/vitepress.css`

### 2. Charlotte UDO Custom Theme
The custom Charlotte theme (`styles/charlotte-theme.css`) overlays the base theme with Charlotte-specific colors and branding.

## Switching Base Themes

To switch to a different base theme, update the import in `app/global.css`:

```css
/* Current */
@import 'fumadocs-ui/css/neutral.css';

/* To switch to black theme */
@import 'fumadocs-ui/css/black.css';

/* To switch to purple theme */
@import 'fumadocs-ui/css/purple.css';
```

## Customization

### Adding New Colors

To add new colors to the Charlotte theme:

1. Define the color in `styles/charlotte-theme.css`:
```css
:root {
  --charlotte-new-color: 240 100% 50%;
}
```

2. Add to Tailwind config in `tailwind.config.ts`:
```ts
charlotte: {
  'new-color': 'hsl(var(--charlotte-new-color))',
}
```

3. Use in components:
```tsx
<div className="bg-charlotte-new-color">Content</div>
```

### Adding New Components

Create component classes in `styles/charlotte-theme.css`:

```css
.charlotte-new-button {
  background-color: hsl(var(--charlotte-blue));
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--fd-radius);
  transition: all 0.2s ease;
}

.charlotte-new-button:hover {
  background-color: hsl(var(--charlotte-teal));
}
```

## Best Practices

1. **Use CSS Variables**: Always use CSS variables for colors to support theme switching
2. **Follow Fumadocs Conventions**: Use `--color-fd-*` for core UI elements
3. **Maintain Dark Mode**: Always define dark mode variants for custom colors
4. **Use Semantic Names**: Name colors by their purpose, not their appearance
5. **Test Theme Switching**: Verify components work in both light and dark modes

## Migration from Legacy Styles

If you have existing styles using the old global CSS approach:

1. Move component-specific styles to `styles/charlotte-theme.css`
2. Update color references to use CSS variables
3. Add dark mode variants
4. Test theme switching functionality

## Theme Showcase

Visit `/theme-showcase` to see all available theme elements and test theme switching functionality.

This approach provides a more maintainable and flexible theming system that follows Fumadocs UI best practices while maintaining the Charlotte UDO brand identity.