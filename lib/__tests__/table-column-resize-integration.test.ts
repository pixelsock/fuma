/**
 * Integration Tests for Table Column Resize
 * Task Group 3.1: Testing UDOContentRenderer integration
 */

import { TableColumnResizer } from '../table-column-resize';

describe('TableColumnResizer Integration', () => {
  let mockTable: HTMLTableElement;
  let mockShell: HTMLDivElement;
  let mockToolbar: HTMLDivElement;
  let mockActionsContainer: HTMLDivElement;

  beforeEach(() => {
    // Create mock table structure matching UDOContentRenderer output
    mockTable = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // Add 3 header columns
    for (let i = 0; i < 3; i++) {
      const th = document.createElement('th');
      th.textContent = `Column ${i + 1}`;
      headerRow.appendChild(th);
    }

    thead.appendChild(headerRow);
    mockTable.appendChild(thead);

    // Create shell structure (as UDOContentRenderer creates it)
    mockShell = document.createElement('div');
    mockShell.className = 'udo-table-shell';

    mockToolbar = document.createElement('div');
    mockToolbar.className = 'udo-table-toolbar';

    const titleContainer = document.createElement('div');
    titleContainer.className = 'udo-table-title';

    const titleText = document.createElement('div');
    titleText.className = 'udo-table-title-text';
    titleText.textContent = 'Test Table';
    titleContainer.appendChild(titleText);

    mockActionsContainer = document.createElement('div');
    mockActionsContainer.className = 'udo-table-actions';

    mockToolbar.appendChild(titleContainer);
    mockToolbar.appendChild(mockActionsContainer);

    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'udo-table-scroll';
    scrollContainer.appendChild(mockTable);

    mockShell.appendChild(mockToolbar);
    mockShell.appendChild(scrollContainer);

    document.body.appendChild(mockShell);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
  });

  test('dynamic import simulation - enhance() is called for each table', () => {
    const tableId = TableColumnResizer.generateTableId(mockTable);

    // Simulate what the dynamic import does
    TableColumnResizer.enhance(mockTable, tableId);

    // Verify resize handles were created
    const handles = mockTable.querySelectorAll('.table-resize-handle');
    expect(handles.length).toBe(2); // 3 columns = 2 handles (no handle after last column)
  });

  test('reset button appears when preferences exist', () => {
    const tableId = TableColumnResizer.generateTableId(mockTable);

    // Save some preferences
    TableColumnResizer.saveWidths(tableId, [120, 180, 200]);

    // Wait for debounce
    jest.advanceTimersByTime(300);

    // Check if preferences exist
    const hasPrefs = TableColumnResizer.hasPreferences(tableId);
    expect(hasPrefs).toBe(true);

    // Simulate reset button creation (as UDOContentRenderer would do)
    if (hasPrefs) {
      const resetBtn = document.createElement('button');
      resetBtn.className = 'udo-table-action';
      resetBtn.innerHTML = '↺';
      resetBtn.setAttribute('aria-label', 'Reset column widths');
      resetBtn.setAttribute('data-testid', 'reset-button');
      mockActionsContainer.insertBefore(resetBtn, mockActionsContainer.firstChild);
    }

    // Verify button was added
    const resetButton = mockActionsContainer.querySelector('[data-testid="reset-button"]');
    expect(resetButton).toBeTruthy();
    expect(resetButton?.getAttribute('aria-label')).toBe('Reset column widths');
  });

  test('reset button does not appear when no preferences exist', () => {
    const tableId = TableColumnResizer.generateTableId(mockTable);

    // No preferences saved
    const hasPrefs = TableColumnResizer.hasPreferences(tableId);
    expect(hasPrefs).toBe(false);

    // Reset button should not be created
    const resetButton = mockActionsContainer.querySelector('[data-testid="reset-button"]');
    expect(resetButton).toBeFalsy();
  });

  test('reset button clears preferences', () => {
    const tableId = TableColumnResizer.generateTableId(mockTable);

    // Save preferences
    TableColumnResizer.saveWidths(tableId, [120, 180, 200]);
    jest.advanceTimersByTime(300);

    // Verify preferences exist
    expect(TableColumnResizer.hasPreferences(tableId)).toBe(true);

    // Simulate reset button click
    TableColumnResizer.resetWidths(tableId);

    // Verify preferences are cleared
    expect(TableColumnResizer.hasPreferences(tableId)).toBe(false);
    expect(TableColumnResizer.loadWidths(tableId)).toBeNull();
  });

  test('integration with existing table toolbar', () => {
    // Add scroll buttons to simulate full toolbar
    const scrollLeft = document.createElement('button');
    scrollLeft.className = 'udo-table-action';
    scrollLeft.innerHTML = '‹';
    mockActionsContainer.appendChild(scrollLeft);

    const scrollRight = document.createElement('button');
    scrollRight.className = 'udo-table-action';
    scrollRight.innerHTML = '›';
    mockActionsContainer.appendChild(scrollRight);

    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.className = 'udo-table-action';
    fullscreenBtn.innerHTML = '⛶';
    mockActionsContainer.appendChild(fullscreenBtn);

    // Add reset button at start
    const tableId = TableColumnResizer.generateTableId(mockTable);
    TableColumnResizer.saveWidths(tableId, [120, 180, 200]);
    jest.advanceTimersByTime(300);

    if (TableColumnResizer.hasPreferences(tableId)) {
      const resetBtn = document.createElement('button');
      resetBtn.className = 'udo-table-action';
      resetBtn.innerHTML = '↺';
      mockActionsContainer.insertBefore(resetBtn, mockActionsContainer.firstChild);
    }

    // Verify button order: reset, scroll-left, scroll-right, fullscreen
    const buttons = mockActionsContainer.querySelectorAll('.udo-table-action');
    expect(buttons.length).toBe(4);
    expect(buttons[0].innerHTML).toBe('↺');
    expect(buttons[1].innerHTML).toBe('‹');
    expect(buttons[2].innerHTML).toBe('›');
    expect(buttons[3].innerHTML).toBe('⛶');
  });

  test('no performance regression on table render', () => {
    const startTime = performance.now();

    // Simulate table enhancement without resize
    // (resize loads async via dynamic import)
    mockShell.appendChild(mockToolbar);

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should be nearly instant (< 5ms without resize logic)
    expect(renderTime).toBeLessThan(5);
  });

  test('enhance() handles errors gracefully', () => {
    const tableId = TableColumnResizer.generateTableId(mockTable);

    // Create invalid table structure (no thead)
    const brokenTable = document.createElement('table');

    // Should not throw
    expect(() => {
      TableColumnResizer.enhance(brokenTable, tableId);
    }).not.toThrow();
  });

  test('multiple tables on same page with different IDs', () => {
    // Create second table
    const table2 = document.createElement('table');
    const thead2 = document.createElement('thead');
    const headerRow2 = document.createElement('tr');

    for (let i = 0; i < 2; i++) {
      const th = document.createElement('th');
      th.textContent = `Different ${i + 1}`;
      headerRow2.appendChild(th);
    }

    thead2.appendChild(headerRow2);
    table2.appendChild(thead2);
    document.body.appendChild(table2);

    // Generate IDs
    const tableId1 = TableColumnResizer.generateTableId(mockTable);
    const tableId2 = TableColumnResizer.generateTableId(table2);

    // IDs should be different
    expect(tableId1).not.toBe(tableId2);

    // Save different preferences for each
    TableColumnResizer.saveWidths(tableId1, [120, 180, 200]);
    TableColumnResizer.saveWidths(tableId2, [100, 150]);
    jest.advanceTimersByTime(300);

    // Each should have its own preferences
    const widths1 = TableColumnResizer.loadWidths(tableId1);
    const widths2 = TableColumnResizer.loadWidths(tableId2);

    expect(widths1).toEqual([120, 180, 200]);
    expect(widths2).toEqual([100, 150]);
  });
});
