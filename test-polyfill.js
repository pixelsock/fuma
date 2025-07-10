console.log('Testing Array.prototype.at polyfill');

if (!Array.prototype.at) {
  Object.defineProperty(Array.prototype, 'at', {
    value: function(index) {
      const len = this.length;
      const relativeIndex = Number(index);
      const k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
      if (k < 0 || k >= len) {
        return undefined;
      }
      return this[k];
    },
    writable: true,
    configurable: true,
  });
  console.log('Array.prototype.at polyfill applied in test file.');
} else {
  console.log('Array.prototype.at already exists in test file.');
}

const testArray = [1, 2, 3];
console.log('testArray.at(1):', testArray.at(1));
console.log('testArray.at(-1):', testArray.at(-1));
