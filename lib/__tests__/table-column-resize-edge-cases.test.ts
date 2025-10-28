/**
 * Tests for TableColumnResizer - Edge Cases & Error Handling
 * Task Group 6: Comprehensive edge case testing
 */

import { TableColumnResizer, MergedCellInfo } from '../table-column-resize';

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  let quotaExceeded = false;
  let disabled = false;

  return {
    getItem: (key: string) => {
      if (disabled) throw new Error('localStorage is disabled');
      return store[key] || null;
    },
    setItem: (key: string, value: string) => {
      if (disabled) throw new Error('localStorage is disabled');
      if (quotaExceeded) throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      store[key] = value;
    },
    removeItem: (key: string) => {
      if (disabled) throw new Error('localStorage is disabled');
      delete store[key];
    },
    clear: () => {
      store = {};
      quotaExceeded = false;
      disabled = false;
    },
    setQuotaExceeded: (value: boolean) => {
      quotaExceeded = value;
    },
    setDisabled: (value: boolean) => {
      disabled = value;
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('TableColumnResizer - Edge Cases & Error Handling', () => {
  beforeEach(() => {
    // Clear localStorage and reset flags before each test
    localStorage.clear();
    // Reset DOM
    document.body.innerHTML = '';
    // Reset window size to desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });
  });

  describe('Task Group 6.1: Merged Cells (colspan/rowspan)', () => {
    it('should detect tables with colspan cells', () => {
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      // First cell spans 2 columns
      const th1 = document.createElement('th');
      th1.setAttribute('colspan', '2');
      th1.textContent = 'Merged Header';

      const th2 = document.createElement('th');
      th2.textContent = 'Normal Header';

      tr.appendChild(th1);
      tr.appendChild(th2);
      thead.appendChild(tr);
      table.appendChild(thead);
      document.body.appendChild(table);

      const mergedInfo: MergedCellInfo = TableColumnResizer.detectMergedCells(table);

      expect(mergedInfo.hasMergedCells).toBe(true);
      expect(mergedInfo.mergedCellCount).toBe(1);
      expect(mergedInfo.affectedColumns.size).toBeGreaterThan(0);
    });

    it('should detect tables with rowspan cells', () => {
      const table = document.createElement('table');
      const tbody = document.createElement('tbody');

      // First row
      const tr1 = document.createElement('tr');
      const td1 = document.createElement('td');
      td1.setAttribute('rowspan', '2');
      td1.textContent = 'Merged Cell';
      const td2 = document.createElement('td');
      td2.textContent = 'Cell 1';
      tr1.appendChild(td1);
      tr1.appendChild(td2);

      // Second row
      const tr2 = document.createElement('tr');
      const td3 = document.createElement('td');
      td3.textContent = 'Cell 2';
      tr2.appendChild(td3);

      tbody.appendChild(tr1);
      tbody.appendChild(tr2);
      table.appendChild(tbody);
      document.body.appendChild(table);

      const mergedInfo: MergedCellInfo = TableColumnResizer.detectMergedCells(table);

      expect(mergedInfo.hasMergedCells).toBe(true);
      expect(mergedInfo.mergedCellCount).toBe(1);
    });

    it('should handle tables without merged cells', () => {
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      ['Column 1', 'Column 2', 'Column 3'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        tr.appendChild(th);
      });

      thead.appendChild(tr);
      table.appendChild(thead);
      document.body.appendChild(table);

      const mergedInfo: MergedCellInfo = TableColumnResizer.detectMergedCells(table);

      expect(mergedInfo.hasMergedCells).toBe(false);
      expect(mergedInfo.mergedCellCount).toBe(0);
      expect(mergedInfo.affectedColumns.size).toBe(0);
    });

    it('should still allow resize with merged cells', () => {
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      // Merged cell
      const th1 = document.createElement('th');
      th1.setAttribute('colspan', '2');
      th1.textContent = 'Merged';

      const th2 = document.createElement('th');
      th2.textContent = 'Normal';

      tr.appendChild(th1);
      tr.appendChild(th2);
      thead.appendChild(tr);
      table.appendChild(thead);
      document.body.appendChild(table);

      const tableId = TableColumnResizer.generateTableId(table);

      // Should not throw error
      expect(() => {
        TableColumnResizer.enhance(table, tableId);
      }).not.toThrow();

      // Verify resize handles were created
      const handles = table.querySelectorAll('.table-resize-handle');
      expect(handles.length).toBeGreaterThan(0);
    });
  });

  describe('Task Group 6.2: Fullscreen Mode Compatibility', () => {
    it('should detect when table is in fullscreen mode', () => {
      const shell = document.createElement('div');
      shell.className = 'udo-table-shell udo-table-shell--fullscreen';

      const table = document.createElement('table');
      shell.appendChild(table);
      document.body.appendChild(shell);

      const isFullscreen = TableColumnResizer.isInFullscreenMode(table);
      expect(isFullscreen).toBe(true);
    });

    it('should detect when table is not in fullscreen mode', () => {
      const shell = document.createElement('div');
      shell.className = 'udo-table-shell';

      const table = document.createElement('table');
      shell.appendChild(table);
      document.body.appendChild(shell);

      const isFullscreen = TableColumnResizer.isInFullscreenMode(table);
      expect(isFullscreen).toBe(false);
    });

    it('should handle fullscreen mode toggle gracefully', () => {
      const shell = document.createElement('div');
      shell.className = 'udo-table-shell';

      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      ['Col 1', 'Col 2'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        tr.appendChild(th);
      });

      thead.appendChild(tr);
      table.appendChild(thead);
      shell.appendChild(table);
      document.body.appendChild(shell);

      const tableId = TableColumnResizer.generateTableId(table);
      TableColumnResizer.enhance(table, tableId);

      // Toggle fullscreen
      shell.classList.add('udo-table-shell--fullscreen');

      // Should still be functional
      const isFullscreen = TableColumnResizer.isInFullscreenMode(table);
      expect(isFullscreen).toBe(true);

      const handles = table.querySelectorAll('.table-resize-handle');
      expect(handles.length).toBeGreaterThan(0);
    });
  });

  describe('Task Group 6.3: Very Wide Tables (100+ columns)', () => {
    it('should log warning for tables with 100+ columns', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      // Create 105 columns
      for (let i = 0; i < 105; i++) {
        const th = document.createElement('th');
        th.textContent = `Col ${i + 1}`;
        tr.appendChild(th);
      }

      thead.appendChild(tr);
      table.appendChild(thead);
      document.body.appendChild(table);

      const tableId = TableColumnResizer.generateTableId(table);
      TableColumnResizer.enhance(table, tableId);

      // Should have logged warning
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('105 columns')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should not log warning for tables under 100 columns', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      // Create 50 columns
      for (let i = 0; i < 50; i++) {
        const th = document.createElement('th');
        th.textContent = `Col ${i + 1}`;
        tr.appendChild(th);
      }

      thead.appendChild(tr);
      table.appendChild(thead);
      document.body.appendChild(table);

      const tableId = TableColumnResizer.generateTableId(table);
      TableColumnResizer.enhance(table, tableId);

      // Should not have logged warning about column count
      const calls = consoleWarnSpy.mock.calls.filter(call =>
        call[0]?.toString().includes('columns')
      );
      expect(calls.length).toBe(0);

      consoleWarnSpy.mockRestore();
    });

    it('should still function with 100+ columns', () => {
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      // Create 105 columns
      for (let i = 0; i < 105; i++) {
        const th = document.createElement('th');
        th.textContent = `Col ${i + 1}`;
        tr.appendChild(th);
      }

      thead.appendChild(tr);
      table.appendChild(thead);
      document.body.appendChild(table);

      const tableId = TableColumnResizer.generateTableId(table);

      // Should not throw error
      expect(() => {
        TableColumnResizer.enhance(table, tableId);
      }).not.toThrow();

      // Verify widths can be saved
      const widths = TableColumnResizer.getColumnWidths(table);
      expect(widths.length).toBe(105);

      // Should not throw when saving
      expect(() => {
        TableColumnResizer.saveWidths(tableId, widths);
      }).not.toThrow();
    });
  });

  describe('Task Group 6.4: Mobile Viewport Constraints', () => {
    it('should enforce 80px minimum on mobile viewport', () => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375 // iPhone size
      });

      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      const th = document.createElement('th');
      th.textContent = 'Column';
      tr.appendChild(th);
      thead.appendChild(tr);
      table.appendChild(thead);
      document.body.appendChild(table);

      // Try to set width below minimum
      TableColumnResizer.setColumnWidth(table, 0, 50);

      const thElement = thead.querySelector('th') as HTMLElement;
      const width = parseInt(thElement.style.width);

      expect(width).toBeGreaterThanOrEqual(80);
    });

    it('should apply stored widths on mobile', () => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      ['Col 1', 'Col 2', 'Col 3'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        tr.appendChild(th);
      });

      thead.appendChild(tr);
      table.appendChild(thead);
      document.body.appendChild(table);

      const tableId = TableColumnResizer.generateTableId(table);
      const widths = [120, 150, 100];

      // Save widths
      TableColumnResizer.saveWidths(tableId, widths);

      // Wait for debounce
      jest.advanceTimersByTime(300);

      // Apply widths
      TableColumnResizer.applyWidths(table, widths);

      const headers = table.querySelectorAll('thead th');
      headers.forEach((th, index) => {
        const element = th as HTMLElement;
        const width = parseInt(element.style.width);
        expect(width).toBe(widths[index]);
      });
    });
  });

  describe('Task Group 6.5: localStorage Edge Cases', () => {
    it('should handle localStorage disabled gracefully', () => {
      localStorageMock.setDisabled(true);

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const tableId = 'test-table';
      const widths = [100, 150, 120];

      // Should not throw
      expect(() => {
        TableColumnResizer.saveWidths(tableId, widths);
      }).not.toThrow();

      // Should log warning
      jest.advanceTimersByTime(300);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('localStorage not available')
      );

      consoleWarnSpy.mockRestore();
      localStorageMock.setDisabled(false);
    });

    it('should handle localStorage quota exceeded', () => {
      localStorageMock.setQuotaExceeded(true);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const tableId = 'test-table';
      const widths = [100, 150, 120];

      // Should not throw
      expect(() => {
        TableColumnResizer.saveWidths(tableId, widths);
      }).not.toThrow();

      // Wait for debounce
      jest.advanceTimersByTime(300);

      // Should log error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('quota exceeded'),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
      localStorageMock.setQuotaExceeded(false);
    });

    it('should handle invalid JSON in storage', () => {
      // Manually set invalid JSON
      const store = (localStorage as any);
      store.store = { 'udo-table-column-widths': '{invalid json}' };

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const tableId = 'test-table';
      const widths = TableColumnResizer.loadWidths(tableId);

      // Should return null instead of throwing
      expect(widths).toBeNull();

      // Should log warning
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid JSON'),
        expect.any(Error)
      );

      consoleWarnSpy.mockRestore();
    });

    it('should clear corrupted storage data', () => {
      // Set invalid JSON
      const store = (localStorage as any);
      store.store = { 'udo-table-column-widths': '{invalid json}' };

      // Try to load (which triggers cleanup)
      TableColumnResizer.loadWidths('test-table');

      // Storage should be cleared
      const stored = localStorage.getItem('udo-table-column-widths');
      expect(stored).toBeNull();
    });

    it('should function without localStorage', () => {
      localStorageMock.setDisabled(true);

      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      ['Col 1', 'Col 2'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        tr.appendChild(th);
      });

      thead.appendChild(tr);
      table.appendChild(thead);
      document.body.appendChild(table);

      const tableId = TableColumnResizer.generateTableId(table);

      // Should not throw
      expect(() => {
        TableColumnResizer.enhance(table, tableId);
      }).not.toThrow();

      // Resize should still work (just won't persist)
      expect(() => {
        TableColumnResizer.setColumnWidth(table, 0, 200);
      }).not.toThrow();

      localStorageMock.setDisabled(false);
    });
  });

  describe('Task Group 6.6: Error Boundaries and Logging', () => {
    it('should wrap enhance in try-catch', () => {
      const table = document.createElement('table');
      const tableId = 'test-table';

      // Force an error by providing null table
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Should not throw even with invalid input
      expect(() => {
        TableColumnResizer.enhance(null as any, tableId);
      }).not.toThrow();

      consoleErrorSpy.mockRestore();
    });

    it('should use console.warn for non-critical failures', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      const th = document.createElement('th');
      th.textContent = 'Column';
      tr.appendChild(th);
      thead.appendChild(tr);
      table.appendChild(thead);
      document.body.appendChild(table);

      // Try to set invalid column index
      TableColumnResizer.setColumnWidth(table, 999, 100);

      // Should log warning
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid column index')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should use console.error only for critical failures', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      localStorageMock.setQuotaExceeded(true);

      const tableId = 'test-table';
      const widths = [100, 150, 120];

      TableColumnResizer.saveWidths(tableId, widths);
      jest.advanceTimersByTime(300);

      // Should use console.error for quota exceeded
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('quota exceeded'),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
      localStorageMock.setQuotaExceeded(false);
    });

    it('should never throw errors that break table rendering', () => {
      const table = document.createElement('table');
      document.body.appendChild(table);

      const tableId = 'test-table';

      // All these should fail gracefully
      expect(() => TableColumnResizer.enhance(table, tableId)).not.toThrow();
      expect(() => TableColumnResizer.saveWidths(tableId, [])).not.toThrow();
      expect(() => TableColumnResizer.loadWidths(tableId)).not.toThrow();
      expect(() => TableColumnResizer.resetWidths(tableId)).not.toThrow();
      expect(() => TableColumnResizer.getColumnWidths(table)).not.toThrow();
      expect(() => TableColumnResizer.applyWidths(table, [])).not.toThrow();
      expect(() => TableColumnResizer.setColumnWidth(table, 0, 100)).not.toThrow();
      expect(() => TableColumnResizer.detectMergedCells(table)).not.toThrow();
      expect(() => TableColumnResizer.isInFullscreenMode(table)).not.toThrow();
    });

    it('should log clear error messages', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      localStorageMock.setDisabled(true);

      TableColumnResizer.saveWidths('test', [100]);
      jest.advanceTimersByTime(300);

      // Error message should be clear and actionable
      const lastCall = consoleWarnSpy.mock.calls[consoleWarnSpy.mock.calls.length - 1];
      expect(lastCall[0]).toContain('localStorage');
      expect(lastCall[0]).toContain('not available');

      consoleWarnSpy.mockRestore();
      localStorageMock.setDisabled(false);
    });
  });

  describe('Integration: Edge Cases Combined', () => {
    it('should handle merged cells + fullscreen + wide table', () => {
      const shell = document.createElement('div');
      shell.className = 'udo-table-shell udo-table-shell--fullscreen';

      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      // Create 105 columns with some merged cells
      for (let i = 0; i < 105; i++) {
        const th = document.createElement('th');
        if (i % 10 === 0 && i > 0) {
          th.setAttribute('colspan', '2');
        }
        th.textContent = `Col ${i + 1}`;
        tr.appendChild(th);
      }

      thead.appendChild(tr);
      table.appendChild(thead);
      shell.appendChild(table);
      document.body.appendChild(shell);

      const tableId = TableColumnResizer.generateTableId(table);

      // Should handle all edge cases gracefully
      expect(() => {
        TableColumnResizer.enhance(table, tableId);
      }).not.toThrow();

      expect(TableColumnResizer.isInFullscreenMode(table)).toBe(true);

      const mergedInfo = TableColumnResizer.detectMergedCells(table);
      expect(mergedInfo.hasMergedCells).toBe(true);
    });

    it('should handle mobile + localStorage disabled + merged cells', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      localStorageMock.setDisabled(true);

      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      const th1 = document.createElement('th');
      th1.setAttribute('colspan', '2');
      th1.textContent = 'Merged';

      const th2 = document.createElement('th');
      th2.textContent = 'Normal';

      tr.appendChild(th1);
      tr.appendChild(th2);
      thead.appendChild(tr);
      table.appendChild(thead);
      document.body.appendChild(table);

      const tableId = TableColumnResizer.generateTableId(table);

      // Should handle all edge cases gracefully
      expect(() => {
        TableColumnResizer.enhance(table, tableId);
      }).not.toThrow();

      // Resize should still work
      expect(() => {
        TableColumnResizer.setColumnWidth(table, 1, 150);
      }).not.toThrow();

      localStorageMock.setDisabled(false);
    });
  });
});

// Use fake timers for debounce testing
beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});
