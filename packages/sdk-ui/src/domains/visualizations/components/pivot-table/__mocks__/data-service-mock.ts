// Mock of DataService class
export class DataServiceMock {
  private listeners: Record<string, Array<(...args: any[]) => void>> = {};

  on(eventName: string, callback: (...args: any[]) => void) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
  }

  off(eventName: string, callback: (...args: any[]) => void) {
    if (this.listeners[eventName]) {
      this.listeners[eventName] = this.listeners[eventName].filter((cb) => cb !== callback);
    }
  }

  destroy() {
    // Mock destroy method
    this.listeners = {};
  }
}
