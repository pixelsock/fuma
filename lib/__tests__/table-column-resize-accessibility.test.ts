/**
 * Tests for TableColumnResizer - Accessibility Features
 * Task Group 4.1: 2-8 focused tests for keyboard and screen reader support
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

describe('TableColumnResizer - Accessibility Features', () => {

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset DOM
    document.body.innerHTML = '';
  });

  describe('keyboard resize with arrow keys', () => {
    it('should decrease width with ArrowLeft key', (done) => {
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      const th1 = document.createElement('th');
      th1.textContent = 'Col 1';
      Object.defineProperty(th1, 'offsetWidth', {
        value: 150,
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

      // Focus the handle and press ArrowLeft
      handle.focus();
      const keyEvent = new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true,
        cancelable: true
      });

      table.dispatchEvent(keyEvent);

      setTimeout(() => {
        const newWidth = parseInt(th1.style.width);
        expect(newWidth).toBeLessThan(150);
        expect(newWidth).toBe(140); // 150 - 10 = 140
        done();
      }, 50);
    });

    it('should increase width with ArrowRight key', (done) => {
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

      // Focus the handle and press ArrowRight
      handle.focus();
      const keyEvent = new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true
      });

      table.dispatchEvent(keyEvent);

      setTimeout(() => {
        const newWidth = parseInt(th1.style.width);
        expect(newWidth).toBeGreaterThan(120);
        expect(newWidth).toBe(130); // 120 + 10 = 130
        done();
      }, 50);
    });
  });

  describe('Home key resets to minimum width', () => {
    it('should set column width to 80px with Home key', (done) => {
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      const th1 = document.createElement('th');
      th1.textContent = 'Col 1';
      Object.defineProperty(th1, 'offsetWidth', {
        value: 200,
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

      // Focus the handle and press Home
      handle.focus();
      const keyEvent = new KeyboardEvent('keydown', {
        key: 'Home',
        bubbles: true,
        cancelable: true
      });

      table.dispatchEvent(keyEvent);

      setTimeout(() => {
        const newWidth = parseInt(th1.style.width);
        expect(newWidth).toBe(80); // Minimum width
        done();
      }, 50);
    });
  });

  describe('End key expands to content width', () => {
    it('should expand column to content width with End key', (done) => {
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      const th1 = document.createElement('th');
      th1.textContent = 'Very Long Column Header Text That Should Expand';

      // Mock scrollWidth to simulate content width
      Object.defineProperty(th1, 'scrollWidth', {
        value: 300,
        configurable: true
      });

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

      // Focus the handle and press End
      handle.focus();
      const keyEvent = new KeyboardEvent('keydown', {
        key: 'End',
        bubbles: true,
        cancelable: true
      });

      table.dispatchEvent(keyEvent);

      setTimeout(() => {
        const newWidth = parseInt(th1.style.width);
        expect(newWidth).toBeGreaterThan(120);
        expect(newWidth).toBe(300); // Should match scrollWidth
        done();
      }, 50);
    });
  });

  describe('focus indicators appear on handles', () => {
    it('should make resize handles focusable with tabIndex 0', () => {
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
      TableColumnResizer.enhance(table, tableId);

      const handles = table.querySelectorAll('.table-resize-handle');

      handles.forEach(handle => {
        expect((handle as HTMLElement).tabIndex).toBe(0);
        expect(handle.getAttribute('role')).toBe('separator');
        expect(handle.getAttribute('aria-orientation')).toBe('vertical');
      });
    });

    it('should have aria-label for each handle', () => {
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
      TableColumnResizer.enhance(table, tableId);

      const handles = table.querySelectorAll('.table-resize-handle');

      handles.forEach((handle, index) => {
        const ariaLabel = handle.getAttribute('aria-label');
        expect(ariaLabel).toBe(`Resize column ${index + 1}`);
      });
    });
  });

  describe('ARIA announcements on width change', () => {
    it('should create ARIA live region for announcements', (done) => {
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

      // Trigger keyboard resize to create announcement
      handle.focus();
      const keyEvent = new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true
      });

      table.dispatchEvent(keyEvent);

      setTimeout(() => {
        const liveRegion = document.getElementById('table-resize-announcer');

        expect(liveRegion).not.toBeNull();
        expect(liveRegion?.getAttribute('role')).toBe('status');
        expect(liveRegion?.getAttribute('aria-live')).toBe('polite');
        expect(liveRegion?.getAttribute('aria-atomic')).toBe('true');
        expect(liveRegion?.classList.contains('sr-only')).toBe(true);
        done();
      }, 50);
    });

    it('should announce width changes to screen readers', (done) => {
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

      // Trigger resize
      handle.focus();
      const keyEvent = new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true
      });

      table.dispatchEvent(keyEvent);

      setTimeout(() => {
        const liveRegion = document.getElementById('table-resize-announcer');
        expect(liveRegion?.textContent).toContain('Column 1 resized to');
        expect(liveRegion?.textContent).toContain('pixels');
        done();
      }, 50);
    });
  });

  describe('screen reader instructions available', () => {
    it('should create resize instructions element', () => {
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

      const instructions = shell.querySelector('#resize-instructions');

      expect(instructions).not.toBeNull();
      expect(instructions?.classList.contains('sr-only')).toBe(true);
      expect(instructions?.textContent).toContain('Use arrow keys to resize');
      expect(instructions?.textContent).toContain('Home for minimum width');
      expect(instructions?.textContent).toContain('End for content width');
    });

    it('should reference instructions from resize handles', () => {
      const shell = document.createElement('div');
      shell.className = 'udo-table-shell';

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
      shell.appendChild(table);
      document.body.appendChild(shell);

      const tableId = TableColumnResizer.generateTableId(table);
      TableColumnResizer.enhance(table, tableId);

      const handles = table.querySelectorAll('.table-resize-handle');

      handles.forEach(handle => {
        const describedBy = handle.getAttribute('aria-describedby');
        expect(describedBy).toBe('resize-instructions');
      });
    });
  });

  describe('keyboard navigation prevents default scroll behavior', () => {
    it('should prevent default behavior for arrow keys', (done) => {
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

      // Create spy to check if preventDefault was called
      let preventDefaultCalled = false;
      handle.focus();

      const keyEvent = new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true,
        cancelable: true
      });

      // Override preventDefault to track if it was called
      const originalPreventDefault = keyEvent.preventDefault;
      keyEvent.preventDefault = function() {
        preventDefaultCalled = true;
        originalPreventDefault.call(this);
      };

      table.dispatchEvent(keyEvent);

      setTimeout(() => {
        expect(preventDefaultCalled).toBe(true);
        done();
      }, 50);
    });
  });

  describe('minimum width enforcement with keyboard', () => {
    it('should not allow column to go below 80px with keyboard', (done) => {
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      const th1 = document.createElement('th');
      th1.textContent = 'Col 1';
      Object.defineProperty(th1, 'offsetWidth', {
        value: 85, // Just above minimum
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

      // Press ArrowLeft twice (would go to 65px without enforcement)
      handle.focus();

      const keyEvent1 = new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true,
        cancelable: true
      });
      table.dispatchEvent(keyEvent1);

      setTimeout(() => {
        const keyEvent2 = new KeyboardEvent('keydown', {
          key: 'ArrowLeft',
          bubbles: true,
          cancelable: true
        });
        table.dispatchEvent(keyEvent2);

        setTimeout(() => {
          const newWidth = parseInt(th1.style.width);
          expect(newWidth).toBeGreaterThanOrEqual(80); // Should be clamped to minimum
          done();
        }, 50);
      }, 50);
    });
  });
});
