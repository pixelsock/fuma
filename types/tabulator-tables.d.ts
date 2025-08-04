declare module 'tabulator-tables' {
  export class TabulatorFull {
    constructor(element: string | HTMLElement, options?: any);
    destroy(): void;
    on(event: string, callback: Function): void;
  }
  
  export class Tabulator {
    constructor(element: string | HTMLElement, options?: any);
    destroy(): void;
    on(event: string, callback: Function): void;
  }
} 