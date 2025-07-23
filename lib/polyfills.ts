// Polyfill for Array.prototype.at() for older browsers
// Apply consistently on both server and client to avoid hydration mismatches
if (!Array.prototype.at) {
  Object.defineProperty(Array.prototype, 'at', {
    value: function(this: any[], index: number) {
      const len = this.length;
      const relativeIndex = Number(index);
      const k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
      
      if (k < 0 || k >= len) {
        return undefined;
      }
      
      return this[k];
    },
    writable: true,
    configurable: true
  });
}

export function setupPolyfills() {
  // Polyfill is already applied at module level
}