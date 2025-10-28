// Jest setup file for DOM testing
// Mock localStorage if needed (already mocked in tests, but this provides fallback)
if (typeof window !== 'undefined' && !window.localStorage) {
  window.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
}

// Mock offsetWidth and scrollWidth for DOM element measurements
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
  configurable: true,
  value: 100,
});

Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
  configurable: true,
  value: 100,
});

// Mock offsetHeight for completeness
Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
  configurable: true,
  value: 20,
});
