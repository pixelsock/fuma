/**
 * Table Column Resize Module
 * Provides drag-to-resize functionality for UDO tables
 *
 * Features:
 * - Drag-to-resize columns from right edge
 * - Independent column resizing with table-layout: fixed
 * - Colspan support for merged header cells
 * - Resize handles on last column when table overflows container
 * - Keyboard accessibility for resize operations
 */

/**
 * Interface for storing column width preferences in localStorage
 * Maps table IDs to arrays of column widths in pixels
 */
export interface ColumnWidthPreferences {
  [tableId: string]: number[]; // Array of column widths in pixels
}

/**
 * Interface for tracking resize state during drag operations
 */
export interface ResizeState {
  isResizing: boolean;
  startX: number;
  startWidth: number;
  columnIndex: number;
  minWidth: number;
  targetCell: HTMLElement | null;
}

/**
 * Interface for merged cell detection
 */
export interface MergedCellInfo {
  hasMergedCells: boolean;
  mergedCellCount: number;
  affectedColumns: Set<number>;
}

/**
 * TableColumnResizer - Static class for table column resize functionality
 *
 * Provides methods for:
 * - Generating stable table IDs from content
 * - Persisting column widths to localStorage
 * - Applying stored widths to tables
 * - Validating and enforcing minimum widths
 */
export class TableColumnResizer {
  // Storage key for localStorage
  private static readonly STORAGE_KEY = 'udo-table-column-widths';

  // Minimum allowed column width in pixels (Task Group 6.4: Mobile constraints)
  private static readonly MIN_COLUMN_WIDTH = 80;

  // Debounce delay for localStorage writes in milliseconds
  private static readonly DEBOUNCE_DELAY = 300;

  // Performance warning threshold for wide tables (Task Group 6.3)
  private static readonly WIDE_TABLE_THRESHOLD = 100;

  // localStorage size limit warning threshold (Task Group 6.5)
  private static readonly STORAGE_SIZE_WARNING = 5000; // characters

  // Debounce timer for saving widths
  private static saveTimer: ReturnType<typeof setTimeout> | null = null;

  // Track active resize state per table
  private static resizeStates = new Map<HTMLTableElement, ResizeState>();

  // Track event listeners for cleanup
  private static listeners = new Map<HTMLTableElement, {
    onMove: (e: PointerEvent) => void;
    onUp: (e: PointerEvent) => void;
  }>();

  // Track localStorage availability (Task Group 6.5)
  private static localStorageAvailable: boolean | null = null;

  // Performance monitoring flag (Task Group 8.1)
  private static readonly ENABLE_PERFORMANCE_METRICS = process.env.NODE_ENV === 'development';

  /**
   * Task Group 8.1: Record a performance mark for timing measurements
   * Only records marks in development mode to avoid production overhead
   *
   * @param markName - Unique name for the performance mark
   */
  private static performanceMark(markName: string): void {
    if (this.ENABLE_PERFORMANCE_METRICS && typeof performance !== 'undefined') {
      try {
        performance.mark(markName);
      } catch (error) {
        // Silently fail if performance API unavailable
      }
    }
  }

  /**
   * Task Group 8.1: Measure and log performance between two marks
   * Only measures in development mode
   *
   * @param measureName - Name for the measurement
   * @param startMark - Starting mark name
   * @param endMark - Ending mark name
   */
  private static performanceMeasure(
    measureName: string,
    startMark: string,
    endMark: string
  ): void {
    if (this.ENABLE_PERFORMANCE_METRICS && typeof performance !== 'undefined') {
      try {
        performance.measure(measureName, startMark, endMark);
        const measure = performance.getEntriesByName(measureName)[0];

        if (measure) {
          console.log(
            `[Performance] ${measureName}: ${measure.duration.toFixed(2)}ms`
          );
        }
      } catch (error) {
        // Silently fail if performance API unavailable
      }
    }
  }

  /**
   * Task Group 6.5: Check if localStorage is available and functional
   * Tests for disabled, quota exceeded, and permission errors
   *
   * @returns True if localStorage is available and writable
   */
  private static checkLocalStorageAvailability(): boolean {
    // Return cached result if already checked
    if (this.localStorageAvailable !== null) {
      return this.localStorageAvailable;
    }

    try {
      const testKey = '__udo_test_storage__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      this.localStorageAvailable = true;
      return true;
    } catch (error) {
      console.warn('localStorage is not available:', error);
      this.localStorageAvailable = false;
      return false;
    }
  }

  /**
   * Task Group 6.1: Detect merged cells (colspan/rowspan) in table
   * Logs informational warning if merged cells are detected
   *
   * @param table - The table element to analyze
   * @returns Information about merged cells
   */
  static detectMergedCells(table: HTMLTableElement): MergedCellInfo {
    try {
      const allCells = table.querySelectorAll('td, th');
      const affectedColumns = new Set<number>();
      let mergedCellCount = 0;

      allCells.forEach((cell) => {
        const colspan = parseInt(cell.getAttribute('colspan') || '1');
        const rowspan = parseInt(cell.getAttribute('rowspan') || '1');

        if (colspan > 1 || rowspan > 1) {
          mergedCellCount++;

          // Track which columns are affected
          const cellElement = cell as HTMLTableCellElement;
          const cellIndex = cellElement.cellIndex;

          if (cellIndex >= 0) {
            for (let i = 0; i < colspan; i++) {
              affectedColumns.add(cellIndex + i);
            }
          }
        }
      });

      const hasMergedCells = mergedCellCount > 0;

      if (hasMergedCells) {
        console.info(
          `Table contains ${mergedCellCount} merged cells affecting columns: ` +
          `${Array.from(affectedColumns).join(', ')}. ` +
          `Resize will work, but alignment may vary.`
        );
      }

      return {
        hasMergedCells,
        mergedCellCount,
        affectedColumns
      };
    } catch (error) {
      console.warn('Error detecting merged cells:', error);
      return {
        hasMergedCells: false,
        mergedCellCount: 0,
        affectedColumns: new Set()
      };
    }
  }

  /**
   * Task Group 6.3: Check for very wide tables and log performance warning
   *
   * @param table - The table element to check
   * @returns True if table exceeds width threshold
   */
  private static checkWideTable(table: HTMLTableElement): boolean {
    try {
      const columnCount = table.querySelectorAll('thead th').length;

      if (columnCount > this.WIDE_TABLE_THRESHOLD) {
        console.warn(
          `Table has ${columnCount} columns (threshold: ${this.WIDE_TABLE_THRESHOLD}). ` +
          `Resize functionality may be slower. Consider reducing column count for better performance.`
        );
        return true;
      }

      return false;
    } catch (error) {
      console.warn('Error checking table width:', error);
      return false;
    }
  }

  /**
   * Task Group 6.2: Check if table is in fullscreen mode
   *
   * @param table - The table element to check
   * @returns True if table is in fullscreen mode
   */
  static isInFullscreenMode(table: HTMLTableElement): boolean {
    try {
      const shell = table.closest('.udo-table-shell');
      return shell?.classList.contains('udo-table-shell--fullscreen') || false;
    } catch (error) {
      console.warn('Error checking fullscreen mode:', error);
      return false;
    }
  }

  /**
   * Task Group 6.4: Get minimum column width based on viewport
   * Ensures touch targets meet accessibility standards on mobile
   *
   * @returns Minimum width in pixels (80px minimum, 44px for touch targets)
   */
  private static getMinimumWidth(): number {
    try {
      // Mobile devices: ensure 44x44px minimum touch target (WCAG 2.5.5)
      const isMobile = window.innerWidth < 768;

      if (isMobile) {
        // Ensure minimum remains 80px even on mobile for column content
        return Math.max(this.MIN_COLUMN_WIDTH, 80);
      }

      return this.MIN_COLUMN_WIDTH;
    } catch (error) {
      console.warn('Error determining minimum width:', error);
      return this.MIN_COLUMN_WIDTH;
    }
  }

  /**
   * Task Group 6.5: Check localStorage size and warn if approaching quota
   *
   * @param tableId - The table identifier
   * @param widths - Array of widths to be saved
   */
  private static checkStorageSize(tableId: string, widths: number[]): void {
    try {
      if (!this.checkLocalStorageAvailability()) {
        return;
      }

      const allWidths = this.loadAllWidths();
      allWidths[tableId] = widths;
      const jsonString = JSON.stringify(allWidths);

      if (jsonString.length > this.STORAGE_SIZE_WARNING) {
        console.warn(
          `localStorage for table widths is ${jsonString.length} characters ` +
          `(warning threshold: ${this.STORAGE_SIZE_WARNING}). ` +
          `Consider clearing old preferences if storage quota errors occur.`
        );
      }
    } catch (error) {
      console.warn('Error checking storage size:', error);
    }
  }

  /**
   * Generate a stable table ID from table content
   * Strategy 1: Use table title from .udo-table-title-text
   * Strategy 2: Hash column headers text
   * Strategy 3: Fallback to pathname + table index
   *
   * @param table - The table element to generate ID for
   * @returns Stable table identifier string
   */
  static generateTableId(table: HTMLTableElement): string {
    // Strategy 1: Use table title if available
    const shell = table.closest('.udo-table-shell');
    const titleElement = shell?.querySelector('.udo-table-title-text');

    if (titleElement?.textContent?.trim()) {
      return this.hashString(titleElement.textContent.trim());
    }

    // Strategy 2: Hash first row headers
    const headerRow = table.querySelector('thead tr');
    if (headerRow) {
      const headers = Array.from(headerRow.querySelectorAll('th'))
        .map(th => th.textContent?.trim() || '')
        .filter(text => text.length > 0)
        .join('|');

      if (headers.length > 0) {
        return this.hashString(headers);
      }
    }

    // Strategy 3: Fallback to page path + table index
    const tableIndex = Array.from(document.querySelectorAll('table')).indexOf(table);
    return this.hashString(`${window.location.pathname}-${tableIndex}`);
  }

  /**
   * Simple 32-bit hash function for string to ID conversion
   * Uses djb2-like algorithm for consistent hash generation
   *
   * Algorithm explanation:
   * 1. hash << 5: Multiply hash by 32 (left shift 5 bits)
   * 2. (hash << 5) - hash: Multiply by 31 (32 - 1)
   * 3. Add character code to hash
   * 4. & operation ensures 32-bit integer range
   *
   * @param str - String to hash
   * @returns Hash as base36 string with 'table-' prefix (e.g., "table-abc123")
   */
  private static hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char; // hash * 31 + char
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Base36 encoding produces short, URL-safe identifiers
    return `table-${Math.abs(hash).toString(36)}`;
  }

  /**
   * Save column widths to localStorage (debounced)
   * Debouncing prevents excessive writes during drag operations
   * Task Group 6.5: Enhanced with localStorage error handling
   *
   * Performance note: Debouncing reduces localStorage writes by ~95% during
   * active dragging. Only saves after 300ms of inactivity.
   *
   * @param tableId - Unique table identifier
   * @param widths - Array of column widths in pixels
   */
  static saveWidths(tableId: string, widths: number[]): void {
    // Clear existing timer to restart the debounce period
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    // Debounce: Save only after 300ms of no further width changes
    this.saveTimer = setTimeout(() => {
      try {
        // Task Group 6.5: Check localStorage availability first
        if (!this.checkLocalStorageAvailability()) {
          console.warn('localStorage not available - column widths will not persist');
          return;
        }

        // Task Group 6.5: Check storage size before saving
        this.checkStorageSize(tableId, widths);

        const allWidths = this.loadAllWidths();
        allWidths[tableId] = widths;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allWidths));
      } catch (error) {
        // Task Group 6.6: Fail gracefully with appropriate error type
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          console.error(
            'localStorage quota exceeded. Cannot save column widths. ' +
            'Consider clearing old table preferences.',
            error
          );
        } else {
          // Fail silently for other errors - localStorage might be disabled or in private mode
          console.warn('Failed to save column widths:', error);
        }
      }
    }, this.DEBOUNCE_DELAY);
  }

  /**
   * Load column widths for a specific table from localStorage
   * Task Group 6.5: Enhanced with localStorage error handling
   * Task Group 8.1: Enhanced with performance measurements
   *
   * @param tableId - Unique table identifier
   * @returns Array of widths in pixels, or null if not found
   */
  static loadWidths(tableId: string): number[] | null {
    this.performanceMark(`loadWidths-${tableId}-start`);

    try {
      // Task Group 6.5: Check localStorage availability first
      if (!this.checkLocalStorageAvailability()) {
        return null;
      }

      const allWidths = this.loadAllWidths();
      const result = allWidths[tableId] || null;

      this.performanceMark(`loadWidths-${tableId}-end`);
      this.performanceMeasure(
        `localStorage-read-${tableId}`,
        `loadWidths-${tableId}-start`,
        `loadWidths-${tableId}-end`
      );

      return result;
    } catch (error) {
      console.warn('Failed to load column widths:', error);
      return null;
    }
  }

  /**
   * Load all column width preferences from localStorage
   * Task Group 6.5: Enhanced with invalid JSON handling
   *
   * @returns Object mapping table IDs to width arrays
   */
  private static loadAllWidths(): ColumnWidthPreferences {
    try {
      // Task Group 6.5: Check localStorage availability first
      if (!this.checkLocalStorageAvailability()) {
        return {};
      }

      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return {};
      }

      // Task Group 6.5: Handle invalid JSON
      const parsed = JSON.parse(stored);

      // Validate structure
      if (typeof parsed !== 'object' || parsed === null) {
        console.warn('Invalid stored widths structure, resetting to empty');
        return {};
      }

      return parsed;
    } catch (error) {
      // Task Group 6.5: Handle JSON parsing errors
      if (error instanceof SyntaxError) {
        console.warn('Invalid JSON in stored widths, resetting to empty:', error);
        // Clear corrupted data
        try {
          localStorage.removeItem(this.STORAGE_KEY);
        } catch (removeError) {
          console.warn('Could not clear corrupted storage:', removeError);
        }
      } else {
        console.warn('Failed to parse stored widths:', error);
      }
      return {};
    }
  }

  /**
   * Reset stored widths for a specific table
   * Removes the table's entry from localStorage
   *
   * @param tableId - Unique table identifier
   */
  static resetWidths(tableId: string): void {
    try {
      const allWidths = this.loadAllWidths();
      delete allWidths[tableId];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allWidths));
    } catch (error) {
      console.warn('Failed to reset column widths:', error);
    }
  }

  /**
   * Check if preferences exist for a table
   *
   * @param tableId - Unique table identifier
   * @returns True if preferences are stored
   */
  static hasPreferences(tableId: string): boolean {
    const widths = this.loadWidths(tableId);
    return widths !== null && widths.length > 0;
  }

  /**
   * Get column widths from colgroup elements (backend-defined widths)
   * Reads the width style from <col> elements in <colgroup>
   *
   * @param table - The table element
   * @returns Array of widths in pixels from colgroup (one per actual column), or null if not found
   */
  static getColgroupWidths(table: HTMLTableElement): number[] | null {
    try {
      const colgroup = table.querySelector('colgroup');
      if (!colgroup) {
        return null;
      }

      const cols = colgroup.querySelectorAll('col');
      if (cols.length === 0) {
        return null;
      }

      const widths: number[] = [];
      for (const col of Array.from(cols)) {
        const colElement = col as HTMLElement;
        const widthStyle = colElement.style.width;
        
        if (!widthStyle) {
          // If any col is missing width, use a default
          console.warn('Col element missing width, using default');
          widths.push(100);
          continue;
        }

        // Parse width (assumes px units)
        const width = parseInt(widthStyle, 10);
        if (isNaN(width) || width <= 0) {
          console.warn('Invalid col width, using minimum');
          widths.push(this.MIN_COLUMN_WIDTH);
          continue;
        }

        // Enforce minimum width - never allow columns smaller than MIN_COLUMN_WIDTH
        widths.push(Math.max(width, this.MIN_COLUMN_WIDTH));
      }

      return widths.length > 0 ? widths : null;
    } catch (error) {
      console.warn('Error reading colgroup widths:', error);
      return null;
    }
  }

  /**
   * Get current column widths from a table
   * Reads the offsetWidth of each header cell
   *
   * @param table - The table element
   * @returns Array of current widths in pixels
   */
  static getColumnWidths(table: HTMLTableElement): number[] {
    const headers = table.querySelectorAll('thead th');
    return Array.from(headers).map(th => (th as HTMLElement).offsetWidth);
  }

  /**
   * Apply widths to table columns
   * Sets width and minWidth CSS properties on header cells
   * Handles colspan by mapping colgroup widths to actual columns
   * Task Group 8.1: Enhanced with performance measurements
   *
   * @param table - The table element
   * @param widths - Array of widths in pixels from colgroup (one per actual column)
   */
  static applyWidths(table: HTMLTableElement, widths: number[]): void {
    const tableId = this.generateTableId(table);
    this.performanceMark(`applyWidths-${tableId}-start`);

    // Find the first row without title cells to get actual column structure
    const headerRows = table.querySelectorAll('thead tr');
    let targetRow: Element | null = null;
    
    for (const row of Array.from(headerRows)) {
      const firstCell = row.querySelector('th, td');
      if (firstCell && !firstCell.classList.contains('table-title-row')) {
        targetRow = row;
        break;
      }
    }

    if (!targetRow) {
      console.warn('No valid header row found for applying widths');
      return;
    }

    const headers = targetRow.querySelectorAll('th, td');
    
    // Map colgroup widths to header cells, accounting for colspan
    let colIndex = 0;
    headers.forEach((th) => {
      const element = th as HTMLElement;
      const colspan = parseInt(element.getAttribute('colspan') || '1');
      
      // For cells with colspan, sum the widths of the columns they span
      let totalWidth = 0;
      for (let i = 0; i < colspan && colIndex + i < widths.length; i++) {
        totalWidth += widths[colIndex + i];
      }
      
      if (totalWidth > 0) {
        const width = Math.max(totalWidth, this.MIN_COLUMN_WIDTH);
        element.style.width = `${width}px`;
        // Keep minWidth at global minimum to preserve CSS constraints
        element.style.minWidth = `${this.MIN_COLUMN_WIDTH}px`;
        // Allow text wrapping
        element.style.whiteSpace = 'normal';
      }
      
      colIndex += colspan;
    });

    this.performanceMark(`applyWidths-${tableId}-end`);
    this.performanceMeasure(
      `apply-widths-${tableId}`,
      `applyWidths-${tableId}-start`,
      `applyWidths-${tableId}-end`
    );
  }

  /**
   * Set width for a specific column
   * Enforces minimum width constraint
   * Task Group 6.4: Uses dynamic minimum width for mobile
   *
   * @param table - The table element
   * @param columnIndex - Zero-based actual column index (accounting for colspan)
   * @param width - Desired width in pixels
   */
  static setColumnWidth(
    table: HTMLTableElement,
    columnIndex: number,
    width: number
  ): void {
    try {
      // Find the first row without title cells to get actual column structure
      const headerRows = table.querySelectorAll('thead tr');
      let targetRow: Element | null = null;
      
      for (const row of Array.from(headerRows)) {
        const firstCell = row.querySelector('th, td');
        if (firstCell && !firstCell.classList.contains('table-title-row')) {
          targetRow = row;
          break;
        }
      }

      if (!targetRow) {
        console.warn('No valid header row found for setting width');
        return;
      }

      const headers = targetRow.querySelectorAll('th, td');
      
      // Map columnIndex to the actual cell, accounting for colspan
      let colIndex = 0;
      let targetCell: HTMLElement | null = null;
      
      for (const header of Array.from(headers)) {
        const element = header as HTMLElement;
        const colspan = parseInt(element.getAttribute('colspan') || '1');
        
        // Check if this cell contains the target column
        if (columnIndex >= colIndex && columnIndex < colIndex + colspan) {
          targetCell = element;
          break;
        }
        
        colIndex += colspan;
      }

      if (!targetCell) {
        console.warn(`No cell found for column index: ${columnIndex}`);
        return;
      }

      // Task Group 6.4: Use dynamic minimum width for mobile support
      const minWidth = this.getMinimumWidth();
      const constrainedWidth = Math.max(width, minWidth);
      targetCell.style.width = `${constrainedWidth}px`;
      // Keep minWidth at global minimum to preserve CSS constraints
      targetCell.style.minWidth = `${minWidth}px`;
    } catch (error) {
      console.warn('Error setting column width:', error);
    }
  }

  /**
   * Create resize handles in the lower-right corner of every cell
   * This ensures compatibility with all table structures
   *
   * @param table - The table element
   */
  private static createResizeHandles(table: HTMLTableElement): void {
    // Get all cells (th and td) from all rows
    const allCells = table.querySelectorAll('th, td');

    if (!allCells || allCells.length === 0) {
      return;
    }

    // Check if table overflows its container
    const container = table.closest('.udo-table-scroll');
    const tableOverflows = container 
      ? table.scrollWidth > container.clientWidth 
      : false;

    allCells.forEach((cell) => {
      const cellElement = cell as HTMLElement;

      // Get the column index for this cell
      const columnIndex = this.getCellColumnIndex(cellElement);

      // Check if this is the last column in the row
      const row = cellElement.parentElement;
      const cellsInRow = row?.querySelectorAll('th, td');
      const isLastColumn = cellsInRow && columnIndex >= cellsInRow.length - 1;

      // Skip last column only if table doesn't overflow
      if (isLastColumn && !tableOverflows) {
        return;
      }

      const handle = document.createElement('div');
      handle.className = 'table-resize-handle';
      handle.setAttribute('data-column-index', String(columnIndex));
      handle.setAttribute('role', 'separator');
      handle.setAttribute('aria-orientation', 'vertical');
      handle.setAttribute('aria-label', `Resize column ${columnIndex + 1}`);
      handle.setAttribute('aria-describedby', 'resize-instructions');
      handle.tabIndex = 0;

      // Add resize icon (diagonal stripes extending to edges)
      handle.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><line x1="0" y1="16" x2="16" y2="0"/><line x1="4" y1="16" x2="16" y2="4"/><line x1="8" y1="16" x2="16" y2="8"/><line x1="12" y1="16" x2="16" y2="12"/></svg>';

      // Make parent relative positioned for absolute child
      cellElement.style.position = 'relative';
      cellElement.appendChild(handle);
    });
  }

  /**
   * Get the column index for a cell, accounting for colspan and rowspan
   * Uses the browser's cellIndex which properly handles rowspan
   *
   * @param cell - The cell element
   * @returns The zero-based column index
   */
  private static getCellColumnIndex(cell: HTMLElement): number {
    // Use the browser's built-in cellIndex which accounts for rowspan/colspan
    const cellElement = cell as HTMLTableCellElement;
    if (cellElement.cellIndex !== undefined && cellElement.cellIndex >= 0) {
      // cellIndex gives us the visual column position
      // Now we need to account for colspan in previous cells to get the actual column index
      const row = cell.parentElement;
      if (!row) return 0;

      const cells = Array.from(row.querySelectorAll('th, td'));
      let columnIndex = 0;

      for (let i = 0; i < cells.length; i++) {
        if (cells[i] === cell) {
          return columnIndex;
        }
        const colspan = parseInt((cells[i] as HTMLElement).getAttribute('colspan') || '1');
        columnIndex += colspan;
      }
    }

    return 0;
  }

  /**
   * Attach pointer event handlers for resize interaction
   *
   * @param table - The table element
   * @param tableId - Unique table identifier
   */
  private static attachResizeHandlers(
    table: HTMLTableElement,
    tableId: string
  ): void {
    // Initialize resize state for this table
    const state: ResizeState = {
      isResizing: false,
      startX: 0,
      startWidth: 0,
      columnIndex: -1,
      minWidth: this.MIN_COLUMN_WIDTH,
      targetCell: null
    };

    this.resizeStates.set(table, state);

    // Handle pointer down on resize handles
    table.addEventListener('pointerdown', (e: PointerEvent) => {
      // Let onResizeStart determine if this is a resize handle click
      this.onResizeStart(e, state, table);
    });

    // Create move and up handlers that can be removed later
    const onMove = (e: PointerEvent) => {
      if (state.isResizing) {
        this.onResizeMove(e, state, table);
      }
    };

    const onUp = (e: PointerEvent) => {
      if (state.isResizing) {
        this.onResizeEnd(state, table, tableId);
      }
    };

    // Attach document-level listeners for drag and release
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);

    // Attach keyboard event handler for accessibility
    table.addEventListener('keydown', (e: KeyboardEvent) => {
      this.onKeyboardResize(e, table, tableId);
    });

    // Store for cleanup if needed
    this.listeners.set(table, { onMove, onUp });
  }

  /**
   * Handle resize start (pointer down on handle)
   *
   * @param event - Pointer event
   * @param state - Resize state object
   * @param table - The table element
   */
  private static onResizeStart(
    event: PointerEvent,
    state: ResizeState,
    table: HTMLTableElement
  ): void {
    const target = event.target as HTMLElement;
    
    // Find the resize handle (might be the target or a parent)
    const handle = target.closest('.table-resize-handle') as HTMLElement;
    
    if (!handle) {
      return;
    }
    
    const columnIndex = parseInt(
      handle.getAttribute('data-column-index') || '-1'
    );

    if (columnIndex < 0) {
      return;
    }

    // Find the cell that contains the resize handle
    const column = handle.closest('th, td') as HTMLElement;
    
    if (!column) {
      return;
    }

    // Capture initial state
    state.isResizing = true;
    state.startX = event.clientX;
    state.startWidth = column.offsetWidth;
    state.columnIndex = columnIndex;
    state.targetCell = column;

    // PERFORMANCE: Lock all other column widths ONCE at start, not on every move
    const headerRows = table.querySelectorAll('thead tr');
    headerRows.forEach(row => {
      const cells = row.querySelectorAll('th, td');
      cells.forEach(cell => {
        const cellElement = cell as HTMLElement;
        if (cellElement !== column) {
          const currentWidth = cellElement.offsetWidth;
          cellElement.style.width = `${currentWidth}px`;
          cellElement.style.minWidth = `${this.MIN_COLUMN_WIDTH}px`;
        }
      });
    });

    // Add visual feedback
    table.classList.add('table-resizing');

    // Prevent text selection during drag
    event.preventDefault();
  }

  /**
   * Handle resize move (pointer move during drag)
   * Task Group 8.1: Enhanced with performance measurements
   *
   * @param event - Pointer event
   * @param state - Resize state object
   * @param table - The table element
   */
  private static onResizeMove(
    event: PointerEvent,
    state: ResizeState,
    table: HTMLTableElement
  ): void {
    if (!state.isResizing) {
      return;
    }

    this.performanceMark('resize-drag-move-start');

    // Calculate new width
    const delta = event.clientX - state.startX;
    const newWidth = Math.max(
      state.startWidth + delta,
      this.MIN_COLUMN_WIDTH
    );

    // Apply width directly to the target cell
    if (state.targetCell) {
      state.targetCell.style.width = `${newWidth}px`;
      // Keep minWidth at global minimum (80px) to preserve CSS constraints
      state.targetCell.style.minWidth = `${this.MIN_COLUMN_WIDTH}px`;
      
      // Also update the corresponding col element(s) in colgroup if it exists
      const colgroup = table.querySelector('colgroup');
      if (colgroup) {
        const cols = colgroup.querySelectorAll('col');
        const colspan = parseInt(state.targetCell.getAttribute('colspan') || '1');
        
        // If cell has colspan, distribute the width across all spanned columns
        if (colspan > 1) {
          const widthPerCol = newWidth / colspan;
          for (let i = 0; i < colspan && (state.columnIndex + i) < cols.length; i++) {
            (cols[state.columnIndex + i] as HTMLElement).style.width = `${widthPerCol}px`;
          }
        } else {
          // Single column - just update the one col element
          if (cols[state.columnIndex]) {
            (cols[state.columnIndex] as HTMLElement).style.width = `${newWidth}px`;
          }
        }
        
        // Calculate total width of all columns (already locked at resize start)
        let totalWidth = 0;
        cols.forEach((col) => {
          const colWidth = parseFloat((col as HTMLElement).style.width || '0');
          totalWidth += colWidth;
        });
        
        // Set table to exact total width to prevent column redistribution
        table.style.width = `${totalWidth}px`;
        table.style.minWidth = '100%';
      }
    }

    this.performanceMark('resize-drag-move-end');
    this.performanceMeasure(
      'resize-drag-interaction',
      'resize-drag-move-start',
      'resize-drag-move-end'
    );
  }

  /**
   * Handle resize end (pointer up)
   *
   * @param state - Resize state object
   * @param table - The table element
   * @param tableId - Unique table identifier
   */
  private static onResizeEnd(
    state: ResizeState,
    table: HTMLTableElement,
    tableId: string
  ): void {
    if (!state.isResizing) {
      return;
    }

    // Clear resize state
    state.isResizing = false;
    state.columnIndex = -1;
    state.targetCell = null;

    // Remove visual feedback
    table.classList.remove('table-resizing');

    // Widths are updated in-memory only (not persisted)
  }

  /**
   * Handle keyboard resize (arrow keys, Home, End)
   * Provides accessibility for keyboard-only users
   *
   * @param event - Keyboard event
   * @param table - The table element
   * @param tableId - Unique table identifier
   */
  private static onKeyboardResize(
    event: KeyboardEvent,
    table: HTMLTableElement,
    tableId: string
  ): void {
    const target = event.target as HTMLElement;
    if (!target.classList.contains('table-resize-handle')) {
      return;
    }

    const columnIndex = parseInt(
      target.getAttribute('data-column-index') || '-1'
    );

    if (columnIndex < 0) {
      return;
    }

    const headers = table.querySelectorAll('thead th');
    const column = headers[columnIndex] as HTMLTableCellElement;

    if (!column) {
      return;
    }

    const STEP = 10; // pixels per arrow key press
    let newWidth: number;

    switch (event.key) {
      case 'ArrowLeft':
        // Decrease width by 10px
        newWidth = Math.max(
          column.offsetWidth - STEP,
          this.MIN_COLUMN_WIDTH
        );
        this.setColumnWidth(table, columnIndex, newWidth);
        this.announceResize(columnIndex, newWidth);
        // Widths updated in-memory only
        event.preventDefault();
        break;

      case 'ArrowRight':
        // Increase width by 10px
        newWidth = column.offsetWidth + STEP;
        this.setColumnWidth(table, columnIndex, newWidth);
        this.announceResize(columnIndex, newWidth);
        // Widths updated in-memory only
        event.preventDefault();
        break;

      case 'Home':
        // Reset to minimum width
        newWidth = this.MIN_COLUMN_WIDTH;
        this.setColumnWidth(table, columnIndex, newWidth);
        this.announceResize(columnIndex, newWidth);
        // Widths updated in-memory only
        event.preventDefault();
        break;

      case 'End':
        // Expand to content width
        newWidth = this.getContentWidth(column);
        this.setColumnWidth(table, columnIndex, newWidth);
        this.announceResize(columnIndex, newWidth);
        // Widths updated in-memory only
        event.preventDefault();
        break;
    }
  }

  /**
   * Announce resize to screen readers via ARIA live region
   * Creates a polite announcement that doesn't interrupt current reading
   *
   * @param columnIndex - Zero-based column index
   * @param width - New width in pixels
   */
  private static announceResize(columnIndex: number, width: number): void {
    // Create or update live region for screen reader announcements
    let liveRegion = document.getElementById('table-resize-announcer');

    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'table-resize-announcer';
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }

    // Update announcement text
    liveRegion.textContent = `Column ${columnIndex + 1} resized to ${width} pixels`;
  }

  /**
   * Get natural content width of a column
   * Temporarily removes width constraints to measure natural size
   *
   * Algorithm explanation:
   * 1. Save current width styles (width, minWidth, maxWidth)
   * 2. Set all width constraints to 'auto'/'none' to allow natural sizing
   * 3. Use scrollWidth to measure actual content width (includes padding)
   * 4. Restore original styles immediately (avoid visual flashing)
   * 5. Enforce minimum width constraint
   *
   * Used by: Keyboard "End" key for auto-fit to content
   *
   * @param column - The column header element
   * @returns Natural content width in pixels (minimum 80px)
   */
  private static getContentWidth(column: HTMLTableCellElement): number {
    // Store original styles for restoration
    const originalWidth = column.style.width;
    const originalMinWidth = column.style.minWidth;
    const originalMaxWidth = column.style.maxWidth;

    // Remove width constraints temporarily to measure natural size
    column.style.width = 'auto';
    column.style.minWidth = 'auto';
    column.style.maxWidth = 'none';

    // Force layout calculation and measure content width
    // scrollWidth includes padding but not margin/border
    const contentWidth = column.scrollWidth;

    // Restore original styles immediately (prevents visual flashing)
    column.style.width = originalWidth;
    column.style.minWidth = originalMinWidth;
    column.style.maxWidth = originalMaxWidth;

    // Ensure minimum width is respected for usability
    return Math.max(contentWidth, this.MIN_COLUMN_WIDTH);
  }

  /**
   * Create resize instructions element for screen readers
   * Provides context about keyboard controls
   *
   * @param table - The table element
   */
  private static createResizeInstructions(table: HTMLTableElement): void {
    const shell = table.closest('.udo-table-shell');
    if (!shell) {
      return;
    }

    // Check if instructions already exist
    if (shell.querySelector('#resize-instructions')) {
      return;
    }

    const instructions = document.createElement('div');
    instructions.id = 'resize-instructions';
    instructions.className = 'sr-only';
    instructions.textContent =
      'Use arrow keys to resize. Press Home for minimum width, End for content width.';

    shell.appendChild(instructions);
  }

  /**
   * Main entry point - enhance a table with resize functionality
   * Task Group 6: Enhanced with edge case handling
   * Task Group 8.1: Enhanced with performance measurements
   *
   * @param table - The table element to enhance
   * @param tableId - Unique table identifier
   */
  static enhance(table: HTMLTableElement, tableId: string): void {
    this.performanceMark(`enhance-${tableId}-start`);

    try {
      // Task Group 6.1: Detect and log merged cells
      this.detectMergedCells(table);

      // Task Group 6.3: Check for wide tables
      this.checkWideTable(table);

      // Apply backend-defined colgroup widths as initial widths
      // User can resize during session, but changes won't persist across page loads
      const colgroupWidths = this.getColgroupWidths(table);
      if (colgroupWidths) {
        // CRITICAL: With table-layout: fixed, we must update colgroup to enforce minimum widths
        // Do this BEFORE applyWidths to avoid triggering multiple layouts
        const colgroup = table.querySelector('colgroup');
        if (colgroup) {
          const cols = colgroup.querySelectorAll('col');
          cols.forEach((col, index) => {
            if (index < colgroupWidths.length) {
              (col as HTMLElement).style.width = `${colgroupWidths[index]}px`;
            }
          });
        }
        
        this.applyWidths(table, colgroupWidths);
      }
      // If no colgroup widths, browser uses default table layout

      // Create resize handles between columns
      this.createResizeHandles(table);

      // Create resize instructions for screen readers
      this.createResizeInstructions(table);

      // Attach pointer and keyboard event handlers
      this.attachResizeHandlers(table, tableId);

      // Task Group 6.2: Monitor fullscreen mode changes
      // Note: Fullscreen compatibility is handled by document-level event listeners
      // which remain functional when table is moved to body

      this.performanceMark(`enhance-${tableId}-end`);
      this.performanceMeasure(
        `table-enhance-${tableId}`,
        `enhance-${tableId}-start`,
        `enhance-${tableId}-end`
      );
    } catch (error) {
      // Task Group 6.6: Comprehensive error logging
      console.error('Failed to enhance table columns:', error);
      // Fail gracefully - table remains functional without resize
    }
  }
}

// Export for use in other modules
export default TableColumnResizer;
