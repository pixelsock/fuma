// Polyfill for Array.prototype.at() for older browsers
export function setupPolyfills() {
  if (typeof window !== 'undefined' && !Array.prototype.at) {
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
}