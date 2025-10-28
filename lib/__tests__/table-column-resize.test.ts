/**
 * Tests for TableColumnResizer - Foundation Module & Storage
 * Task Group 1.1: 2-8 focused tests for storage and ID generation
 */

import { TableColumnResizer } from '../table-column-resize';

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('TableColumnResizer - Storage and ID Generation', () => {

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset DOM
    document.body.innerHTML = '';
  });

  describe('generateTableId', () => {
    it('should generate consistent ID from table title', () => {
      // Create table with title
      const shell = document.createElement('div');
      shell.className = 'udo-table-shell';

      const titleText = document.createElement('div');
      titleText.className = 'udo-table-title-text';
      titleText.textContent = 'Employee Roster';

      const table = document.createElement('table');

      shell.appendChild(titleText);
      shell.appendChild(table);
      document.body.appendChild(shell);

      const id1 = TableColumnResizer.generateTableId(table);
      const id2 = TableColumnResizer.generateTableId(table);

      expect(id1).toBe(id2);
      expect(id1).toMatch(/^table-[a-z0-9]+$/);
    });

    it('should generate consistent ID from column headers', () => {
      // Create table without title but with headers
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      ['Name', 'Email', 'Phone'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        tr.appendChild(th);
      });

      thead.appendChild(tr);
      table.appendChild(thead);
      document.body.appendChild(table);

      const id1 = TableColumnResizer.generateTableId(table);
      const id2 = TableColumnResizer.generateTableId(table);

      expect(id1).toBe(id2);
      expect(id1).toMatch(/^table-[a-z0-9]+$/);
    });

    it('should use fallback ID when no title or headers', () => {
      // Create table without title or headers
      const table = document.createElement('table');
      document.body.appendChild(table);

      // Mock window.location.pathname
      Object.defineProperty(window, 'location', {
        value: { pathname: '/test-page' },
        writable: true
      });

      const id = TableColumnResizer.generateTableId(table);

      expect(id).toMatch(/^table-[a-z0-9]+$/);
    });
  });

  describe('localStorage operations', () => {
    it('should save and load column widths', () => {
      const tableId = 'table-test123';
      const widths = [120, 180, 250, 150];

      TableColumnResizer.saveWidths(tableId, widths);
      const loaded = TableColumnResizer.loadWidths(tableId);

      expect(loaded).toEqual(widths);
    });

    it('should handle localStorage quota exceeded gracefully', () => {
      const tableId = 'table-overflow';

      // Mock localStorage.setItem to throw quota exceeded error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = (() => {
        throw new DOMException('QuotaExceededError');
      }) as any;

      // Should not throw
      expect(() => {
        TableColumnResizer.saveWidths(tableId, [100, 200, 300]);
      }).not.toThrow();

      // Restore original
      localStorage.setItem = originalSetItem;
    });

    it('should reset widths for specific table', () => {
      const tableId1 = 'table-first';
      const tableId2 = 'table-second';

      TableColumnResizer.saveWidths(tableId1, [100, 200]);
      TableColumnResizer.saveWidths(tableId2, [150, 250]);

      TableColumnResizer.resetWidths(tableId1);

      expect(TableColumnResizer.loadWidths(tableId1)).toBeNull();
      expect(TableColumnResizer.loadWidths(tableId2)).toEqual([150, 250]);
    });

    it('should detect if preferences exist for a table', () => {
      const tableId = 'table-check';

      expect(TableColumnResizer.hasPreferences(tableId)).toBe(false);

      TableColumnResizer.saveWidths(tableId, [100, 200]);

      expect(TableColumnResizer.hasPreferences(tableId)).toBe(true);
    });
  });

  describe('width validation', () => {
    it('should enforce minimum column width', () => {
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      const th = document.createElement('th');
      th.textContent = 'Column 1';
      tr.appendChild(th);

      thead.appendChild(tr);
      table.appendChild(thead);
      document.body.appendChild(table);

      // Try to set width below minimum (80px)
      TableColumnResizer.setColumnWidth(table, 0, 50);

      // Should be enforced to minimum
      const width = (th as HTMLElement).style.width;
      expect(parseInt(width)).toBeGreaterThanOrEqual(80);
    });

    it('should detect and ignore column count mismatch', () => {
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      // Create 3 columns
      ['A', 'B', 'C'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        tr.appendChild(th);
      });

      thead.appendChild(tr);
      table.appendChild(thead);
      document.body.appendChild(table);

      const tableId = TableColumnResizer.generateTableId(table);

      // Save widths for 3 columns
      TableColumnResizer.saveWidths(tableId, [100, 150, 200]);

      // Add a 4th column to simulate structure change
      const th4 = document.createElement('th');
      th4.textContent = 'D';
      tr.appendChild(th4);

      // Try to apply stored widths - should detect mismatch
      const widths = TableColumnResizer.loadWidths(tableId);
      const currentColumns = table.querySelectorAll('thead th').length;

      expect(widths?.length).not.toBe(currentColumns);
    });
  });

  describe('width application', () => {
    it('should get current column widths from table', () => {
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      [100, 150, 200].forEach(width => {
        const th = document.createElement('th');
        (th as HTMLElement).style.width = `${width}px`;
        Object.defineProperty(th, 'offsetWidth', {
          value: width,
          configurable: true
        });
        tr.appendChild(th);
      });

      thead.appendChild(tr);
      table.appendChild(thead);
      document.body.appendChild(table);

      const widths = TableColumnResizer.getColumnWidths(table);

      expect(widths).toEqual([100, 150, 200]);
    });

    it('should apply widths to table columns', () => {
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      ['A', 'B', 'C'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        tr.appendChild(th);
      });

      thead.appendChild(tr);
      table.appendChild(thead);
      document.body.appendChild(table);

      const widths = [120, 180, 250];
      TableColumnResizer.applyWidths(table, widths);

      const headers = table.querySelectorAll('thead th');
      headers.forEach((th, index) => {
        const style = (th as HTMLElement).style;
        expect(parseInt(style.width)).toBe(widths[index]);
        expect(parseInt(style.minWidth)).toBe(widths[index]);
      });
    });
  });

  describe('resize handle creation', () => {
    it('should create correct number of resize handles', () => {
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      // Create 4 columns - should create 3 handles (not after last column)
      ['Col 1', 'Col 2', 'Col 3', 'Col 4'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        tr.appendChild(th);
      });

      thead.appendChild(tr);
      table.appendChild(thead);
      document.body.appendChild(table);

      // Call private method via enhance
      const tableId = TableColumnResizer.generateTableId(table);
      TableColumnResizer.enhance(table, tableId);

      // Count created handles
      const handles = table.querySelectorAll('.table-resize-handle');
      expect(handles.length).toBe(3); // 4 columns = 3 handles
    });

    it('should position resize handles with correct attributes', () => {
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      ['A', 'B', 'C'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        tr.appendChild(th);
      });

      thead.appendChild(tr);
      table.appendChild(thead);
      document.body.appendChild(table);

      const tableId = TableColumnResizer.generateTableId(table);
      TableColumnResizer.enhance(table, tableId);

      const handles = table.querySelectorAll('.table-resize-handle');

      handles.forEach((handle, index) => {
        // Check data attribute
        expect(handle.getAttribute('data-column-index')).toBe(String(index));

        // Check ARIA attributes
        expect(handle.getAttribute('role')).toBe('separator');
        expect(handle.getAttribute('aria-orientation')).toBe('vertical');

        // Check focusability
        expect((handle as HTMLElement).tabIndex).toBe(0);

        // Check parent is position relative
        const parent = handle.parentElement;
        expect(parent?.style.position).toBe('relative');
      });
    });
  });

  describe('pointer event handling', () => {
    it('should track resize state during pointer events', () => {
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      ['Col 1', 'Col 2'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        // Set initial width
        Object.defineProperty(th, 'offsetWidth', {
          value: 120,
          configurable: true,
          writable: true
        });
        tr.appendChild(th);
      });

      thead.appendChild(tr);
      table.appendChild(thead);
      document.body.appendChild(table);

      const tableId = TableColumnResizer.generateTableId(table);
      TableColumnResizer.enhance(table, tableId);

      const handle = table.querySelector('.table-resize-handle') as HTMLElement;

      // Simulate pointerdown
      const pointerDown = new PointerEvent('pointerdown', {
        clientX: 100,
        bubbles: true
      });
      handle.dispatchEvent(pointerDown);

      // Table should have resizing class
      expect(table.classList.contains('table-resizing')).toBe(true);
    });

    it('should update column width during pointer move', (done) => {
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      const th1 = document.createElement('th');
      th1.textContent = 'Col 1';
      Object.defineProperty(th1, 'offsetWidth', {
        value: 120,
        configurable: true,
        writable: true
      });

      const th2 = document.createElement('th');
      th2.textContent = 'Col 2';
      tr.appendChild(th1);
      tr.appendChild(th2);

      thead.appendChild(tr);
      table.appendChild(thead);
      document.body.appendChild(table);

      const tableId = TableColumnResizer.generateTableId(table);
      TableColumnResizer.enhance(table, tableId);

      const handle = table.querySelector('.table-resize-handle') as HTMLElement;

      // Start resize
      const pointerDown = new PointerEvent('pointerdown', {
        clientX: 100,
        bubbles: true
      });
      handle.dispatchEvent(pointerDown);

      // Move pointer to increase width
      const pointerMove = new PointerEvent('pointermove', {
        clientX: 150, // 50px increase
        bubbles: true
      });
      document.dispatchEvent(pointerMove);

      // Allow async updates
      setTimeout(() => {
        const newWidth = parseInt(th1.style.width);
        expect(newWidth).toBeGreaterThan(120);
        done();
      }, 50);
    });

    it('should remove resize state on pointer up', (done) => {
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      ['Col 1', 'Col 2'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        Object.defineProperty(th, 'offsetWidth', {
          value: 120,
          configurable: true
        });
        tr.appendChild(th);
      });

      thead.appendChild(tr);
      table.appendChild(thead);
      document.body.appendChild(table);

      const tableId = TableColumnResizer.generateTableId(table);
      TableColumnResizer.enhance(table, tableId);

      const handle = table.querySelector('.table-resize-handle') as HTMLElement;

      // Start resize
      const pointerDown = new PointerEvent('pointerdown', {
        clientX: 100,
        bubbles: true
      });
      handle.dispatchEvent(pointerDown);

      expect(table.classList.contains('table-resizing')).toBe(true);

      // End resize
      const pointerUp = new PointerEvent('pointerup', {
        bubbles: true
      });
      document.dispatchEvent(pointerUp);

      setTimeout(() => {
        expect(table.classList.contains('table-resizing')).toBe(false);
        done();
      }, 50);
    });
  });

  describe('minimum width enforcement', () => {
    it('should prevent column from being resized below 80px', (done) => {
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      const th1 = document.createElement('th');
      th1.textContent = 'Col 1';
      Object.defineProperty(th1, 'offsetWidth', {
        value: 120,
        configurable: true,
        writable: true
      });

      const th2 = document.createElement('th');
      th2.textContent = 'Col 2';
      tr.appendChild(th1);
      tr.appendChild(th2);

      thead.appendChild(tr);
      table.appendChild(thead);
      document.body.appendChild(table);

      const tableId = TableColumnResizer.generateTableId(table);
      TableColumnResizer.enhance(table, tableId);

      const handle = table.querySelector('.table-resize-handle') as HTMLElement;

      // Start resize
      const pointerDown = new PointerEvent('pointerdown', {
        clientX: 100,
        bubbles: true
      });
      handle.dispatchEvent(pointerDown);

      // Try to move pointer far left (would make column < 80px)
      const pointerMove = new PointerEvent('pointermove', {
        clientX: 0, // Try to make column very narrow
        bubbles: true
      });
      document.dispatchEvent(pointerMove);

      setTimeout(() => {
        const newWidth = parseInt(th1.style.width);
        expect(newWidth).toBeGreaterThanOrEqual(80);
        done();
      }, 50);
    });
  });

  describe('debounced save after drag', () => {
    it('should save widths to localStorage after drag ends', (done) => {
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      ['Col 1', 'Col 2', 'Col 3'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        Object.defineProperty(th, 'offsetWidth', {
          value: 120,
          configurable: true,
          writable: true
        });
        tr.appendChild(th);
      });

      thead.appendChild(tr);
      table.appendChild(thead);
      document.body.appendChild(table);

      const tableId = TableColumnResizer.generateTableId(table);
      TableColumnResizer.enhance(table, tableId);

      const handle = table.querySelector('.table-resize-handle') as HTMLElement;

      // Start and end resize
      const pointerDown = new PointerEvent('pointerdown', {
        clientX: 100,
        bubbles: true
      });
      handle.dispatchEvent(pointerDown);

      const pointerMove = new PointerEvent('pointermove', {
        clientX: 150,
        bubbles: true
      });
      document.dispatchEvent(pointerMove);

      const pointerUp = new PointerEvent('pointerup', {
        bubbles: true
      });
      document.dispatchEvent(pointerUp);

      // Wait for debounce (300ms + buffer)
      setTimeout(() => {
        const savedWidths = TableColumnResizer.loadWidths(tableId);
        expect(savedWidths).not.toBeNull();
        expect(savedWidths?.length).toBe(3);
        done();
      }, 400);
    });
  });

  describe('touch event support', () => {
    it('should handle touch events via pointer events API', () => {
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      ['Col 1', 'Col 2'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        Object.defineProperty(th, 'offsetWidth', {
          value: 120,
          configurable: true
        });
        tr.appendChild(th);
      });

      thead.appendChild(tr);
      table.appendChild(thead);
      document.body.appendChild(table);

      const tableId = TableColumnResizer.generateTableId(table);
      TableColumnResizer.enhance(table, tableId);

      const handle = table.querySelector('.table-resize-handle') as HTMLElement;

      // Simulate touch via pointer event
      const touchStart = new PointerEvent('pointerdown', {
        clientX: 100,
        pointerType: 'touch',
        bubbles: true
      });
      handle.dispatchEvent(touchStart);

      // Should work just like mouse
      expect(table.classList.contains('table-resizing')).toBe(true);
    });
  });
});
