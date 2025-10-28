# Table Column Resize - User Guide

**Feature:** Resizable Table Columns
**Version:** 1.0.0
**Status:** Available Now

## Overview

The UDO platform now supports resizing table columns to customize your viewing experience. Adjust column widths by dragging borders or using keyboard shortcuts, and your preferences will be saved automatically.

---

## How to Resize Columns

### Method 1: Drag with Mouse (Desktop)

1. **Hover over a column border** in the table header row
   - Your cursor will change to a resize cursor (↔)
   - A subtle highlight appears on the border

2. **Click and hold** on the border

3. **Drag left or right** to adjust the column width
   - The column resizes as you drag
   - Release to set the new width

4. **Your changes are saved automatically**
   - Width preferences are stored in your browser
   - They persist across page reloads and browser sessions

![Drag Resize Demo](resize-drag-demo.gif)

---

### Method 2: Touch Drag (Mobile/Tablet)

1. **Tap and hold** on a column border in the header row

2. **Drag left or right** with your finger

3. **Release** to set the new width

4. **Your changes are saved automatically**

**Note:** Touch targets are optimized for accessibility (minimum 44px per WCAG guidelines)

---

### Method 3: Keyboard Controls (Accessibility)

For keyboard-only users or screen reader users:

1. **Tab to a column border handle**
   - Use `Tab` key to navigate through the table
   - Resize handles are keyboard-focusable

2. **Press arrow keys to adjust width:**
   - `←` (Left Arrow) - Decrease width by 10 pixels
   - `→` (Right Arrow) - Increase width by 10 pixels
   - `Home` - Reset to minimum width (80px)
   - `End` - Expand to fit content width

3. **Screen reader announces changes:**
   - "Column 1 resized to 120 pixels"
   - Announcements are polite (non-interrupting)

![Keyboard Resize Demo](resize-keyboard-demo.gif)

---

## How to Reset Column Widths

If you want to restore the default column widths:

1. **Look for the reset button (↺)** in the table toolbar
   - The button only appears if you've customized column widths
   - Located in the top-right corner of the table

2. **Click the reset button**
   - Your custom widths are removed
   - Page reloads to apply default widths

**Note:** Reset clears preferences for that specific table only (other tables are unaffected)

---

## Browser Compatibility

### Supported Browsers

✅ **Desktop:**
- Chrome 80+ (Windows, Mac, Linux)
- Firefox 75+ (Windows, Mac, Linux)
- Safari 13+ (Mac)
- Edge 80+ (Windows, Mac)

✅ **Mobile:**
- iOS Safari 13+ (iPhone, iPad)
- Chrome Mobile 80+ (Android)
- Samsung Internet 12+

### Browser Requirements

- JavaScript must be enabled
- localStorage must be enabled (for saving preferences)
  - Private browsing mode: Resize works, but preferences don't persist
  - localStorage disabled: Resize works, but preferences don't persist

---

## Accessibility Features

### Keyboard Navigation

- ✅ All resize handles are keyboard-focusable
- ✅ Arrow keys provide precise width adjustments
- ✅ Home/End keys for quick min/max sizing

### Screen Reader Support

- ✅ ARIA labels describe resize handles ("Resize column 1")
- ✅ ARIA live regions announce width changes
- ✅ Instructions provided for keyboard users
- ✅ Focus indicators visible when tabbing

### WCAG 2.1 Level AA Compliance

- ✅ Minimum touch target size (44×44px)
- ✅ Keyboard operable (no mouse required)
- ✅ Screen reader compatible
- ✅ Focus indicators meet contrast requirements

---

## Frequently Asked Questions (FAQ)

### Q: Will my column widths sync across devices?

**A:** No. Column widths are stored locally in your browser's localStorage. They persist on the same device but don't sync across devices or browsers.

**Why:** Privacy and performance. No server-side storage required.

---

### Q: What happens if I clear my browser data?

**A:** Clearing browser data (cache, cookies, localStorage) will reset all column width preferences to defaults.

**Solution:** You'll need to resize columns again after clearing browser data.

---

### Q: How small/large can I make columns?

**A:**
- **Minimum width:** 80 pixels (ensures readability and touch targets)
- **Maximum width:** No limit (columns can be as wide as needed)

**Note:** Extremely wide columns will require horizontal scrolling.

---

### Q: Does the feature work in fullscreen mode?

**A:** Yes! Column resize works seamlessly in fullscreen mode. All interactions (drag, keyboard, touch) remain functional.

---

### Q: What if a table has merged cells (colspan/rowspan)?

**A:** The feature still works, but merged cells may have minor alignment quirks. The resize functionality is fully operational.

---

### Q: Can I resize columns on very wide tables (100+ columns)?

**A:** Yes, but performance may be slightly slower. You'll see a warning in the browser console for very wide tables, but the feature remains functional.

---

### Q: Does resizing affect table print layout?

**A:** Custom column widths apply to the screen view. Print layout uses default browser styles. Consider resetting widths before printing for optimal print output.

---

### Q: Can I undo a resize operation?

**A:** Not directly. To undo:
1. Drag the column back to its original width, OR
2. Click the reset button (↺) to restore all defaults

**Note:** Browser back button does not undo resize operations.

---

### Q: What if I'm in private browsing mode?

**A:** Resize functionality works normally, but your width preferences won't persist after closing the browser window.

**Reason:** Private browsing mode restricts localStorage access.

---

### Q: Can I disable the resize feature?

**A:** The feature is enabled by default and cannot be disabled per-table. If you prefer default widths, simply don't resize columns or use the reset button.

**Developer Note:** Developers can disable the feature via environment variable if needed.

---

## Troubleshooting

### Issue: Cursor doesn't change to resize cursor

**Possible Causes:**
- Table hasn't finished loading yet (wait a moment)
- JavaScript error on page (check browser console)
- Browser doesn't support resize feature

**Solution:**
- Refresh the page
- Try a different browser (see Browser Compatibility above)
- Check browser console for errors (F12 → Console tab)

---

### Issue: Column widths don't persist after reload

**Possible Causes:**
- localStorage disabled (private browsing, browser settings)
- localStorage full (quota exceeded)
- Browser data cleared between sessions

**Solution:**
- Exit private browsing mode
- Clear old localStorage data (browser settings → storage)
- Check browser console for localStorage errors

---

### Issue: Reset button not appearing

**Possible Causes:**
- No custom widths have been set yet
- Table hasn't finished loading

**Solution:**
- Resize at least one column first
- Refresh the page to see the reset button appear

---

### Issue: Drag operation feels laggy or slow

**Possible Causes:**
- Very wide table (100+ columns)
- Browser extensions interfering
- Low-performance device

**Solution:**
- Feature is still functional, just slower
- Try disabling browser extensions
- Consider using keyboard resize (arrow keys) for precise control

---

### Issue: Touch drag not working on mobile

**Possible Causes:**
- Browser doesn't support touch events properly
- Conflicting touch gestures (scroll, zoom)

**Solution:**
- Try landscape orientation for easier interaction
- Use a supported mobile browser (see Browser Compatibility)
- Ensure you're tapping directly on the column border

---

## Tips & Best Practices

### Tip 1: Use Keyboard for Precise Adjustments

For pixel-perfect column sizing:
1. Focus on a resize handle (Tab key)
2. Use arrow keys to adjust width incrementally
3. Each press adjusts by 10 pixels

**Example:** Need a column exactly 150px wide? Focus on handle, press arrow key 15 times.

---

### Tip 2: Quick Reset with Home/End Keys

- `Home` key → Minimum width (great for compact view)
- `End` key → Auto-fit to content (great for long text)

**Use Case:** Table with one very long column name? Press `End` to auto-expand.

---

### Tip 3: Mobile Landscape Orientation

For easier column resizing on mobile:
- Rotate device to landscape orientation
- More screen width = easier to see and adjust columns
- Touch targets remain accessible in portrait mode too

---

### Tip 4: Reset Before Sharing Screenshots

If you're taking screenshots to share:
1. Click reset button (↺) to restore default widths
2. Take screenshot with consistent layout
3. Resize again afterward if needed

---

### Tip 5: Use Fullscreen for Maximum Space

Combine column resize with fullscreen mode:
1. Click fullscreen button on table toolbar
2. Resize columns to fill the screen
3. Enjoy distraction-free table viewing

---

## Privacy & Data Storage

### What Data Is Stored?

**Stored in your browser's localStorage:**
- Table identifier (hash of table title or headers)
- Array of column widths in pixels
- Example: `{"table-abc123": [120, 180, 250]}`

**NOT stored:**
- Your personal information
- Table content or data
- Activity logs or usage patterns

### Data Location

- **Storage:** Browser localStorage (local to your device)
- **Size:** Typically < 1KB per table
- **Lifetime:** Persists until you clear browser data or click reset

### Data Privacy

- ✅ No server-side storage
- ✅ No tracking or analytics
- ✅ No data sharing or transmission
- ✅ Fully private and local to your browser

### GDPR Compliance

The column resize feature:
- Does not collect personal data
- Does not transmit data to servers
- Does not require consent (local functionality only)
- Can be cleared by user (reset button or browser settings)

---

## Known Limitations

### 1. No Cross-Device Sync

**Limitation:** Width preferences don't sync across devices.

**Reason:** Privacy and simplicity (no server-side storage).

**Workaround:** Resize columns on each device separately.

---

### 2. Merged Cells May Misalign

**Limitation:** Tables with colspan/rowspan may have minor alignment issues.

**Reason:** Merged cells span multiple columns, making perfect alignment complex.

**Workaround:** Feature still works, just accept minor visual quirks.

---

### 3. No Undo/Redo

**Limitation:** Cannot undo individual resize operations.

**Reason:** Feature focuses on current state, not history.

**Workaround:** Use reset button to restore all defaults, or manually adjust.

---

### 4. Print Layout Uses Defaults

**Limitation:** Custom widths don't apply to printed pages.

**Reason:** Browser print styles override custom widths.

**Workaround:** Reset widths before printing for consistent output.

---

## Getting Help

### Report Issues

If you encounter problems:

1. **Check this guide first** (Troubleshooting section above)
2. **Check browser console** (F12 → Console tab) for error messages
3. **Contact support** with:
   - Browser name and version
   - Device type (desktop, mobile, tablet)
   - Steps to reproduce the issue
   - Screenshot if possible

### Feature Requests

Have ideas for improvements?
- Suggest features via your organization's feedback channels
- Provide use cases and examples
- Prioritize based on impact to your workflow

---

## Additional Resources

### Related Features

- **Table Fullscreen Mode:** Maximize table viewing area
- **Table Scroll Buttons:** Navigate wide tables easily
- **Table Toolbar:** Access table controls and actions

### Documentation

- **Technical Documentation:** See `FEATURE-DOCUMENTATION.md` (for developers)
- **Performance Validation:** See `PERFORMANCE-VALIDATION.md` (for developers)
- **Integration Testing:** See `FINAL-INTEGRATION-TEST.md` (for QA)

---

## Version History

### v1.0.0 (2025-10-26)
- ✅ Initial release
- ✅ Drag-to-resize with mouse
- ✅ Touch support for mobile
- ✅ Keyboard navigation
- ✅ Screen reader accessibility
- ✅ localStorage persistence
- ✅ Reset functionality
- ✅ Fullscreen compatibility

---

**Last Updated:** 2025-10-26
**Feedback:** Welcome via your organization's support channels
**Status:** Production Ready 🚀
